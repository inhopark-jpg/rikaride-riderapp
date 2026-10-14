#!/usr/bin/env node
/**
 * protect-files.mjs — PreToolUse(Write|Edit) 훅
 *
 * 수정하면 안 되는 파일을 차단한다.
 * PreToolUse 에서 permissionDecision: "deny" 를 내보내면 도구 호출이 막힌다.
 */

import { readFileSync } from 'node:fs'

function readStdin() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'))
  } catch {
    return null
  }
}

const PROTECTED = [
  {
    re: /(^|[/\\])\.env(\.|$)/,
    reason:
      '.env 는 수정할 수 없습니다. 환경 변수가 필요하면 사용자에게 무엇을 추가해야 하는지 알리세요.',
  },
  {
    re: /src[/\\]styles[/\\]theme\.css$/,
    reason:
      'src/styles/theme.css 는 자동 생성물입니다. tokens/design-tokens.json 을 고치고 `npm run tokens:build` 를 실행하세요. 여기를 직접 고치면 다음 빌드에 덮어써집니다.',
  },
]

const payload = readStdin()
const filePath = payload?.tool_input?.file_path
if (!filePath) process.exit(0)

const hit = PROTECTED.find((p) => p.re.test(filePath))
if (!hit) process.exit(0)

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: hit.reason,
    },
  }),
)
