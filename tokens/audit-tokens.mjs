// 색상 토큰 감사 — `npm run tokens:audit`
//
// 왜 필요한가: 대비는 토큰 하나의 성질이 아니라 **토큰과 그 토큰이 놓이는 면 사이의 관계**다.
// 값만 들여다봐서는 아무것도 알 수 없고, 화면에 적용해 눈으로 확인하는 방식은 재현되지 않는다.
// 다크모드 작업에서 보고된 문제가 거의 전부 이 틈에서 나왔다 — 테두리가 자기 면과 같은 색이 되거나,
// 라이트에서 옅던 경고색이 다크에서 쨍해지거나, 사다리 방향이 모드마다 뒤집히는 것들.
//
// 검사는 모드 하나를 보지 않는다. `light/{브랜드}` 와 `dark/{브랜드}` 를 짝으로 놓고
// **라이트에서 성립하던 관계가 다크에서도 성립하는지**를 본다. 라이트가 기준인 이유는
// 그쪽이 먼저 손으로 다듬어진 쪽이기 때문이다 (color-token-rule.md §9).
//
// 판정 규칙은 tokens/audit-rules.json 에 데이터로 있다. 이 파일은 그 규칙을 실행만 한다.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const T = JSON.parse(fs.readFileSync(path.join(HERE, 'design-tokens.json'), 'utf8'))
const RULES = JSON.parse(fs.readFileSync(path.join(HERE, 'audit-rules.json'), 'utf8'))

const STRICT = process.argv.includes('--strict')
const QUIET = process.argv.includes('--quiet')

// ── 토큰 조회 ────────────────────────────────────────────────────────────────
const flat = (o, p = [], out = {}) => {
  for (const k of Object.keys(o)) {
    if (k.startsWith('$')) continue
    const v = o[k]
    if (v && v.$type) out[[...p, k].join('/')] = v
    else if (v && typeof v === 'object') flat(v, [...p, k], out)
  }
  return out
}
const SEM = flat(T['color-semantic'])
const NAMES = Object.keys(SEM)
const node = (dotted) => dotted.split('.').reduce((a, k) => (a == null ? a : a[k]), T)

/** semantic 토큰 하나를 그 모드에서 최종 색 문자열까지 푼다. */
const resolve = (sem, mode) => {
  let raw = SEM[sem]?.$extensions?.['com.figma.modeValues']?.[mode] ?? SEM[sem]?.$value
  for (let i = 0; i < 8; i++) {
    const m = String(raw).match(/^\{(.+)\}$/)
    if (!m) return raw
    const n = node(m[1])
    if (!n) return null
    raw = n.$extensions?.['com.figma.modeValues']?.[mode] ?? n.$value
  }
  return null
}
/** 모드별 alias 문자열 자체 (값이 아니라 "어느 primitive 를 가리키는가") */
const aliasOf = (sem, mode) =>
  SEM[sem]?.$extensions?.['com.figma.modeValues']?.[mode] ?? SEM[sem]?.$value ?? null

// ── 색 계산 ──────────────────────────────────────────────────────────────────
const parse = (v) => {
  let m = String(v).match(/^#([0-9a-f]{6})$/i)
  if (m) { const i = parseInt(m[1], 16); return [(i >> 16) & 255, (i >> 8) & 255, i & 255, 1] }
  m = String(v).match(/^rgb\((\d+) (\d+) (\d+)(?: \/ ([\d.]+))?\)$/)
  return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null
}
// 반투명 토큰은 그 자체로 색이 없다 — 반드시 바탕에 합성해서 재야 한다.
const over = (f, b) => (f[3] >= 1 ? f : [0, 1, 2].map((i) => f[i] * f[3] + b[i] * (1 - f[3])).concat([1]))
const lum = (c) => {
  const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])
}
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
const hex = (c) => '#' + c.slice(0, 3).map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')
// 색감(chroma) — "얼마나 쨍한가". 명도 램프를 미러링해도 이건 보존되지 않아서 따로 본다.
// HSV 채도((max-min)/max)를 쓰면 안 된다: 어두운 색이면 색감과 무관하게 무조건 높게 나와서
// 짙은 남색 배경 같은 평범한 값이 전부 걸린다. 절대 chroma(max-min)는 그 함정이 없다.
const chroma = (c) => Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2])

// ── 모드 쌍 찾기 ─────────────────────────────────────────────────────────────
// 모드 이름을 하드코딩하지 않는다. `light/X` 와 `dark/X` 가 둘 다 있는 브랜드만 검사한다.
const ALL_MODES = T['color-semantic'].$extensions?.['com.figma.modes'] ?? []
const PAIRS = ALL_MODES.filter((m) => m.startsWith('light/'))
  .map((l) => ({ brand: l.slice('light/'.length), light: l, dark: 'dark/' + l.slice('light/'.length) }))
  .filter((p) => ALL_MODES.includes(p.dark))
const DARKLESS = ALL_MODES.filter((m) => m.startsWith('light/') && !ALL_MODES.includes('dark/' + m.slice(6)))

// ── 맥락 판정 (audit-rules.json 의 contextRules) ──────────────────────────────
const { page: PAGE, surface: SURF, thresholds: TH, dimStates: DIM } = RULES
const expand = (tpl, v) => tpl
  .replace('{surface}', SURF).replace('{page}', PAGE)
  .replace('{group}', v.group).replace('{state}', v.state).replace('{scale}', v.state)

function contextOf(sem) {
  const seg = sem.split('/')
  const state = seg[seg.length - 1]
  const role = seg[seg.length - 2]
  const group = seg.slice(0, -2).join('/')
  const v = { group, state }
  for (const rule of RULES.contextRules) {
    const m = rule.match
    if (m.token && sem !== expand(m.token, v)) continue
    if (m.prefix && !sem.startsWith(m.prefix)) continue
    if (m.groupPrefix && !sem.startsWith(m.groupPrefix)) continue
    if (m.role) { const roles = Array.isArray(m.role) ? m.role : [m.role]; if (!roles.includes(role)) continue }
    for (const c of rule.context) {
      const ctx = expand(c, v)
      if (ctx !== sem && SEM[ctx]) return { ctx, rule: rule.id }
    }
  }
  return null
}

// ── 측정 ─────────────────────────────────────────────────────────────────────
/** 한 모드에서 토큰을 자기 맥락 위에 합성해 대비·방향·채도를 잰다. */
function measure(sem, ctx, mode) {
  const pageC = parse(resolve(PAGE, mode))
  if (!pageC) return null
  const ctxRaw = parse(resolve(ctx, mode))
  const tokRaw = parse(resolve(sem, mode))
  if (!ctxRaw || !tokRaw) return null
  const c = over(ctxRaw, pageC)
  const t = over(tokRaw, c)
  return { r: ratio(t, c), dl: lum(t) - lum(c), chroma: chroma(t), tok: hex(t), ctx: hex(c) }
}

const isDim = (sem) => DIM.some((d) => sem.endsWith('/' + d))
// 바탕을 토큰으로 표현할 수 없는 그룹은 대비 검사에서 빼되, 뺐다는 사실을 보고에 남긴다 —
// 조용히 건너뛰면 "검사해서 통과했다"로 오해된다.
const EXEMPT = RULES.contrastExempt ?? []
const isExempt = (sem) => EXEMPT.some((e) => sem.startsWith(e.prefix))
const accepted = new Set(RULES.accepted.filter((a) => a.check === 'identical').map((a) => a.pair))
// 완전 투명끼리는 "같은 색"이 아니라 둘 다 "색 없음" 이다. 테두리를 안 쓰는 설계를
// 충돌로 보고하면 거짓 양성이 된다.
const isClear = (v) => { const c = parse(v); return !!c && c[3] === 0 }
const acceptedPair = (a, b) => accepted.has(`${a} == ${b}`) || accepted.has(`${b} == ${a}`)

// ── 검사 ─────────────────────────────────────────────────────────────────────
const findings = { hard: [], soft: [] }
const add = (level, check, brand, msg) => findings[level].push({ check, brand, msg })

// E. 모드 값 누락 — 이게 비면 나머지 검사가 전부 거짓음성이 된다. 가장 먼저 본다.
for (const sem of NAMES) {
  const mv = SEM[sem].$extensions?.['com.figma.modeValues'] ?? {}
  const missing = ALL_MODES.filter((m) => mv[m] === undefined)
  if (missing.length) add('hard', '모드 누락', '-', `${sem} — ${missing.join(', ')}`)
}

for (const { brand, light, dark } of PAIRS) {
  // A. 맥락 대비가 모드 간에 보존되는가
  const rows = []
  for (const sem of NAMES) {
    const c = contextOf(sem)
    if (!c) continue
    const L = measure(sem, c.ctx, light), D = measure(sem, c.ctx, dark)
    if (!L || !D) continue
    rows.push({ sem, ctx: c.ctx, rule: c.rule, L, D })
  }
  const live = rows.filter((x) => !isDim(x.sem) && !isExempt(x.sem))
  const fmt = (x) => `${x.sem} on ${x.ctx}  ${x.L.r.toFixed(2)} → ${x.D.r.toFixed(2)}  (${x.L.tok}/${x.L.ctx} → ${x.D.tok}/${x.D.ctx})`

  for (const x of live.filter((x) => x.L.r >= TH.visible && x.D.r < TH.visible))
    add('soft', '붕괴', brand, fmt(x))
  for (const x of live.filter((x) => Math.sign(x.L.dl) !== Math.sign(x.D.dl) && x.D.r < x.L.r * TH.collapseDrop && x.L.r >= TH.visible))
    add('soft', '방향 뒤집힘', brand, fmt(x))
  for (const x of live.filter((x) => x.L.r >= 1.5 && x.D.r < x.L.r * TH.weakenDrop && x.D.r >= TH.visible))
    add('soft', '대비 약화', brand, fmt(x))
  for (const x of live.filter((x) => x.L.r >= 1.1 && x.D.r > x.L.r * TH.overshootGain))
    add('soft', '과하게 세짐', brand, fmt(x))

  // F. 색감 비대칭 — 색 패밀리의 램프는 명도 램프가 아니라 **채도 램프**다.
  //    (예: warning-red 는 50 에서 900 으로 갈수록 색감이 계속 세진다)
  //    그래서 위치를 미러링하면 라이트에서 옅던 경고색이 다크에서 쨍한 빨강이 된다.
  //    "절제"는 대비가 아니라 색감으로 읽히므로 대비 검사로는 안 잡힌다.
  for (const x of live) {
    if (x.L.chroma === 0) continue
    const gain = x.D.chroma / x.L.chroma
    if (gain >= TH.chromaGain && x.D.chroma >= TH.chromaFloor)
      add('soft', '색이 쨍해짐', brand,
        `${x.sem}  색감 ${x.L.chroma} → ${x.D.chroma} (${gain.toFixed(1)}배)  ${x.L.tok} → ${x.D.tok}`)
  }

  // B. 동일색 — 같은 색이 되는 게 왜 문제인지는 자리마다 다르므로 세 종류로 나눈다.
  for (const mode of [light, dark]) {
    // B-1. 면과 그 위에 올라가는 테두리·잉크가 같은 색  → 요소가 통째로 사라진다. 결함.
    for (const sem of NAMES) {
      const seg = sem.split('/'); const st = seg.pop(); const role = seg.pop()
      if (role !== 'border' && role !== 'inner') continue
      const bg = seg.join('/') + '/bg/' + st
      if (!SEM[bg] || resolve(bg, mode) !== resolve(sem, mode)) continue
      if (acceptedPair(bg, sem) || isClear(resolve(sem, mode))) continue
      add('hard', '요소가 자기 면에 묻힘', brand, `[${mode}] ${bg} == ${sem}  ${resolve(bg, mode)}`)
    }
    const byRole = {}
    for (const sem of NAMES) {
      const seg = sem.split('/'); const st = seg.pop(); const role = seg.pop()
      ;(byRole[seg.join('/') + '|' + role] = byRole[seg.join('/') + '|' + role] || []).push(sem)
    }
    for (const key of Object.keys(byRole)) {
      const list = byRole[key]
      const interactive = key.startsWith('interactive/')
      for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j]
        if (resolve(a, mode) !== resolve(b, mode) || acceptedPair(a, b)) continue
        if (isClear(resolve(a, mode))) continue   // 둘 다 '색 없음' 이면 충돌이 아니다
        if (interactive) {
          // B-2. interactive 의 두 **상태**가 같은 색  → 사용자가 상태를 구분할 수 없다. 결함.
          add('hard', '상태 구분 사라짐', brand, `[${mode}] ${a} == ${b}  ${resolve(a, mode)}`)
        } else {
          // B-3. non-interactive 의 두 **스케일**이 같은 색  → 결함은 아니다.
          //      둘을 한 화면에 같이 쓰지는 않으니까. 다만 "한 단계 더 진하게"가
          //      그 구간에서 아무 일도 하지 않는다는 뜻이라 사다리 해상도가 준 것이다.
          add('soft', '사다리 해상도', brand, `[${mode}] ${a} == ${b}  ${resolve(a, mode)}`)
        }
      }
    }
  }

  // D. 사다리 방향 — 이름 순서(lightest→darkest)가 실제 밝기 순서와 맞는가.
  //    bg 사다리만 본다: 면은 깊이를 나타내므로 방향이 뒤집히면 올라온 것이 가라앉는다 (§9).
  //    inner/border 는 "대비 세기"라 모드에 따라 뒤집히는 게 정상이므로 제외한다.
  const ORDER = ['lightest', 'lighter', 'light', 'base', 'dark', 'darker', 'darkest']
  const groups = [...new Set(NAMES.filter((n) => n.split('/').slice(-2, -1)[0] === 'bg')
    .map((n) => n.split('/').slice(0, -2).join('/')))]
  for (const g of groups) {
    const ladder = ORDER.map((s) => `${g}/bg/${s}`).filter((n) => SEM[n])
    if (ladder.length < 3) continue
    const dir = (mode) => {
      const L = ladder.map((n) => { const c = parse(resolve(n, mode)); return c ? lum(over(c, parse(resolve(PAGE, mode)))) : null })
      if (L.some((x) => x === null)) return null
      let down = 0, up = 0
      for (let i = 1; i < L.length; i++) { if (L[i] < L[i - 1] - 1e-6) down++; else if (L[i] > L[i - 1] + 1e-6) up++ }
      return down && !up ? '어두워짐' : up && !down ? '밝아짐' : '뒤섞임'
    }
    const dl = dir(light), dd = dir(dark)
    if (dl && dd && dl !== dd)
      add('soft', '사다리 방향', brand, `${g}/bg/*  라이트 ${dl} → 다크 ${dd}  (${ladder.map((n) => n.split('/').pop()).join('>')})`)
  }

  // G. 유리 × 바탕 — 유리는 반투명이라 바탕 없이는 잴 수 없다.
  //    평평한 앱 서피스 위에서 재면 라이트에서 늘 1.00 이 나와 아무것도 안 걸린다.
  //    그래서 사진·지도·배경화면을 고정색으로 두고 그 위에서 두 가지만 본다 —
  //    ① 사다리의 가장 진한 단계가 바탕에서 구분되는가(아니면 그 바탕에서 이 유리는 쓸 수 없다)
  //    ② 면으로 성립하는 단계 위에서 지정 잉크가 읽히는가
  const BACKDROPS = RULES.backdrops ?? {}
  for (const chk of RULES.glassChecks ?? []) {
    const steps = ORDER.map((sc) => chk.prefix + sc).filter((n) => SEM[n])
    if (!steps.length) continue
    for (const bdId of chk.on) {
      const bd = BACKDROPS[bdId]
      if (!bd) { add('hard', '감사 설정', brand, `glassChecks 가 없는 바탕 "${bdId}" 를 가리킨다`); continue }
      const back = parse(bd.color)
      for (const mode of [light, dark]) {
        const modeLabel = mode === light ? '라이트' : '다크'
        // ① 사다리에서 가장 잘 보이는 단계. 어느 쪽 끝이 불투명한지는 램프마다 달라서
        //    (흰 유리는 lightest, 검은 유리는 darkest) 위치로 가정하지 않고 재서 고른다.
        const best = steps
          .map((n) => ({ n, r: ratio(over(parse(resolve(n, mode)), back), back) }))
          .sort((a, b) => b.r - a.r)[0]
        if (best.r < TH.visible)
          add('soft', '유리가 바탕에 묻힘', brand,
            `[${modeLabel}] ${chk.prefix}* on ${bd.label}(${bd.color}) — 가장 잘 보이는 단계(${best.n.split('/').pop()})조차 ${best.r.toFixed(2)} 로 바탕과 구분되지 않는다`)
        // ② 면으로 성립하는 단계 위의 잉크
        if (!chk.ink || !SEM[chk.ink]) continue
        for (const sem of steps) {
          const pill = over(parse(resolve(sem, mode)), back)
          if (ratio(pill, back) < TH.visible) continue
          const ink = over(parse(resolve(chk.ink, mode)), pill)
          if (ratio(ink, pill) < TH.text)
            add('soft', '유리 위 잉크가 안 읽힘', brand,
              `[${modeLabel}] ${chk.ink} on ${sem} / ${bd.label}  ${ratio(ink, pill).toFixed(2)} (면 ${hex(pill)})`)
        }
      }
    }
  }

  // C. 잉크 가독성 — §5 는 "같은 그룹이면 어떤 스케일 조합이든 정상"이라고 하지만,
  //    실제로 읽히는 조합은 일부뿐이다. 양쪽 모드 다 본문 기준에 못 미치는 조합을 센다.
  const inkGroups = [...new Set(NAMES.filter((n) => n.split('/').slice(-2, -1)[0] === 'inner' && !n.startsWith('interactive/'))
    .map((n) => n.split('/').slice(0, -2).join('/')))]
  let pairsTotal = 0, pairsBad = 0
  const worst = []
  for (const g of inkGroups) {
    const bgs = ORDER.map((s) => `${g}/bg/${s}`).filter((n) => SEM[n])
    const inks = ORDER.map((s) => `${g}/inner/${s}`).filter((n) => SEM[n])
    for (const b of bgs) for (const k of inks) {
      const rs = [light, dark].map((m) => {
        const pageC = parse(resolve(PAGE, m))
        const bc = over(parse(resolve(b, m)), pageC)
        return ratio(over(parse(resolve(k, m)), bc), bc)
      })
      pairsTotal++
      if (rs.every((r) => r < TH.text)) { pairsBad++; worst.push({ b, k, rs }) }
    }
  }
  if (pairsBad)
    add('soft', '잉크 조합', brand,
      `그룹 안 bg×inner ${pairsTotal}조합 중 ${pairsBad}개가 양쪽 모드 모두 본문 대비 ${TH.text} 미달 — §5 의 "같은 그룹이면 어떤 스케일이든 정상" 은 대비를 보장하지 않는다`)
}

// ── 보고 ─────────────────────────────────────────────────────────────────────
const brandList = PAIRS.map((p) => p.brand).join(', ') || '(없음)'
console.log(`색상 토큰 감사 — 토큰 ${NAMES.length}개 · 검사한 명도 쌍 ${PAIRS.length}개 (${brandList})`)
if (DARKLESS.length) console.log(`  다크 모드가 아직 없는 브랜드 ${DARKLESS.length}개: ${DARKLESS.join(', ')}`)
for (const e of EXEMPT) {
  const n = NAMES.filter((x) => x.startsWith(e.prefix)).length
  if (n) console.log(`  대비 검사 제외 — ${e.prefix}* ${n}개: ${e.why}`)
}

const show = (level, title) => {
  const list = findings[level]
  if (!list.length) { console.log(`\n${title} — 없음`); return }
  const byCheck = {}
  for (const f of list) (byCheck[f.check] = byCheck[f.check] || []).push(f)
  console.log(`\n${title} — ${list.length}건`)
  for (const check of Object.keys(byCheck)) {
    const items = byCheck[check]
    console.log(`\n  ■ ${check}  ${items.length}건`)
    const limit = QUIET ? 3 : items.length
    for (const f of items.slice(0, limit)) console.log(`     ${f.msg}`)
    if (items.length > limit) console.log(`     … 외 ${items.length - limit}건`)
  }
}
show('hard', '━━━ 결함 (구분이 사라지거나 값이 비어 있음)')
show('soft', '━━━ 확인 필요 (모드 간 관계가 달라짐)')

console.log(`\n━━━ 요약 ━━━`)
console.log(`결함 ${findings.hard.length}건 · 확인 필요 ${findings.soft.length}건`)
if (findings.hard.length) {
  console.log('\n❌ 결함이 있습니다. 같은 자리에서 두 색이 똑같아지면 그 구분은 화면에서 사라집니다.')
  console.log('   의도한 것이라면 tokens/audit-rules.json 의 accepted 에 이유와 함께 추가하세요.')
  process.exit(1)
}
if (STRICT && findings.soft.length) {
  console.log('\n❌ --strict: 확인 필요 항목이 남아 있습니다.')
  process.exit(1)
}
console.log('\n✅ 결함 없음.')
