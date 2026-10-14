#!/usr/bin/env node
/**
 * check-story-exists.mjs — PostToolUse(Write|Edit) 훅
 *
 * 컴포넌트를 저장했는데 4파일 구조가 안 갖춰졌으면 경고한다.
 * 경고만 하고 차단하지 않는다 — 작업 중간에 파일이 하나씩 생기는 건 정상이다.
 */

import { readFileSync, existsSync } from 'node:fs'
import { dirname, basename, join } from 'node:path'

function readStdin() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'))
  } catch {
    return null
  }
}

const payload = readStdin()
const filePath = payload?.tool_input?.file_path
if (!filePath) process.exit(0)

// src/components/{Name}/{Name}.tsx 만 대상. 스토리·타입 파일 저장에는 반응하지 않는다.
const m = filePath.match(/src[/\\]components[/\\]([^/\\]+)[/\\]\1\.tsx$/)
if (!m) process.exit(0)

const dir = dirname(filePath)
const name = basename(filePath, '.tsx')

const required = [
  [`${name}.stories.tsx`, 'CSF3 스토리. autodocs 는 preview.ts 에서 전역 활성화되어 있습니다'],
  ['types.ts', 'props 타입'],
  ['index.ts', '공개 export'],
]

const missing = required.filter(([f]) => !existsSync(join(dir, f)))
if (missing.length === 0) process.exit(0)

console.log(`\n⚠️  ${name} — 4파일 중 ${missing.length}개 누락\n`)
for (const [f, why] of missing) console.log(`   ${join(dir, f)}  — ${why}`)
console.log('\n   1 컴포넌트 = 4 파일입니다 (CLAUDE.md).\n')
