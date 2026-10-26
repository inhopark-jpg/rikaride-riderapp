# rikaride — 디자인 시스템 하네스

Figma 디자인 시스템을 코드로 옮기는 프로젝트다. **상세 규칙은 전부 `docs/` 에 있다. 이 파일은 요약과 라우팅만 담는다.**

스택: React 19 + TypeScript 5 + Tailwind CSS v4 + Vite 6 + Storybook 8

## 빌드 명령어

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 토큰 빌드 후 Vite 개발 서버 |
| `npm run build` | 토큰 빌드 → 타입체크 → 프로덕션 빌드 |
| `npm run storybook` | 토큰 빌드 후 Storybook (:6006) |
| `npm run typecheck` | 타입만 검사 |
| `npm run tokens:build` | `tokens/design-tokens.json` → `src/styles/theme.css` |
| `npm run tokens:verify` | Figma 컬렉션 이름이 룰북 전제와 맞는지만 대조 |
| `npm run tokens:extract` | Figma 덤프 → `design-tokens.json` |

`dev` / `build` / `storybook` 앞에는 `tokens:build` 가 자동으로 붙는다. 토큰을 고친 뒤 따로 실행할 필요는 없다.

## 토큰 규칙 (요약 — 판단이 필요하면 룰북을 읽어라)

**색상·간격·폰트·그림자 값을 코드에 직접 쓰지 않는다.** 값이 필요하면 `tokens/design-tokens.json` 을 조회한다. 근사값을 지어내지 않는다 — 없으면 없다고 보고한다.

허용되는 두 가지 형태:

1. `@theme` 이 생성한 Tailwind 유틸 — `bg-interactive-primary-bg-default`, `p-surface-margin-base`, `shadow-mid`
2. CSS 변수 직접 참조 — `var(--liquid-glass-mid-frost)`

유틸이 없는 토큰(`liquid-glass`, `background-blur/progressive`)은 2번으로 쓴다.

금지:

- `#hex`, `rgb()`, `oklch()` 리터럴
- 임의의 숫자 — `p-[13px]`, `rounded-[7px]`
- 대괄호 임의값 — `bg-[#2563eb]`
- primitive 토큰 직접 사용 — 애초에 CSS 변수로 방출하지 않으므로 쓸 수 없다. 이건 의도된 제약이다 (컴포넌트는 semantic 만 쓴다)

`src/styles/theme.css` 는 **자동 생성물이다. 직접 수정하면 다음 빌드에 덮어써진다.** 값을 바꾸려면 `tokens/design-tokens.json` 을 고치고 `npm run tokens:build` 를 실행한다.

## 컴포넌트 구조

**1 컴포넌트 = 4 파일.** `src/components/{ComponentName}/` 아래:

```
Button/
  Button.tsx           구현
  Button.stories.tsx   CSF3 스토리
  types.ts             props 타입
  index.ts             공개 export
```

파일명과 컴포넌트명은 PascalCase 로 일치시킨다. Figma 이름에서 컴포넌트명을 뽑는 규칙은 `design-to-dev-rule.md` 에 있고, 그 결과가 그대로 파일명이 된다.

```
.skeleton/btn-ghost          → _SkeletonBtnGhost.tsx
btn-ghost                    → BtnGhost.tsx
btn-ghost/pattern-go-back    → PatternBtnGhostGoBack.tsx
```

> `design-to-dev-rule.md` §4 는 파일명 규칙을 "프로젝트마다 다르다"며 일부러 정하지 않았다. 위 PascalCase 규칙이 이 프로젝트의 선택이다 — 룰북과 충돌하는 게 아니라 룰북이 비워둔 자리를 채운 것이다.

레이어(스켈레톤/템플릿/패턴)를 판별하는 기준과 중첩 규칙은 `component-structure-rule.md` 를 읽어라. 추측하지 마라.

## Storybook

- **CSF3** — `satisfies Meta<typeof X>` + `StoryObj<typeof meta>`
- **autodocs** — `.storybook/preview.ts` 에서 전역 활성화되어 있다. 스토리마다 붙일 필요 없다
- **play function** — 상호작용이 있는 컴포넌트는 play 로 동작을 검증한다
- `parameters.design` 에 Figma 노드 URL 을 넣는다 (addon-designs)
- 컴포넌트를 만들면 스토리도 같이 만든다. 훅이 누락을 경고한다

## 에이전트 위임 규칙

| 상황 | 에이전트 |
|---|---|
| Figma URL 을 받아 컴포넌트/화면 구현 | `figma-implementer` |
| Figma 토큰과 `design-tokens.json` 이 어긋난 것 같을 때 | `token-checker` |
| 작업을 끝내고 전체 검사 | `qa-reporter` |
| 코드 전체에서 하드코딩 찾기 | `design-reviewer` |

에이전트는 **새 컨텍스트에서 시작한다.** 지금 세션에서 읽은 룰북 내용은 전달되지 않으므로, 에이전트가 스스로 `docs/README.md` 를 읽고 필요한 룰북을 Read 하게 되어 있다. 위임할 때 룰북 내용을 프롬프트에 복사해 넣지 마라 — 사본이 생기면 원본과 어긋난다.

## 룰북을 고치지 마라

`docs/design-system-rule/` 의 11개 파일은 이 프로젝트의 기준 문서다.

- 내용을 다른 문서로 복사하거나 요약해 옮기지 않는다. 경로로 참조만 한다
- 논리적 모순이나 코드와 맞지 않는 부분을 발견해도 **승인 없이 고치지 않는다.** 보고한다
- 사용자가 직접 수정한 뒤에는 그 내용이 기준이다

## 문서 라우팅

@.claude/CLAUDE.md
@docs/README.md

위 표의 행 중 지금 작업에 해당하는 것을 찾고, 거기 적힌 문서를 **코드를 쓰기 전에 Read 한다.**

- 룰북 본문은 컨텍스트에 자동으로 들어오지 않는다. 반드시 Read 도구로 직접 열어라.
  표에 적힌 제목만 보고 내용을 추측해서 작업하지 마라.
- 두 행에 걸치는 작업이면 둘 다 읽는다. 어느 행에도 없으면 안 읽어도 된다.
- 계획을 사용자에게 보고할 때 **이번에 읽은 룰북을 한 줄로 명시한다.**
  (예: "읽음: component-structure-rule.md, color-token-rule.md")
  해당 없어서 안 읽었으면 "룰북 해당 없음"이라고 적는다.
- 룰북 내용과 이 문서(CLAUDE.md)가 충돌하면 **룰북이 우선**이다.
  충돌을 발견하면 작업을 멈추고 사용자에게 보고한다.
