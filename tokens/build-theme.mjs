#!/usr/bin/env node
/**
 * build-theme.mjs — tokens/design-tokens.json → src/styles/theme.css
 *
 * ============================================================================
 * 토큰 경로 → CSS 변수명 변환 규칙 (이 파일이 유일한 정의처)
 * ============================================================================
 *
 * 알고리즘:
 *   1. 컬렉션으로 네임스페이스를 정한다 (NAMESPACE_MAP).
 *      primitive 컬렉션은 CSS 변수로 방출하지 않는다 — alias 해석에만 쓴다.
 *      → 룰북의 "컴포넌트는 semantic 토큰만 쓴다"를 구조적으로 강제한다.
 *         (color-token-rule.md §1, shape-token-rule.md §1)
 *   2. 컬렉션을 뺀 나머지 경로 세그먼트를 '-' 로 이어붙인다.
 *   3. 첫 세그먼트가 네임스페이스 키워드와 같으면 지운다 (stripHead).
 *        spacing/surface-margin/base → --spacing-surface-margin-base
 *        radius/surface-radius/low   → --radius-surface-radius-low
 *   4. 소문자화 → 영숫자가 아닌 문자는 '-' → 연속 '-' 축약 → 양끝 '-' 제거.
 *   5. 서로 다른 두 경로가 같은 변수명으로 떨어지면 빌드를 에러로 중단한다.
 *      (조용히 덮어쓰면 어느 토큰이 이겼는지 알 수 없다)
 *
 * 매핑 표:
 *   color-primitive      *방출 안 함*
 *   color-semantic       interactive/primary/bg/default → --color-interactive-primary-bg-default
 *   shape-primitive      *방출 안 함*
 *   shape-semantic       spacing/surface-margin/base    → --spacing-surface-margin-base
 *                        radius/surface-radius/low      → --radius-surface-radius-low
 *   icon-frame           icon-size/body                 → --spacing-icon-body
 *                        icon-line-height/body          → --spacing-icon-lh-body
 *   typeface-primitive   *방출 안 함*
 *   typeface-semantic    font-family/display            → --font-display
 *                        font-weight/body/bold          → --font-weight-body-bold
 *                        font-size/body/b3              → --text-body-b3
 *                        line-height/body/b3            → --leading-body-b3
 *                                                       + --text-body-b3--line-height (짝 방출)
 *   effects              shadow/mid/drop-shadow/blur    → --shadow-mid-blur (5필드 개별)
 *                        (합성)                          → --shadow-mid: var(...) var(...) ...
 *                        background-blur/uniform/high/blur → --blur-uniform-high
 *                        background-blur/progressive/*  → --blur-progressive-*  (유틸 없음)
 *                        liquid-glass/high/glass/frost  → --liquid-glass-high-frost (유틸 없음)
 *
 * effect 가 5필드 + 합성을 둘 다 내는 이유:
 *   effect-token-rule.md §1 은 5개 필드를 분리된 변수로 유지하라고 요구하고,
 *   Tailwind 의 --shadow-* 네임스페이스는 합성값 하나를 요구한다.
 *   합성값이 개별 변수를 var() 로 참조하게 하면 둘 다 만족한다.
 *
 * 모드(3축) 처리 — color-token-rule.md §10 의 "서브트리 단위 지역 오버라이드" 요구:
 *   @theme static 에 기본 모드 값을 넣어 유틸을 생성하고,
 *   모든 모드를 data 속성 셀렉터로 다시 방출한다. CSS 변수는 서브트리로 상속되므로
 *   임의 깊이의 지역 오버라이드가 그대로 동작한다.
 *     color-semantic    → [data-theme="..."]        (명도/브랜드)
 *     typeface-semantic → [data-typeface="..."]     (브랜드×언어, 색과 별개 축)
 *     icon-frame        → [data-icon-scale="..."]   (텍스트 스텝 매칭, 또 별개 축)
 *   @theme inline 은 값을 인라인해서 오버라이드를 깨뜨리므로 쓰지 않는다.
 *   @theme static 은 미사용 변수도 항상 방출한다 — 오버라이드 블록이 가리킬 대상이
 *   tree-shaking 으로 사라지는 것을 막는다.
 *
 * Text Style 은 CSS 변수가 아니라 @utility 로 낸다:
 *   5속성(family/weight/size/line-height/letter-spacing)은 변수 하나에 안 들어간다.
 *   생성된 유틸이 밑단 변수를 var() 로 참조하므로 text-style-rule.md §0 의 alias 관계와
 *   §5 의 "5속성 빠짐없이 적용" 이 둘 다 지켜진다.
 * ============================================================================
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = resolve(ROOT, 'tokens/design-tokens.json')
const OUT = resolve(ROOT, 'src/styles/theme.css')

/** 컬렉션 → 방출 규칙. emit:false 면 alias 해석에만 쓰고 CSS 로 내지 않는다. */
const NAMESPACE_MAP = {
  'color-primitive': { emit: false },
  'color-semantic': { emit: true, ns: 'color', modeAttr: 'data-theme' },
  'shape-primitive': { emit: false },
  'shape-semantic': { emit: true, ns: null, byHead: { spacing: 'spacing', radius: 'radius', size: 'spacing' } },
  'typeface-primitive': { emit: false },
  'typeface-semantic': {
    emit: true,
    ns: null,
    modeAttr: 'data-typeface',
    byHead: {
      'font-family': 'font',
      'font-weight': 'font-weight',
      'font-size': 'text',
      'line-height': 'leading',
    },
  },
  'icon-frame': {
    emit: true,
    ns: null,
    modeAttr: 'data-icon-scale',
    byHead: {
      'icon-size': 'spacing',
      'icon-line-height': 'spacing',
    },
    // icon-line-height 는 --spacing-icon-* 와 충돌하므로 접두사를 달리 붙인다.
    rename: { 'icon-size': 'icon', 'icon-line-height': 'icon-lh' },
  },
  effects: {
    emit: true,
    ns: null,
    byHead: {
      shadow: 'shadow',
      'background-blur': 'blur',
      'liquid-glass': 'liquid-glass',
    },
    // 필러 세그먼트 — Figma 경로에는 있지만 변수를 구분하지 않는 고정 단어라 지운다.
    //   shadow/mid/drop-shadow/blur        → --shadow-mid-blur
    //   liquid-glass/high/glass/frost      → --liquid-glass-high-frost
    //   background-blur/uniform/high/blur  → --blur-uniform-high  (말단 blur 만)
    filler: { shadow: ['drop-shadow'], 'liquid-glass': ['glass'] },
    trailingFiller: { 'background-blur': { uniform: 'blur' } },
  },
}

/** Tailwind 가 유틸을 생성하는 네임스페이스. 나머지는 var() 로만 쓰인다. */
const UTILITY_NAMESPACES = new Set([
  'color', 'spacing', 'radius', 'font', 'font-weight', 'text', 'leading', 'shadow', 'blur',
])

const warnings = []
const errors = []

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * 토큰 경로 → { varName, ns } 또는 null(방출 안 함).
 * @param {string} collection 최상위 컬렉션 이름
 * @param {string[]} segs 컬렉션 아래 경로 세그먼트
 */
function mapName(collection, segs) {
  const rule = NAMESPACE_MAP[collection]
  if (!rule) {
    warnings.push(`알 수 없는 컬렉션 "${collection}" — 방출하지 않고 건너뜁니다.`)
    return null
  }
  if (!rule.emit) return null

  let ns = rule.ns
  let rest = segs

  if (rule.byHead) {
    const head = segs[0]
    ns = rule.byHead[head]
    if (!ns) {
      warnings.push(`"${collection}/${segs.join('/')}" — 첫 세그먼트 "${head}" 에 매핑 규칙이 없어 건너뜁니다.`)
      return null
    }
    // 3단계: 첫 세그먼트가 네임스페이스를 가리키면 지운다. rename 이 있으면 그 값으로 치환.
    const replacement = rule.rename?.[head]
    rest = replacement ? [replacement, ...segs.slice(1)] : segs.slice(1)

    // 3-b단계: 필러 세그먼트 제거 (NAMESPACE_MAP 의 filler/trailingFiller 주석 참고)
    const filler = rule.filler?.[head]
    if (filler) rest = rest.filter((s) => !filler.includes(s))

    const trailing = rule.trailingFiller?.[head]?.[rest[0]]
    if (trailing && rest.at(-1) === trailing) rest = rest.slice(0, -1)
  }

  const tail = rest.map(slug).filter(Boolean).join('-')
  const varName = tail ? `--${ns}-${tail}` : `--${ns}`
  return { varName, ns }
}

/** 중첩 DTCG 객체 → leaf 토큰 목록. leaf 는 $value 를 가진 객체. */
function flatten(node, path = [], out = []) {
  if (node && typeof node === 'object' && '$value' in node) {
    out.push({ path, token: node })
    return out
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue
      flatten(v, [...path, k], out)
    }
  }
  return out
}

function getByPath(root, dotted) {
  return dotted.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), root)
}

const ALIAS_RE = /^\{([^}]+)\}$/

/**
 * DTCG alias 를 최종 값까지 펼친다. 모드가 지정되면 그 모드의 값을 우선 사용한다.
 * 순환 참조는 에러로 잡는다.
 */
function resolveValue(value, root, mode, seen = new Set()) {
  if (typeof value !== 'string') return value
  const m = value.match(ALIAS_RE)
  if (!m) return value

  const target = m[1]
  if (seen.has(target)) {
    errors.push(`alias 순환 참조: ${[...seen, target].join(' → ')}`)
    return null
  }
  seen.add(target)

  const node = getByPath(root, target)
  if (!node || !('$value' in node)) {
    errors.push(`alias 대상을 찾을 수 없습니다: {${target}}`)
    return null
  }
  return resolveValue(valueForMode(node, mode), root, mode, seen)
}

/** 토큰 노드에서 해당 모드의 원시 값을 꺼낸다. 없으면 기본 $value. */
function valueForMode(token, mode) {
  const mv = token.$extensions?.['com.figma.modeValues']
  if (mode && mv && mode in mv) return mv[mode]
  return token.$value
}

function formatValue(v, type) {
  if (v == null) return null
  if (typeof v === 'number') {
    // dimension 계열은 px 로 낸다. 단위 없는 비율(line-height 배수 등)은 json 에서 문자열로 온다.
    return type === 'number' ? String(v) : `${v}px`
  }
  return String(v)
}

// ---------------------------------------------------------------------------

function emptyTheme(reason) {
  return [
    '/* 자동 생성 파일입니다. 직접 수정하지 마세요 — tokens/build-theme.mjs 가 덮어씁니다. */',
    `/* 생성 실패: ${reason} */`,
    '/* tokens/design-tokens.json 을 만든 뒤 `npm run tokens:build` 를 다시 실행하세요. */',
    '/* 절차: docs/TOKENS.md */',
    '',
    '@theme static {',
    '  /* 토큰이 아직 추출되지 않았습니다. */',
    '}',
    '',
  ].join('\n')
}

function main() {
  if (!existsSync(SRC)) {
    const reason = 'tokens/design-tokens.json 이 없습니다'
    console.warn(`\n⚠️  ${reason}.`)
    console.warn('   빈 @theme 을 생성합니다. Figma 추출 절차는 docs/TOKENS.md 를 보세요.\n')
    mkdirSync(dirname(OUT), { recursive: true })
    writeFileSync(OUT, emptyTheme(reason))
    return
  }

  let root
  try {
    root = JSON.parse(readFileSync(SRC, 'utf8'))
  } catch (e) {
    console.error(`\n❌ design-tokens.json 을 파싱할 수 없습니다: ${e.message}\n`)
    process.exit(1)
  }

  const collections = Object.keys(root).filter((k) => !k.startsWith('$'))
  if (collections.length === 0) {
    const reason = 'design-tokens.json 에 컬렉션이 하나도 없습니다'
    console.warn(`\n⚠️  ${reason}.`)
    console.warn('   빈 @theme 을 생성합니다. 절차는 docs/TOKENS.md 를 보세요.\n')
    mkdirSync(dirname(OUT), { recursive: true })
    writeFileSync(OUT, emptyTheme(reason))
    return
  }

  // path(점 표기) → CSS 변수명. Text Style 이 밑단 변수를 var() 로 참조할 때 쓴다.
  const pathToVar = new Map()
  // varName → { ns, collection, byMode: Map<mode|null, string> }
  const vars = new Map()
  const owner = new Map() // 충돌 검사용: varName → 최초 소유 경로

  for (const collection of collections) {
    const rule = NAMESPACE_MAP[collection]
    if (!rule) {
      warnings.push(`알 수 없는 컬렉션 "${collection}" — 건너뜁니다. NAMESPACE_MAP 확인이 필요합니다.`)
      continue
    }
    const ext = root[collection].$extensions ?? {}
    const modes = ext['com.figma.modes'] ?? []
    const defaultMode = ext['com.figma.defaultMode'] ?? modes[0] ?? null

    for (const { path, token } of flatten(root[collection])) {
      const dotted = [collection, ...path].join('.')
      const mapped = mapName(collection, path)
      if (!mapped) continue

      const prev = owner.get(mapped.varName)
      if (prev && prev !== dotted) {
        errors.push(`변수명 충돌: "${prev}" 와 "${dotted}" 가 모두 ${mapped.varName} 으로 매핑됩니다.`)
        continue
      }
      owner.set(mapped.varName, dotted)
      pathToVar.set(dotted, mapped.varName)

      const byMode = new Map()
      const modeList = modes.length ? modes : [null]
      for (const mode of modeList) {
        const raw = resolveValue(valueForMode(token, mode), root, mode)
        const formatted = formatValue(raw, token.$type)
        if (formatted != null) byMode.set(mode, formatted)
      }
      vars.set(mapped.varName, { ...mapped, collection, byMode, defaultMode, modeAttr: rule.modeAttr })
    }
  }

  if (errors.length) {
    console.error('\n❌ 토큰 빌드를 중단합니다:\n')
    for (const e of errors) console.error(`   • ${e}`)
    console.error('')
    process.exit(1)
  }

  // --- 합성 그림자 ---------------------------------------------------------
  const SHADOW_FIELDS = ['position-x', 'position-y', 'blur', 'spread', 'color']
  const shadowLevels = new Set()
  for (const name of vars.keys()) {
    const m = name.match(/^--shadow-(.+)-(position-x|position-y|blur|spread|color)$/)
    if (m) shadowLevels.add(m[1])
  }
  const composedShadows = []
  for (const level of [...shadowLevels].sort()) {
    const present = SHADOW_FIELDS.filter((f) => vars.has(`--shadow-${level}-${f}`))
    if (present.length !== SHADOW_FIELDS.length) {
      warnings.push(
        `shadow/${level} 에 5개 필드가 다 없습니다 (있는 것: ${present.join(', ') || '없음'}) — ` +
          `합성 --shadow-${level} 을 만들지 않습니다.`,
      )
      continue
    }
    composedShadows.push([
      `--shadow-${level}`,
      SHADOW_FIELDS.map((f) => `var(--shadow-${level}-${f})`).join(' '),
    ])
  }

  // --- font-size 와 line-height 짝 방출 -----------------------------------
  const pairedLineHeights = []
  for (const name of vars.keys()) {
    if (!name.startsWith('--leading-')) continue
    const twin = `--text-${name.slice('--leading-'.length)}`
    if (vars.has(twin)) pairedLineHeights.push([`${twin}--line-height`, `var(${name})`])
  }

  // --- 출력 ---------------------------------------------------------------
  const L = []
  L.push('/* 자동 생성 파일입니다. 직접 수정하지 마세요 — tokens/build-theme.mjs 가 덮어씁니다. */')
  L.push('/* 값을 바꾸려면 tokens/design-tokens.json 을 고치고 `npm run tokens:build` 를 실행하세요. */')
  L.push(`/* 생성: ${new Date().toISOString()} */`)
  L.push('')

  // 기본 모드 값 → @theme static (유틸 생성)
  L.push('@theme static {')
  const grouped = new Map()
  for (const [name, v] of vars) {
    if (!grouped.has(v.ns)) grouped.set(v.ns, [])
    grouped.get(v.ns).push([name, v])
  }
  for (const [ns, entries] of [...grouped].sort((a, b) => a[0].localeCompare(b[0]))) {
    L.push(`  /* ${ns}${UTILITY_NAMESPACES.has(ns) ? '' : ' — 유틸 없음, var() 로 사용'} */`)
    for (const [name, v] of entries.sort((a, b) => a[0].localeCompare(b[0]))) {
      const value = v.byMode.get(v.defaultMode) ?? v.byMode.get(null) ?? [...v.byMode.values()][0]
      if (value != null) L.push(`  ${name}: ${value};`)
    }
    L.push('')
  }
  if (composedShadows.length) {
    L.push('  /* shadow 합성 — 개별 5필드를 var() 로 참조한다 (effect-token-rule.md §1) */')
    for (const [n, v] of composedShadows) L.push(`  ${n}: ${v};`)
    L.push('')
  }
  if (pairedLineHeights.length) {
    L.push('  /* font-size 유틸에 line-height 를 동반시킨다 (typography-token-rule.md §1) */')
    for (const [n, v] of pairedLineHeights) L.push(`  ${n}: ${v};`)
    L.push('')
  }
  L.push('}')
  L.push('')

  // 모드 오버라이드 — 기본 모드도 명시 방출해서 서브트리에서 되돌릴 수 있게 한다.
  const axes = new Map()
  for (const [name, v] of vars) {
    if (!v.modeAttr) continue
    if (!axes.has(v.modeAttr)) axes.set(v.modeAttr, new Map())
    const perMode = axes.get(v.modeAttr)
    for (const [mode, value] of v.byMode) {
      if (mode == null) continue
      if (!perMode.has(mode)) perMode.set(mode, [])
      perMode.get(mode).push([name, value])
    }
  }
  for (const [attr, perMode] of axes) {
    L.push(`/* ${attr} — 서브트리 단위로 덮어쓸 수 있다 (color-token-rule.md §10) */`)
    for (const [mode, entries] of perMode) {
      L.push(`[${attr}="${slug(mode)}"] {`)
      for (const [n, v] of entries.sort((a, b) => a[0].localeCompare(b[0]))) L.push(`  ${n}: ${v};`)
      L.push('}')
      L.push('')
    }
  }

  // Text Style → @utility
  const textStyles = root.$textStyles ?? {}
  const styleNames = Object.keys(textStyles)
  if (styleNames.length) {
    L.push('/* Text Style 프리셋 — 5속성 전부 적용 (text-style-rule.md §5) */')
    const PROP_CSS = {
      fontFamily: 'font-family',
      fontWeight: 'font-weight',
      fontSize: 'font-size',
      lineHeight: 'line-height',
      letterSpacing: 'letter-spacing',
    }
    for (const styleName of styleNames.sort()) {
      const def = textStyles[styleName]
      L.push(`@utility text-style-${slug(styleName)} {`)
      for (const [key, cssProp] of Object.entries(PROP_CSS)) {
        const raw = def[key]
        if (raw == null) {
          warnings.push(`Text Style "${styleName}" 에 ${key} 가 없습니다 — 5속성을 다 채워야 합니다.`)
          continue
        }
        const alias = typeof raw === 'string' && raw.match(ALIAS_RE)
        if (alias) {
          const varName = pathToVar.get(alias[1])
          if (varName) {
            L.push(`  ${cssProp}: var(${varName});`)
            continue
          }
          const resolved = resolveValue(raw, root, null)
          if (resolved == null) {
            warnings.push(`Text Style "${styleName}" 의 ${key} alias 를 풀 수 없습니다: ${raw}`)
            continue
          }
          L.push(`  ${cssProp}: ${formatValue(resolved, null)};`)
          continue
        }
        L.push(`  ${cssProp}: ${formatValue(raw, key === 'fontWeight' ? 'number' : null)};`)
      }
      L.push('}')
      L.push('')
    }
  }

  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, L.join('\n'))

  const modeCount = [...axes.values()].reduce((n, m) => n + m.size, 0)
  console.log(`✅ theme.css 생성 — 변수 ${vars.size}개, 모드 ${modeCount}개, Text Style ${styleNames.length}개`)
  if (warnings.length) {
    console.warn(`\n⚠️  경고 ${warnings.length}건:`)
    for (const w of warnings) console.warn(`   • ${w}`)
    console.warn('')
  }
}

main()
