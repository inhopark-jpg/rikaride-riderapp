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
| `npm run tokens:audit` | 색상 토큰이 **두 모드에서 다 성립하는지** 검사 (결함 있으면 비정상 종료) |

`dev` / `build` / `storybook` 앞에는 `tokens:build` 가 자동으로 붙는다. 토큰을 고친 뒤 따로 실행할 필요는 없다.

## 토큰 규칙 (요약 — 판단이 필요하면 룰북을 읽어라)

**색상·간격·폰트·그림자 값을 코드에 직접 쓰지 않는다.** 값이 필요하면 `tokens/design-tokens.json` 을 조회한다. 근사값을 지어내지 않는다 — 없으면 없다고 보고한다.

허용되는 두 가지 형태:

1. `@theme` 이 생성한 Tailwind 유틸 — `bg-interactive-primary-surface-default`, `p-surface-margin-base`, `shadow-mid`
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
| Figma 에서 디자인 시스템 수정·컴포넌트 생성·화면 조립·기존 `language` 변수의 번역 값 채우기 | `figma-editor` — 메인이 계획 승인을 받은 뒤 위임. 변수가 바뀌었으면 이어서 `token-checker` |
| Figma 토큰과 `design-tokens.json` 이 어긋난 것 같을 때 | `token-checker` |
| 작업을 끝내고 전체 검사 | `qa-reporter` |
| 코드 전체에서 하드코딩 찾기 | `design-reviewer` |

에이전트는 **새 컨텍스트에서 시작한다.** 지금 세션에서 읽은 룰북 내용은 전달되지 않으므로, 에이전트가 스스로 `docs/README.md` 를 읽고 필요한 룰북을 Read 하게 되어 있다. 위임할 때 룰북 내용을 프롬프트에 복사해 넣지 마라 — 사본이 생기면 원본과 어긋난다.

Figma 를 다루는 에이전트에 위임할 때는 **아래 "Figma 파일" 섹션의 fileKey 와 승인된 계획을 프롬프트에 넣는다.** 서브에이전트는 사용자에게 질문할 수 없으므로 승인은 항상 메인이 받는다.

## Figma 파일

이 워크스페이스의 작업 대상 파일이다. 디자인 시스템(변수·컴포넌트)과 화면이 한 파일에 있다. URL 에 다른 파일이 주어지지 않은 요청은 이 파일을 대상으로 한다. **URL 의 원본은 여기 한 곳이다** — 에이전트나 다른 문서에 복사하지 않는다.

| 용도 | URL | fileKey |
|---|---|---|
| 메인 (디자인 시스템 + 화면) | https://www.figma.com/design/1ga1MZBmvVR9fybjbr1W0a/Rider-App | `1ga1MZBmvVR9fybjbr1W0a` |

### 노드를 가리킬 때 (사용자에게 보이는 모든 보고)

nodeId 만 적지 않는다 — 사용자는 `2705:12380` 을 보고 어떤 레이어인지 모른다. 다음 셋을 함께 적는다:

1. **레이어 이름** — `.gnb-bar-item/pattern-ride`
2. **위치** — 섹션·부모 (`ride 섹션 안, 셋 아래`)
3. **링크** — 위 URL 뒤에 `?node-id=` + nodeId 의 `:` 를 `-` 로 바꾼 값. 예: `[.gnb-bar-item/pattern-ride](https://www.figma.com/design/1ga1MZBmvVR9fybjbr1W0a/Rider-App?node-id=2705-12380)`

- 인스턴스 내부 레이어(id 가 `I` 로 시작)는 링크로 열리지 않을 수 있다. 가장 가까운 일반 노드의 링크에 경로(`부모 > 자식 > 레이어`)를 붙인다.
- 같은 종류 노드가 많으면 대표 몇 개만 링크하고 개수를 적는다.
- 서브에이전트도 이 형식으로 메인에 보고한다. 메인은 받은 보고를 이 형식으로 바꿔 사용자에게 전달한다.

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
