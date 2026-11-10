#!/usr/bin/env node
/**
 * to-i18n.mjs — tokens/extract/raw/vars.language.json → src/i18n/locales/*.json
 *
 * 사용법:
 *   node tokens/extract/to-i18n.mjs
 *
 * 입력은 figma-dump.js step2 로 받은 language 컬렉션 덤프다 (to-dtcg.mjs 와 같은 raw/).
 * language 는 디자인 토큰이 아니므로 design-tokens.json 이 아니라 여기서 따로 뽑는다.
 * 규칙은 language-rule.md §2·§4:
 *   - 언어(모드) 하나에 파일 하나
 *   - 키 = 변수명 끝의 6자 ID (앞 경로는 섹션 구조에 따라 바뀔 수 있어 키로 쓰지 않는다)
 *   - 값이 '--'(미번역) 이거나 비어 있으면 내보내지 않고 누락으로 보고한다
 *
 * 출력:
 *   src/i18n/locales/{모드 slug}.json   { "<6자 ID>": "문자열" }
 *   src/i18n/locales/index.json         { defaultLanguage, languages: [{ id, name }] }
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../..')
const SRC = join(HERE, 'raw/vars.language.json')
const OUT = join(ROOT, 'src/i18n/locales')

if (!existsSync(SRC)) {
  console.error(`\n❌ ${SRC} 가 없습니다.`)
  console.error('   figma-dump.js 의 step2 로 language 컬렉션을 덤프하세요. 절차: docs/TOKENS.md\n')
  process.exit(1)
}

const dump = JSON.parse(readFileSync(SRC, 'utf8'))
if (dump.returned !== dump.totalInCollection) {
  console.error(`\n❌ language: Figma 는 ${dump.totalInCollection}개라고 보고했는데 ${dump.returned}개만 받았습니다. 다시 덤프하세요.\n`)
  process.exit(1)
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const UNTRANSLATED = '--'

const modes = dump.modes.map((m) => ({ ...m, id: slug(m.name) }))
const tables = Object.fromEntries(modes.map((m) => [m.id, {}]))
const missing = []
const problems = []
const seen = new Map()

for (const v of dump.variables) {
  const key = v.name.split('/').at(-1)
  if (!/^[a-z0-9]{6}$/.test(key)) {
    problems.push(`"${v.name}" — 끝 세그먼트 "${key}" 가 6자 ID 형식이 아닙니다. 플러그인으로 만든 변수인지 확인하세요.`)
    continue
  }
  if (seen.has(key)) {
    problems.push(`ID "${key}" 가 두 변수에 있습니다: "${seen.get(key)}", "${v.name}"`)
    continue
  }
  seen.set(key, v.name)

  for (const m of modes) {
    const value = v.valuesByMode[m.modeId]
    if (typeof value !== 'string' || value.trim() === '' || value.trim() === UNTRANSLATED) {
      missing.push(`${m.name}  ${key}  (${v.name})`)
      continue
    }
    tables[m.id][key] = value
  }
}

if (problems.length) {
  console.error('\n❌ 추출을 중단합니다:\n')
  for (const p of problems) console.error(`   • ${p}`)
  console.error('')
  process.exit(1)
}

mkdirSync(OUT, { recursive: true })
// 사라진 언어의 파일이 남지 않게 이전 생성물을 지운다
for (const f of readdirSync(OUT)) if (f.endsWith('.json')) rmSync(join(OUT, f))

for (const m of modes) {
  const sorted = Object.fromEntries(Object.entries(tables[m.id]).sort(([a], [b]) => a.localeCompare(b)))
  writeFileSync(join(OUT, `${m.id}.json`), JSON.stringify(sorted, null, 2) + '\n')
}
const defaultMode = modes.find((m) => m.modeId === dump.collection.defaultModeId) ?? modes[0]
writeFileSync(
  join(OUT, 'index.json'),
  JSON.stringify(
    {
      $description: '자동 생성. tokens/extract/to-i18n.mjs 가 Figma language 컬렉션에서 만듭니다. 직접 수정하지 마세요.',
      defaultLanguage: defaultMode.id,
      languages: modes.map((m) => ({ id: m.id, name: m.name })),
    },
    null,
    2,
  ) + '\n',
)

console.log('✅ src/i18n/locales 생성')
for (const m of modes) console.log(`   ${m.id.padEnd(10)} ${Object.keys(tables[m.id]).length}개`)
if (missing.length) {
  console.log(`\n⚠️  미번역(--)·빈 값 ${missing.length}건 — 이 항목은 파일에 넣지 않았습니다:`)
  for (const x of missing) console.log(`   ${x}`)
}
console.log('')
