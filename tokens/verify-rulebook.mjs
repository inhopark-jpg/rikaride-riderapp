#!/usr/bin/env node
/**
 * verify-rulebook.mjs — 룰북 정합성 3중 검사
 *
 * ① 라우터 커버리지  — docs/README.md 가 모든 룰북을 언급하는가
 * ② §참조 무결성    — 룰북 간 §참조가 실제 §를 가리키는가
 * ③ 룰북-토큰 정합성 — 룰북이 언급한 토큰 경로가 design-tokens.json 에 있는가
 *
 * 정보성 검사. exit code 는 항상 0 (스크립트 자체 실패 시만 non-zero).
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const RULEBOOK_DIR = join(ROOT, 'docs/design-system-rule')
const TOKENS = join(ROOT, 'tokens/design-tokens.json')
const ROUTER = join(ROOT, 'docs/README.md')

if (!existsSync(RULEBOOK_DIR)) {
  console.error(`\n❌ 룰북 폴더가 없습니다: ${RULEBOOK_DIR}\n`)
  process.exit(1)
}

const rulebookFiles = readdirSync(RULEBOOK_DIR)
  .filter((f) => f.endsWith('-rule.md'))
  .sort()

let totalWarnings = 0

// ---------------------------------------------------------------------------
// ① 라우터 커버리지
// ---------------------------------------------------------------------------
console.log('\n━━━ ① 라우터 커버리지 ━━━')

if (!existsSync(ROUTER)) {
  console.log('⚠️  docs/README.md 가 없습니다. 검사 생략.')
} else {
  const routerContent = readFileSync(ROUTER, 'utf8')
  const routerRulebookRefs = new Set()
  for (const m of routerContent.matchAll(/([a-z][a-z-]*-rule\.md)/g)) {
    routerRulebookRefs.add(m[1])
  }

  const missingFromRouter = rulebookFiles.filter((f) => !routerRulebookRefs.has(f))
  const danglingInRouter = [...routerRulebookRefs].filter((f) => !rulebookFiles.includes(f))

  if (missingFromRouter.length === 0 && danglingInRouter.length === 0) {
    console.log(`✅ 라우터가 룰북 ${rulebookFiles.length}개를 모두 커버함.`)
  } else {
    if (missingFromRouter.length > 0) {
      console.log(`⚠️  라우터에 없는 룰북 (${missingFromRouter.length}건):`)
      for (const f of missingFromRouter) console.log(`     • ${f}`)
      totalWarnings += missingFromRouter.length
    }
    if (danglingInRouter.length > 0) {
      console.log(`⚠️  라우터가 참조하지만 존재하지 않는 파일 (${danglingInRouter.length}건):`)
      for (const f of danglingInRouter) console.log(`     • ${f}`)
      totalWarnings += danglingInRouter.length
    }
  }
}

// ---------------------------------------------------------------------------
// ② §참조 무결성
// ---------------------------------------------------------------------------
console.log('\n━━━ ② §참조 무결성 ━━━')

// 각 룰북에 존재하는 §번호 수집
const sectionsByFile = new Map()
for (const file of rulebookFiles) {
  const content = readFileSync(join(RULEBOOK_DIR, file), 'utf8')
  const sections = new Set()
  for (const m of content.matchAll(/^##\s+(\d+(?:-\d+)?)\./gm)) {
    sections.add(m[1])
  }
  sectionsByFile.set(file, sections)
}

// 룰북 간 §참조 대조
const brokenRefs = []
for (const sourceFile of rulebookFiles) {
  const content = readFileSync(join(RULEBOOK_DIR, sourceFile), 'utf8')
  const lines = content.split('\n')

  lines.forEach((line, i) => {
    for (const m of line.matchAll(/`?([a-z][a-z-]*-rule\.md)`?\s*§(\d+(?:-\d+)?)/g)) {
      const targetFile = m[1]
      const section = m[2]

      if (targetFile === sourceFile) continue

      if (!sectionsByFile.has(targetFile)) {
        brokenRefs.push({
          source: sourceFile,
          line: i + 1,
          target: targetFile,
          section,
          reason: '대상 파일 없음',
        })
      } else if (!sectionsByFile.get(targetFile).has(section)) {
        const existing = [...sectionsByFile.get(targetFile)].sort().join(', ')
        brokenRefs.push({
          source: sourceFile,
          line: i + 1,
          target: targetFile,
          section,
          reason: `§${section} 없음 (존재: ${existing})`,
        })
      }
    }
  })
}

if (brokenRefs.length === 0) {
  console.log('✅ 모든 §참조가 실제 §를 가리킴.')
} else {
  console.log(`⚠️  깨진 §참조 (${brokenRefs.length}건):`)
  for (const b of brokenRefs) {
    console.log(`     ${b.source}:${b.line}  →  ${b.target} §${b.section}`)
    console.log(`        ${b.reason}`)
  }
  totalWarnings += brokenRefs.length
}

// ---------------------------------------------------------------------------
// ③ 룰북-토큰 정합성
// ---------------------------------------------------------------------------
console.log('\n━━━ ③ 룰북-토큰 정합성 ━━━')

if (!existsSync(TOKENS)) {
  console.log('⚠️  tokens/design-tokens.json 이 없습니다. 부트스트랩 전이라 검사 생략.')
  console.log('   절차: docs/TOKENS.md')
} else {
  let tokens
  try {
    tokens = JSON.parse(readFileSync(TOKENS, 'utf8'))
  } catch (e) {
    console.error(`\n❌ design-tokens.json 파싱 실패: ${e.message}\n`)
    process.exit(1)
  }

  // 실제 존재하는 leaf 토큰 경로 수집 (컬렉션 접두사 있음/없음 둘 다)
  const actualRelative = new Set()
  const actualAbsolute = new Set()

  function collectPaths(node, absPath, relPath) {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue
      if (!v || typeof v !== 'object') continue
      const absNext = absPath ? `${absPath}/${k}` : k
      const relNext = relPath ? `${relPath}/${k}` : k
      if ('$value' in v) {
        actualRelative.add(relNext)
        actualAbsolute.add(absNext)
      } else {
        collectPaths(v, absNext, relNext)
      }
    }
  }

  for (const [collectionName, node] of Object.entries(tokens)) {
    if (collectionName.startsWith('$')) continue
    if (!node || typeof node !== 'object') continue
    collectPaths(node, collectionName, '')
  }

  // 룰북에서 slash 구분 경로 추출
  const PATH_RE = /`([a-z][a-z0-9-]*(?:\/[a-z0-9][a-z0-9-]*)+)`/g
  const isTokenPath = (path) =>
    !path.startsWith('.skeleton/') && !path.startsWith('pattern-') && !path.includes('/pattern-')

  const mentioned = new Map()
  for (const file of rulebookFiles) {
    const content = readFileSync(join(RULEBOOK_DIR, file), 'utf8')
    const lines = content.split('\n')
    lines.forEach((line, i) => {
      for (const m of line.matchAll(PATH_RE)) {
        const path = m[1]
        if (!isTokenPath(path)) continue
        if (!mentioned.has(path)) mentioned.set(path, [])
        mentioned.get(path).push({ file, line: i + 1 })
      }
    })
  }

  const missing = []
  for (const [path, locations] of mentioned) {
    if (!actualRelative.has(path) && !actualAbsolute.has(path)) {
      missing.push({ path, locations })
    }
  }
  missing.sort((a, b) => b.locations.length - a.locations.length)

  console.log(`  룰북 언급 경로: ${mentioned.size}개`)
  console.log(`    ✓ design-tokens.json 에 있음: ${mentioned.size - missing.length}`)
  console.log(`    ⚠️  없음 (예시일 수도, 드리프트일 수도): ${missing.length}`)

  if (missing.length > 0) {
    console.log('\n  없는 경로 (여러 번 언급될수록 예시가 아닐 가능성):')
    for (const { path, locations } of missing) {
      console.log(`    [${locations.length}건] ${path}`)
      for (const loc of locations.slice(0, 2)) console.log(`         • ${loc.file}:${loc.line}`)
      if (locations.length > 2) console.log(`         … 외 ${locations.length - 2}건`)
    }
    totalWarnings += missing.length
  }
}

// ---------------------------------------------------------------------------
// 요약
// ---------------------------------------------------------------------------
console.log('\n━━━ 요약 ━━━')
if (totalWarnings === 0) {
  console.log('✅ 세 검사 모두 통과.\n')
} else {
  console.log(`⚠️  경고 총 ${totalWarnings}건. 확인 필요.\n`)
}

process.exit(0)
