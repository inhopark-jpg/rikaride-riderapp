// 색상 토큰 감사 — `npm run tokens:audit`
//
// 왜 필요한가: 대비는 토큰 하나의 성질이 아니라 **토큰과 그 토큰이 놓이는 바탕 사이의 관계**다.
// 값만 들여다봐서는 아무것도 알 수 없고, 화면에 적용해 눈으로 확인하는 방식은 재현되지 않는다.
// 다크모드 작업에서 보고된 문제가 거의 전부 이 틈에서 나왔다 — 테두리가 자기 면과 같은 색이 되거나,
// 라이트에서 옅던 경고색이 다크에서 쨍해지거나, 사다리 방향이 모드마다 뒤집히는 것들.
//
// 검사는 모드 하나를 보지 않는다. `light/{브랜드}` 와 `dark/{브랜드}` 를 짝으로 놓고
// **라이트에서 성립하던 관계가 다크에서도 성립하는지**를 본다. 라이트가 기준인 이유는
// 그쪽이 먼저 손으로 다듬어진 쪽이기 때문이다 (color-token-rule.md §9).
//
// 대비는 권장 기준이다 (§5). 대비에 관한 검사는 전부 '확인 필요'로만 보고하고,
// 종료 코드 1 은 값이 비었거나 두 색이 똑같아져 구분이 사라진 '결함'에만 쓴다.
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

// ── 이름 패턴 ────────────────────────────────────────────────────────────────
// 세그먼트 단위. `*` 는 아무 세그먼트, `{x}` 는 그 세그먼트를 잡는다. `**` 는 전부.
const capture = (tpl, name) => {
  if (tpl === '**') return {}
  const a = tpl.split('/'), b = name.split('/')
  if (a.length !== b.length) return null
  const cap = {}
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '*') continue
    const m = a[i].match(/^\{(\w+)\}$/)
    if (m) {
      if (cap[m[1]] !== undefined && cap[m[1]] !== b[i]) return null
      cap[m[1]] = b[i]
      continue
    }
    if (a[i] !== b[i]) return null
  }
  return cap
}
const { page: PAGE, surface: SURF, thresholds: TH, dimStates: DIM } = RULES
const fill = (tpl, cap) => tpl.replace(/\{(\w+)\}/g, (all, k) =>
  k === 'surface' ? SURF : k === 'page' ? PAGE : cap[k] ?? all)
const allowed = (cap, where) => !where || Object.entries(where).every(([k, vs]) => vs.includes(cap[k]))
const matching = (tpl, where) => NAMES.filter((n) => { const c = capture(tpl, n); return c && allowed(c, where) })

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

// ── 바탕 스택 ────────────────────────────────────────────────────────────────
// 스택은 바닥부터 위로 쌓는 레이어 목록이다 (color-token-rule.md §8 「배경 스택」).
// `@이름` 은 사진·지도 같은 고정 바탕, 나머지는 토큰. 반투명 레이어는 그 아래에 합성한다.
const BACKDROPS = RULES.backdrops ?? {}
const isBackdrop = (layer) => layer.startsWith('@')
const label = (layer) => (isBackdrop(layer) ? BACKDROPS[layer.slice(1)]?.label ?? layer : layer)
function compose(stack, mode) {
  let c = null
  for (const layer of stack) {
    const v = isBackdrop(layer) ? parse(BACKDROPS[layer.slice(1)]?.color) : parse(resolve(layer, mode))
    if (!v) return null
    c = c ? over(v, c) : v[3] >= 1 ? v : over(v, parse(resolve(PAGE, mode)))
  }
  return c
}
/** 한 모드에서 토큰을 스택 위에 합성해 대비·방향·채도를 잰다. */
function measure(sem, stack, mode) {
  const c = compose(stack, mode)
  const raw = parse(resolve(sem, mode))
  if (!c || !raw) return null
  const t = over(raw, c)
  return { r: ratio(t, c), dl: lum(t) - lum(c), chroma: Math.round(chroma(t)), tok: hex(t), ctx: hex(c), ctxL: lum(c) }
}

// ── 맥락 판정 (audit-rules.json 의 contextRules) ──────────────────────────────
function contextOf(sem) {
  for (const rule of RULES.contextRules) {
    const cap = capture(rule.match, sem)
    if (!cap) continue
    if (rule.skip) return { skip: rule.skip, rule: rule.id }
    for (const cand of rule.stacks) {
      const stack = cand.map((l) => fill(l, cap))
      if (stack.every((l) => isBackdrop(l) || SEM[l])) return { stack, rule: rule.id }
    }
    return null
  }
  return null
}
const CTX = Object.fromEntries(NAMES.map((n) => [n, contextOf(n)]))
const top = (stack) => stack[stack.length - 1]
const isDim = (sem) => DIM.some((d) => sem.endsWith('/' + d))
const short = (n) => n.split('/').pop()

// accepted — 의도된 동일색. 한 번도 걸리지 않은 항목은 이름이 바뀌어 죽은 예외일 수 있어 끝에 알린다.
const accepted = new Map(RULES.accepted.filter((a) => a.check === 'identical').map((a) => [a.pair, 0]))
const acceptedPair = (a, b) => {
  for (const k of [`${a} == ${b}`, `${b} == ${a}`]) if (accepted.has(k)) { accepted.set(k, accepted.get(k) + 1); return true }
  return false
}
// 완전 투명끼리는 "같은 색"이 아니라 둘 다 "색 없음" 이다. 테두리를 안 쓰는 설계를
// 충돌로 보고하면 거짓 양성이 된다.
const isClear = (v) => { const c = parse(v); return !!c && c[3] === 0 }

// ── 검사 ─────────────────────────────────────────────────────────────────────
const findings = { hard: [], soft: [] }
const add = (level, check, brand, msg) => findings[level].push({ check, brand, msg })

const ALL_MODES = T['color-semantic'].$extensions?.['com.figma.modes'] ?? []
const PAIRS = ALL_MODES.filter((m) => m.startsWith('light/'))
  .map((l) => ({ brand: l.slice('light/'.length), light: l, dark: 'dark/' + l.slice('light/'.length) }))
  .filter((p) => ALL_MODES.includes(p.dark))
const DARKLESS = ALL_MODES.filter((m) => m.startsWith('light/') && !ALL_MODES.includes('dark/' + m.slice(6)))

// E. 모드 값 누락 — 이게 비면 나머지 검사가 전부 거짓음성이 된다. 가장 먼저 본다.
for (const sem of NAMES) {
  const mv = SEM[sem].$extensions?.['com.figma.modeValues'] ?? {}
  const missing = ALL_MODES.filter((m) => mv[m] === undefined)
  if (missing.length) add('hard', '모드 누락', '-', `${sem} — ${missing.join(', ')}`)
}

/** 네 유형 중 모든 모드에서 본문 권장 기준을 넘는 것이 있는가 (§5). */
function readable(stack, modes) {
  const rows = RULES.inkTypes.filter((t) => SEM[t]).map((t) => {
    const rs = modes.map((m) => measure(t, stack, m)?.r ?? 0)
    return { t, rs, min: Math.min(...rs) }
  }).sort((a, b) => b.min - a.min)
  return { ok: rows.some((x) => x.min >= TH.text), best: rows[0] }
}
const fmtBest = (b, modes) => `가장 나은 ${b.t.split('/').slice(2, 3)} ${b.rs.map((r) => r.toFixed(2)).join(' / ')} (${modes.length === 2 ? '라이트 / 다크' : modes.join(' / ')})`

for (const { brand, light, dark } of PAIRS) {
  const modes = [light, dark]
  const modeLabel = (m) => (m === light ? '라이트' : '다크')

  // A. 맥락 대비가 모드 간에 보존되는가
  const rows = []
  for (const sem of NAMES) {
    const c = CTX[sem]
    if (!c || c.skip || top(c.stack) === sem) continue
    const L = measure(sem, c.stack, light), D = measure(sem, c.stack, dark)
    if (!L || !D) continue
    rows.push({ sem, stack: c.stack, L, D })
  }
  const live = rows.filter((x) => !isDim(x.sem))
  const fmt = (x) => `${x.sem} on ${x.stack.map(label).join(' + ')}  ${x.L.r.toFixed(2)} → ${x.D.r.toFixed(2)}  (${x.L.tok}/${x.L.ctx} → ${x.D.tok}/${x.D.ctx})`

  for (const x of live.filter((x) => x.L.r >= TH.visible && x.D.r < TH.visible))
    add('soft', '붕괴', brand, fmt(x))
  // 바탕도 모드를 따라 밝음↔어두움이 뒤집히면 잉크 방향이 뒤집히는 게 정상이다 (default·inverse 쌍).
  //    바탕이 그대로인데 토큰만 뒤집힌 경우만 본다.
  const ctxFlips = (x) => (x.L.ctxL > 0.18) !== (x.D.ctxL > 0.18)
  for (const x of live.filter((x) => !ctxFlips(x) && Math.sign(x.L.dl) !== Math.sign(x.D.dl) && x.D.r < x.L.r * TH.collapseDrop && x.L.r >= TH.visible))
    add('soft', '방향 뒤집힘', brand, fmt(x))
  for (const x of live.filter((x) => x.L.r >= 1.5 && x.D.r < x.L.r * TH.weakenDrop && x.D.r >= TH.visible))
    add('soft', '대비 약화', brand, fmt(x))
  for (const x of live.filter((x) => x.L.r >= 1.1 && x.D.r > x.L.r * TH.overshootGain))
    add('soft', '과하게 세짐', brand, fmt(x))

  // F. 색감 비대칭 — 색 패밀리의 램프는 명도 램프가 아니라 **채도 램프**다.
  //    그래서 위치를 미러링하면 라이트에서 옅던 경고색이 다크에서 쨍한 빨강이 된다.
  //    "절제"는 대비가 아니라 색감으로 읽히므로 대비 검사로는 안 잡힌다.
  for (const x of live) {
    if (x.L.chroma === 0) continue
    const gain = x.D.chroma / x.L.chroma
    if (gain >= TH.chromaGain && x.D.chroma >= TH.chromaFloor)
      add('soft', '색이 쨍해짐', brand,
        `${x.sem}  색감 ${x.L.chroma} → ${x.D.chroma} (${gain.toFixed(1)}배)  ${x.L.tok} → ${x.D.tok}`)
  }

  // H. 잉크 권장 대비 — 자기 바탕 위에서 본문 기준(4.5)에 못 미치는 잉크. 위반이 아니라 확인 대상 (§5·§8).
  for (const sem of NAMES.filter((n) => RULES.inkChecks.some((p) => capture(p, n)))) {
    const c = CTX[sem]
    if (!c || c.skip) continue
    const bad = modes.map((m) => ({ m, x: measure(sem, c.stack, m) })).filter(({ x }) => x && x.r < TH.text)
    if (bad.length)
      add('soft', '잉크 권장 대비 미달', brand,
        `${sem} on ${c.stack.map(label).join(' + ')}  ${bad.map(({ m, x }) => `${modeLabel(m)} ${x.r.toFixed(2)}`).join(', ')} (권장 ${TH.text})`)
  }

  // C. 읽히는 글자 유형이 있는가 — §5 「네 유형 중 어느 것도 모든 모드에서 기준을 넘지 못하면 모드 고정 검토」.
  for (const sem of NAMES.filter((n) => RULES.readableSurfaces.some((p) => capture(p, n)))) {
    const c = CTX[sem]
    if (!c || c.skip) continue
    const stack = top(c.stack) === sem ? c.stack : [...c.stack, sem]
    const { ok, best } = readable(stack, modes)
    if (!ok && best)
      add('soft', '읽히는 글자 유형 없음', brand, `${sem} on ${c.stack.map(label).join(' + ')} — ${fmtBest(best, modes)} · §10 모드 고정 검토`)
  }

  // B. 동일색 — 같은 색이 되는 게 왜 문제인지는 자리마다 다르므로 세 종류로 나눈다.
  for (const mode of modes) {
    // B-1. 테두리·잉크가 바로 아래 면 위에서 합성해도 같은 색 → 요소가 통째로 사라진다. 결함.
    //      값이 같아도 반투명이면 겹쳐서 진해지므로 보인다 — 값이 아니라 합성 결과로 판정한다.
    for (const sem of NAMES) {
      const c = CTX[sem]
      if (!c || c.skip || isBackdrop(top(c.stack))) continue
      const under = top(c.stack)
      if (under === sem || !/^(stroke|on-surface)\/|^interactive\/[^/]+\/(stroke|on-surface)\//.test(sem)) continue
      if (isClear(resolve(sem, mode)) || (measure(sem, c.stack, mode)?.r ?? 2) >= 1.01) continue
      if (acceptedPair(under, sem)) continue
      add('hard', '요소가 자기 면에 묻힘', brand, `[${mode}] ${sem} on ${under}  ${resolve(sem, mode)} / ${resolve(under, mode)}`)
    }
    // B-2. interactive 의 두 **상태**가 세 역할 전부에서 같은 색 → 사용자가 상태를 구분할 수 없다. 결함.
    //      §3 — 역할마다 독립적으로 상태가 바뀔 수 있으므로 한 역할만 같은 것은 정상이다.
    const variants = [...new Set(NAMES.filter((n) => n.startsWith('interactive/')).map((n) => n.split('/')[1]))]
    const look = (v, role, st) => {
      const own = `interactive/${v}/${role}/${st}`, def = `interactive/${v}/${role}/default`
      return SEM[own] ? resolve(own, mode) : SEM[def] ? resolve(def, mode) : 'clear'
    }
    for (const v of variants) {
      const states = RULES.stateSet.filter((st) => ['surface', 'stroke', 'on-surface'].some((r) => SEM[`interactive/${v}/${r}/${st}`]))
      for (let i = 0; i < states.length; i++) for (let j = i + 1; j < states.length; j++) {
        const a = states[i], b = states[j]
        if (!['surface', 'stroke', 'on-surface'].every((r) => look(v, r, a) === look(v, r, b))) continue
        if (acceptedPair(`interactive/${v}/${a}`, `interactive/${v}/${b}`)) continue
        add('hard', '상태 구분 사라짐', brand, `[${mode}] interactive/${v} 의 ${a} == ${b} — surface·stroke·on-surface 전부 같음`)
      }
    }
  }

  // D. 사다리 — 규칙에 적힌 순서대로, 재는 바탕에서 멀어질수록 대비가 커져야 한다.
  //    D-1 역행: 한 모드 안에서 되돌아가면 "한 단계 더" 가 그 구간에서 반대로 작동한다.
  //    D-2 해상도: 두 단계가 같은 색이면 그 구간에서 단계가 아무 일도 하지 않는다 (결함은 아님).
  //    D-3 방향: direction: same 인 사다리는 두 모드에서 밝기 방향도 같아야 한다.
  for (const lad of RULES.ladders.list) {
    const prefixes = [...new Set(NAMES.map((n) => {
      const cap = capture(lad.prefix + '*', n)
      return cap ? fill(lad.prefix, cap) : null
    }).filter(Boolean))]
    for (const pre of prefixes) {
      const steps = lad.steps.map((s) => pre + s).filter((n) => SEM[n] && CTX[n] && !CTX[n].skip)
      if (steps.length < 2) continue
      // origin: first — 위치 사다리는 각 단계를 첫 단계(기준) 위에서 잰다. 그 외에는 각자 바탕 위에서.
      const stackOf = (n) => (lad.origin === 'first' ? [...CTX[steps[0]].stack, steps[0]] : CTX[n].stack)
      const seq = (mode) => steps.map((n) => measure(n, stackOf(n), mode))
      for (const mode of modes) {
        const q = seq(mode)
        if (q.some((x) => !x)) continue
        const r = q.map((x, k) => (lad.origin === 'first' && k === 0 ? 1 : x.r))
        const back = []
        for (let k = 1; k < r.length; k++)
          if (r[k] < r[k - 1] - 0.02) back.push(`${short(steps[k - 1])}(${r[k - 1].toFixed(2)})→${short(steps[k])}(${r[k].toFixed(2)})`)
        if (back.length)
          add('soft', '사다리 역행', brand, `[${modeLabel(mode)}] ${pre}* ${back.join(' , ')}`)
        for (let k = 1; k < steps.length; k++)
          if (resolve(steps[k], mode) === resolve(steps[k - 1], mode))
            add('soft', '사다리 해상도', brand, `[${modeLabel(mode)}] ${steps[k - 1]} == ${steps[k]}  ${resolve(steps[k], mode)}`)
      }
      if (lad.direction !== 'same') continue
      const dir = (mode) => {
        const a = compose([...CTX[steps[0]].stack, steps[0]], mode), b = compose([...CTX[steps.at(-1)].stack, steps.at(-1)], mode)
        if (!a || !b || Math.abs(lum(b) - lum(a)) < 1e-4) return null
        return lum(b) < lum(a) ? '어두워짐' : '밝아짐'
      }
      const dl = dir(light), dd = dir(dark)
      if (dl && dd && dl !== dd)
        add('soft', '사다리 방향', brand, `${pre}* 라이트 ${dl} → 다크 ${dd}  (${steps.map(short).join('>')})`)
    }
  }

  // G. 반투명 면 × 대표 바탕 — floating 은 아래에 있는 것 위에 떠 있어서 앱 면 위에서만 재면
  //    라이트에서 늘 1.00 이 나와 아무것도 안 걸린다. 사진·지도를 고정색으로 두고 그 위에서 본다 —
  //    ① 사다리의 가장 잘 보이는 단계가 바탕에서 구분되는가
  //    ② 면으로 성립하는 단계 위에 읽히는 글자 유형이 있는가 (C 와 같은 기준)
  //    ③ 테두리 사다리의 가장 잘 보이는 단계가 그 면에서 구분되는가
  for (const chk of RULES.glassChecks ?? []) {
    const faces = matching(chk.faces, chk.where)
    const groups = {}
    for (const f of faces) { const k = f.split('/').slice(0, -1).join('/'); (groups[k] = groups[k] || []).push(f) }
    for (const bdId of chk.on) {
      const bd = BACKDROPS[bdId]
      if (!bd) { add('hard', '감사 설정', brand, `glassChecks 가 없는 바탕 "${bdId}" 를 가리킨다`); continue }
      for (const list of Object.values(groups)) {
        for (const mode of modes) {
          const best = list.map((n) => ({ n, r: measure(n, ['@' + bdId], mode)?.r ?? 0 })).sort((a, b) => b.r - a.r)[0]
          if (best.r < TH.visible)
            add('soft', '반투명 면이 바탕에 묻힘', brand,
              `[${modeLabel(mode)}] ${list[0].split('/').slice(0, -1).join('/')}/* on ${bd.label}(${bd.color}) — 가장 잘 보이는 ${short(best.n)} 조차 ${best.r.toFixed(2)}`)
          if (!chk.stroke) continue
          const strokes = list.map((f) => {
            const s = fill(chk.stroke, capture(chk.faces, f))
            return SEM[s] ? { s, r: measure(s, ['@' + bdId, f], mode)?.r ?? 0 } : null
          }).filter(Boolean).sort((a, b) => b.r - a.r)
          if (strokes.length && strokes[0].r < TH.visible)
            add('soft', '테두리가 면에 묻힘', brand,
              `[${modeLabel(mode)}] ${strokes[0].s.split('/').slice(0, -1).join('/')}/* on ${bd.label} — 가장 잘 보이는 ${short(strokes[0].s)} 조차 ${strokes[0].r.toFixed(2)}`)
        }
        for (const f of list) {
          if (modes.some((m) => (measure(f, ['@' + bdId], m)?.r ?? 0) < TH.visible)) continue
          const { ok, best } = readable(['@' + bdId, f], modes)
          if (!ok && best)
            add('soft', '읽히는 글자 유형 없음', brand, `${f} on ${bd.label} — ${fmtBest(best, modes)} · §10 모드 고정 검토`)
        }
      }
    }
  }
}

// ── 보고 ─────────────────────────────────────────────────────────────────────
const brandList = PAIRS.map((p) => p.brand).join(', ') || '(없음)'
console.log(`색상 토큰 감사 — 토큰 ${NAMES.length}개 · 검사한 명도 쌍 ${PAIRS.length}개 (${brandList})`)
if (DARKLESS.length) console.log(`  다크 모드가 아직 없는 브랜드 ${DARKLESS.length}개: ${DARKLESS.join(', ')}`)
const skipped = {}
for (const n of NAMES) if (CTX[n]?.skip) (skipped[CTX[n].rule] = skipped[CTX[n].rule] || []).push(n)
for (const [id, list] of Object.entries(skipped)) {
  const rule = RULES.contextRules.find((r) => r.id === id)
  console.log(`  맥락 대비에서 제외 — ${rule.match} ${list.length}개: ${rule.skip}`)
}
const unmatched = NAMES.filter((n) => !CTX[n])
if (unmatched.length) console.log(`  바탕을 정하지 못한 토큰 ${unmatched.length}개: ${unmatched.slice(0, 5).join(', ')}${unmatched.length > 5 ? ' …' : ''}`)

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
show('soft', '━━━ 확인 필요 (대비는 권장 기준 — 화면을 보고 판단)')

const unused = [...accepted].filter(([, n]) => n === 0).map(([k]) => k)
if (unused.length) {
  console.log(`\n━━━ 한 번도 걸리지 않은 accepted ${unused.length}건 (이름이 바뀌었거나 더는 같은 색이 아님 — 지울지 확인)`)
  for (const k of unused) console.log(`     ${k}`)
}

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
