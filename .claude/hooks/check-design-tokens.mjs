#!/usr/bin/env node
/**
 * check-design-tokens.mjs — PostToolUse(Write|Edit) 훅
 *
 * 저장된 파일에서 하드코딩된 색상·치수를 감지한다.
 *
 * ⚠️ 허용 목록은 src/styles/theme.css 를 파싱해서 만든다.
 *    정규식으로 토큰 이름을 하드코딩하면 토큰이 바뀔 때마다 훅이 거짓 경고를 낸다.
 *    theme.css 가 비어 있으면(부트스트랩 전) 검사를 건너뛰고 그 사실만 알린다.
 *
 * stdin: { tool_input: { file_path, ... }, ... }
 * stdout: 사람이 읽는 경고. 종료 코드 0 (차단하지 않음 — 경고만)
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const PROJECT = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
const THEME = resolve(PROJECT, 'src/styles/theme.css')

const CHECKED_EXT = /\.(tsx?|css)$/
// 생성물과 설정 파일은 검사하지 않는다.
const IGNORED = [/src[/\\]styles[/\\]theme\.css$/, /node_modules/, /[/\\]tokens[/\\]/, /\.stories\.tsx$/]

function readStdin() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'))
  } catch {
    return null
  }
}

/** theme.css 에서 실제 존재하는 CSS 변수 이름을 뽑는다. */
function parseTheme() {
  if (!existsSync(THEME)) return null
  const css = readFileSync(THEME, 'utf8')
  const names = new Set()
  for (const m of css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)) names.add(m[1])
  return names
}

const PATTERNS = [
  {
    re: /#[0-9a-fA-F]{3,8}\b/g,
    what: '색상 리터럴',
    hint: 'color-semantic 토큰 유틸을 쓰세요 (bg-* / text-* / border-*)',
  },
  {
    re: /\b(?:rgba?|hsla?|oklch|oklab)\s*\(/g,
    what: '색상 함수',
    hint: 'color-semantic 토큰 유틸을 쓰세요',
  },
  {
    re: /\b(?:bg|text|border|fill|stroke|shadow)-\[[^\]]+\]/g,
    what: '대괄호 임의 색상값',
    hint: '토큰에 없는 색은 쓸 수 없습니다. 없으면 보고하세요',
  },
  {
    re: /\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|w|h|size|rounded)-\[[0-9.]+(?:px|rem|em)\]/g,
    what: '대괄호 임의 치수',
    hint: 'shape-semantic 토큰을 쓰세요 (shape-token-rule.md)',
  },
  {
    re: /--(?:color|shape|typeface)-primitive[a-z0-9-]*/g,
    what: 'primitive 토큰 참조',
    hint: 'primitive 는 CSS 로 방출되지 않습니다. semantic 토큰만 쓰세요',
  },
]

function main() {
  const payload = readStdin()
  const filePath = payload?.tool_input?.file_path
  if (!filePath || !CHECKED_EXT.test(filePath)) return
  if (IGNORED.some((re) => re.test(filePath))) return
  if (!existsSync(filePath)) return

  const themeVars = parseTheme()

  if (themeVars === null || themeVars.size === 0) {
    console.log(
      '⚠️  토큰이 아직 추출되지 않았습니다 (src/styles/theme.css 가 비어 있음) — 하드코딩 검사를 건너뜁니다.\n' +
        '   절차: docs/TOKENS.md',
    )
    return
  }

  const src = readFileSync(filePath, 'utf8')
  const lines = src.split('\n')
  const findings = []

  lines.forEach((line, i) => {
    // 주석 줄은 건너뛴다
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return
    for (const p of PATTERNS) {
      for (const m of line.matchAll(p.re)) {
        findings.push({ line: i + 1, text: m[0], what: p.what, hint: p.hint })
      }
    }
  })

  // 존재하지 않는 CSS 변수 참조 — theme.css 를 기준으로 판정한다
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/var\((--[a-z0-9-]+)\)/g)) {
      if (!themeVars.has(m[1])) {
        findings.push({
          line: i + 1,
          text: m[1],
          what: '존재하지 않는 CSS 변수',
          hint: 'theme.css 에 없는 변수입니다. 스타일이 조용히 안 먹습니다',
        })
      }
    }
  })

  if (findings.length === 0) return

  console.log(`\n⚠️  디자인 토큰 위반 ${findings.length}건 — ${filePath}\n`)
  for (const f of findings) {
    console.log(`   ${filePath}:${f.line}  ${f.what}: ${f.text}`)
    console.log(`      → ${f.hint}`)
  }
  console.log('\n   토큰 값은 tokens/design-tokens.json 에 있습니다. 근사값을 지어내지 마세요.\n')
}

main()
