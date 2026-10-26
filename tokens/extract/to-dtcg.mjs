#!/usr/bin/env node
/**
 * to-dtcg.mjs — tokens/extract/raw/*.json → tokens/design-tokens.json
 *
 * 사용법:
 *   node tokens/extract/to-dtcg.mjs --verify    # 컬렉션 이름만 대조하고 끝 (추출 전 필수)
 *   node tokens/extract/to-dtcg.mjs             # 변환 실행
 *
 * 입력 (figma-dump.js 의 각 step 결과를 그대로 저장한 것):
 *   raw/collections.json          ← step1
 *   raw/vars.{컬렉션명}.json      ← step2 (컬렉션마다 하나. 쪼개 받았으면 .part1/.part2)
 *   raw/text-styles.json          ← step3
 *   raw/effect-styles.json        ← step4 (선택)
 *
 * 출력 포맷은 build-theme.mjs 가 읽는 계약입니다:
 *   컬렉션의 모드 목록은 $extensions["com.figma.modes"],
 *   토큰별 모드값은 $extensions["com.figma.modeValues"] 에 넣습니다.
 *   DTCG 표준에 모드 개념이 없어서 확장 필드를 씁니다.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../..')
const RAW = join(HERE, 'raw')
const OUT = join(ROOT, 'tokens/design-tokens.json')
const SPEC = JSON.parse(readFileSync(join(HERE, 'collections.json'), 'utf8'))

const verifyOnly = process.argv.includes('--verify')
const problems = []

function readRaw(name) {
  const p = join(RAW, name)
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null
}

/* -------------------------------------------------------------------------
 * 1. 컬렉션 이름 대조 — 룰북이 전제하는 이름과 다르면 여기서 멈춘다.
 *    룰북들이 "토큰 이름 자체가 다르면 이 룰북을 적용하지 마세요" 라고
 *    명시하고 있으므로, 다른 이름을 억지로 매핑해서 진행하면 안 된다.
 * ---------------------------------------------------------------------- */
function verify(collections) {
  const actual = new Set(collections.map((c) => c.name))
  const expected = Object.keys(SPEC.expected)

  const missing = expected.filter((n) => !actual.has(n))
  const extra = [...actual].filter((n) => !expected.includes(n))

  for (const n of missing) problems.push(`컬렉션 "${n}" 이 Figma 에 없습니다 (${SPEC.expected[n].rulebook} 전제).`)
  for (const n of extra) problems.push(`Figma 에 예상 밖 컬렉션 "${n}" 이 있습니다 — 룰북이 다루지 않는 이름입니다.`)

  for (const c of collections) {
    const spec = SPEC.expected[c.name]
    if (!spec?.modeNamePattern) continue
    const re = new RegExp(spec.modeNamePattern)
    for (const m of c.modes) {
      if (!re.test(m.name)) {
        problems.push(`"${c.name}" 의 모드 이름 "${m.name}" 이 예상 패턴(${spec.modeNamePattern})과 다릅니다.`)
      }
    }
  }

  console.log('\n컬렉션 대조 결과:')
  for (const c of collections) {
    const known = SPEC.expected[c.name] ? '✓' : '✗ 알 수 없음'
    console.log(`  ${known}  ${c.name}  (변수 ${c.variableCount}개, 모드 ${c.modes.length}개: ${c.modes.map((m) => m.name).join(', ')})`)
  }

  if (problems.length) {
    console.error('\n❌ 룰북이 전제하는 이름 체계와 다릅니다. 추출을 중단합니다:\n')
    for (const p of problems) console.error(`   • ${p}`)
    console.error('\n   임의로 매핑하지 말고 docs/TOKENS.md 의 "이름 체계가 다른 경우" 절차를 따르세요.\n')
    process.exit(1)
  }
  console.log('\n✅ 컬렉션 이름이 룰북 전제와 일치합니다.\n')
}

/* -------------------------------------------------------------------------
 * 2. 값 변환
 * ---------------------------------------------------------------------- */
const hex = (n) => Math.round(n * 255).toString(16).padStart(2, '0')

function figmaColorToCss(c) {
  const a = c.a ?? 1
  if (a >= 1) return `#${hex(c.r)}${hex(c.g)}${hex(c.b)}`
  const r = Math.round(c.r * 255)
  const g = Math.round(c.g * 255)
  const b = Math.round(c.b * 255)
  return `rgb(${r} ${g} ${b} / ${Number(a.toFixed(4))})`
}

/** 컬렉션 + 경로로 DTCG $type 을 정한다. build-theme.mjs 의 px 부착 여부가 여기 달려 있다. */
function dtcgType(collectionName, head, resolvedType) {
  if (resolvedType === 'COLOR') return 'color'
  if (resolvedType === 'STRING') return head === 'font-family' ? 'fontFamily' : 'string'
  if (resolvedType === 'BOOLEAN') return 'boolean'
  // FLOAT
  if (head === 'font-weight') return 'number' // px 를 붙이면 안 된다
  return 'dimension'
}

/* -------------------------------------------------------------------------
 * 3. 변환
 * ---------------------------------------------------------------------- */
function main() {
  const collections = readRaw('collections.json')
  if (!collections) {
    console.error(`\n❌ ${join(RAW, 'collections.json')} 이 없습니다.`)
    console.error('   figma-dump.js 의 step1 을 use_figma 로 실행해 저장하세요. 절차: docs/TOKENS.md\n')
    process.exit(1)
  }

  verify(collections)
  if (verifyOnly) return

  // 컬렉션 덤프 수집 (쪼개 받은 part 파일들을 합친다)
  const dumps = readdirSync(RAW).filter((f) => f.startsWith('vars.') && f.endsWith('.json'))
  const byCollection = new Map()
  for (const f of dumps) {
    const d = readRaw(f)
    const key = d.collection.name
    if (!byCollection.has(key)) byCollection.set(key, { meta: d, variables: [] })
    byCollection.get(key).variables.push(...d.variables)
  }

  // 받은 개수와 Figma 가 보고한 개수를 대조 — 응답 잘림을 여기서 잡는다
  for (const c of collections) {
    const got = byCollection.get(c.name)
    if (!got) {
      problems.push(`컬렉션 "${c.name}" 의 변수 덤프(vars.${c.name}.json)가 없습니다.`)
      continue
    }
    if (got.variables.length !== c.variableCount) {
      problems.push(
        `"${c.name}": Figma 는 ${c.variableCount}개라고 보고했는데 ${got.variables.length}개만 받았습니다 — ` +
          `응답이 잘렸을 가능성이 높습니다. SLICE 로 나눠 다시 받으세요.`,
      )
    }
  }
  if (problems.length) {
    console.error('\n❌ 덤프가 불완전합니다:\n')
    for (const p of problems) console.error(`   • ${p}`)
    console.error('')
    process.exit(1)
  }

  // 변수 id → DTCG 경로 (alias 를 {collection.a.b} 로 바꾸기 위해)
  const idToPath = new Map()
  for (const [name, { variables }] of byCollection) {
    for (const v of variables) idToPath.set(v.id, [name, ...v.name.split('/')].join('.'))
  }

  const out = {
    $description:
      '자동 생성. tokens/extract/to-dtcg.mjs 가 Figma 덤프에서 만듭니다. 직접 편집은 docs/TOKENS.md 절차를 따르세요.',
    $generatedAt: new Date().toISOString(),
  }

  let leafCount = 0
  const perCollection = {}

  for (const c of collections) {
    const { variables } = byCollection.get(c.name)
    const modeName = new Map(c.modes.map((m) => [m.modeId, m.name]))
    const node = {
      $extensions: {
        'com.figma.modes': c.modes.map((m) => m.name),
        'com.figma.defaultMode': modeName.get(c.defaultModeId) ?? c.modes[0]?.name ?? null,
      },
    }

    for (const v of variables) {
      const segs = v.name.split('/')
      const head = segs[0]
      const type = dtcgType(c.name, head, v.resolvedType)

      const modeValues = {}
      for (const [modeId, raw] of Object.entries(v.valuesByMode)) {
        const mn = modeName.get(modeId)
        if (!mn) continue
        if (raw && typeof raw === 'object' && raw.type === 'VARIABLE_ALIAS') {
          const target = idToPath.get(raw.id)
          if (!target) {
            problems.push(`"${c.name}/${v.name}" (${mn}) 의 alias 대상 ${raw.id} 을 덤프에서 못 찾았습니다.`)
            continue
          }
          modeValues[mn] = `{${target}}`
        } else if (raw && typeof raw === 'object' && 'r' in raw) {
          modeValues[mn] = figmaColorToCss(raw)
        } else {
          modeValues[mn] = raw
        }
      }

      const defaultMode = node.$extensions['com.figma.defaultMode']
      let cursor = node
      for (const s of segs.slice(0, -1)) cursor = cursor[s] ??= {}
      // $extensions 는 항상 방출한다 — variableId 는 rename 추적의 핵심이라
      // 모드가 하나뿐인 컬렉션(effects 등)에서도 보존되어야 한다.
      // com.figma.modeValues 는 모드가 여럿일 때만 추가한다.
      const $extensions = { 'com.figma.variableId': v.id }
      if (c.modes.length > 1) $extensions['com.figma.modeValues'] = modeValues
      cursor[segs.at(-1)] = {
        $type: type,
        $value: modeValues[defaultMode] ?? Object.values(modeValues)[0] ?? null,
        ...(v.description ? { $description: v.description } : {}),
        $extensions,
      }
      leafCount++
    }

    out[c.name] = node
    perCollection[c.name] = variables.length
  }

  // Text Style → $textStyles
  const textStyles = readRaw('text-styles.json')
  if (textStyles) {
    const styles = {}
    for (const s of textStyles) {
      const bv = s.boundVariables ?? {}
      const ref = (key) => {
        const b = bv[key]
        const id = Array.isArray(b) ? b[0]?.id : b?.id
        const p = id ? idToPath.get(id) : null
        return p ? `{${p}}` : null
      }
      styles[s.name] = {
        // style-rule.md §5 — 5속성 전부 기록한다. 변수 바인딩이 없으면 리터럴로.
        fontFamily: ref('fontFamily') ?? s.fontName?.family ?? null,
        fontWeight: ref('fontWeight') ?? s.fontName?.style ?? null,
        fontSize: ref('fontSize') ?? s.fontSize ?? null,
        lineHeight:
          ref('lineHeight') ??
          (s.lineHeight?.unit === 'PIXELS' ? s.lineHeight.value : s.lineHeight?.unit === 'PERCENT' ? `${s.lineHeight.value}%` : 'normal'),
        letterSpacing:
          s.letterSpacing?.unit === 'PERCENT'
            ? `${s.letterSpacing.value}em`.replace(/^([\d.-]+)em$/, (_, n) => `${Number(n) / 100}em`)
            : s.letterSpacing?.value
              ? `${s.letterSpacing.value}px`
              : 'normal',
      }
    }
    out.$textStyles = styles
  } else {
    console.warn('⚠️  raw/text-styles.json 이 없습니다 — Text Style 프리셋 없이 생성합니다 (style-rule.md 적용 불가).')
  }

  if (problems.length) {
    console.error('\n❌ 변환 중 문제가 있습니다:\n')
    for (const p of problems) console.error(`   • ${p}`)
    console.error('')
    process.exit(1)
  }

  writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')

  console.log('✅ tokens/design-tokens.json 생성')
  console.log('\n컬렉션별 변수 개수:')
  for (const [n, count] of Object.entries(perCollection)) console.log(`   ${n.padEnd(20)} ${count}`)
  console.log(`\n   총 leaf 토큰: ${leafCount}`)
  console.log(`   Text Style:   ${out.$textStyles ? Object.keys(out.$textStyles).length : 0}`)
  console.log('\n다음: npm run tokens:build\n')
}

main()
