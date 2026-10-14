#!/usr/bin/env node
/**
 * notify.mjs — Stop / Notification 훅
 *
 * OS별 데스크탑 알림. 알림이 실패해도 절대 에러로 끝내지 않는다
 * (훅이 실패하면 세션에 잡음만 늘어난다).
 */

import { execFile } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { platform } from 'node:os'

function readStdin() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'))
  } catch {
    return null
  }
}

const payload = readStdin()
const title = 'rikaride'
const message = payload?.message ?? '작업이 끝났습니다'

const quit = () => process.exit(0)
const run = (cmd, args) => execFile(cmd, args, quit)

switch (platform()) {
  case 'darwin':
    run('osascript', ['-e', `display notification ${JSON.stringify(message)} with title ${JSON.stringify(title)}`])
    break
  case 'linux':
    run('notify-send', [title, message])
    break
  case 'win32':
    run('powershell', [
      '-NoProfile',
      '-Command',
      `[void][System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms');` +
        `$n=New-Object System.Windows.Forms.NotifyIcon;` +
        `$n.Icon=[System.Drawing.SystemIcons]::Information;$n.Visible=$true;` +
        `$n.ShowBalloonTip(5000,'${title}','${message.replace(/'/g, "''")}',[System.Windows.Forms.ToolTipIcon]::Info)`,
    ])
    break
  default:
    quit()
}

// 알림 명령이 없는 환경에서도 조용히 끝낸다
setTimeout(quit, 3000)
