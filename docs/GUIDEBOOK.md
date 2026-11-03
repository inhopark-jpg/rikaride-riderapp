# rikaride 사용 가이드

이 문서는 rikaride 를 처음 접하는 팀원이 프로젝트에 합류해서 첫 작업을 시작하기까지 필요한 것을 담는다.

---

## 목차

0. [이 프로젝트는 무엇인가](#0-이-프로젝트는-무엇인가)
1. [용어 최소 정의](#1-용어-최소-정의)
2. [자주 하는 작업 — 상황별 액션 가이드](#2-자주-하는-작업--상황별-액션-가이드)
   - [A. 디자인 시스템(토큰) 수정 시](#a-디자인-시스템토큰-수정-시)
   - [B. 룰북 수정 시](#b-룰북-수정-시)
   - [C. 컴포넌트 작업](#c-컴포넌트-작업)
   - [D. QA / 릴리스 전 검증](#d-qa--릴리스-전-검증)
   - [E. 최초 셋업 (부트스트랩)](#e-최초-셋업-부트스트랩)
   - [F. Figma 직접 편집 (Claude 에게 맡기기)](#f-figma-직접-편집-claude-에게-맡기기)
3. [폴더 구조와 파일별 역할](#3-폴더-구조와-파일별-역할)
   - [A. 프로젝트 루트](#a-프로젝트-루트)
   - [B. `docs/` — 문서](#b-docs--문서)
   - [C. `tokens/` — 토큰 파이프라인](#c-tokens--토큰-파이프라인)
   - [D. `src/` — 소스 코드](#d-src--소스-코드)
   - [E. `.claude/` — Claude Code 전용 설정](#e-claude--claude-code-전용-설정)
4. [자주 겪는 실수와 대응](#4-자주-겪는-실수와-대응)
5. [참고 자료](#5-참고-자료)

---

## 0. 이 프로젝트는 무엇인가

Figma 디자인 시스템을 React 컴포넌트로 옮기는 프로젝트다. 특징:

- **Figma 가 진실의 원천** — 색상, 간격, 폰트, 컴포넌트 형태 전부 Figma 가 원본이다. 코드는 Figma 를 반영한다.
- **디자인 토큰이 자동으로 CSS 변수가 된다** — Figma 변수를 추출해서 스크립트로 CSS 로 변환한다. 색상값을 코드에 직접 쓰지 않는다.
- **컴포넌트는 Storybook 에서 검증한다** — 만든 컴포넌트는 Storybook 스토리로 시각적으로 확인한다.
- **Claude Code 로 대부분의 작업을 한다** — 파일을 손으로 만들기보다 AI 에게 자연어로 요청한다.

작업 시작 전 필요한 것:
- `npm install` 실행
- Figma 파일 접근 권한
- Claude Code 설치 (이미 되어 있어야 함)
- Figma MCP 연결 (`/mcp` 로 확인)

작업 대상 Figma 파일은 루트 `CLAUDE.md` 의 **"Figma 파일"** 섹션에 적혀 있다. 프롬프트에 URL 을 안 붙이면 Claude 는 이 파일을 대상으로 한다. 파일이 바뀌면 그 표만 고친다.

첫 세팅이면 **토큰 부트스트랩** 을 먼저 Claude 에게 요청해야 한다 (프롬프트는 [2-E-1](#e-1-토큰-부트스트랩) 참고 — 사용자가 직접 명령을 실행할 필요는 없다). `tokens/design-tokens.json` 이 없으면 이후 모든 작업이 무의미하다.

---

## 1. 용어 최소 정의

Section 2 를 이해하기 위한 최소 용어. 상세는 Section 3 참고.

| 용어 | 뜻 |
|---|---|
| **디자인 토큰** | "primary 배경색", "surface margin" 같이 이름 붙은 디자인 값. Figma 변수 = 코드의 토큰 |
| **룰북** | `docs/design-system-rule/` 아래 11개 마크다운 파일. 토큰 이름·컴포넌트 구조·명명 규칙의 기준 문서 |
| **슬래시 명령** | Claude 채팅창에 `/build-tokens` 처럼 `/` 로 시작하는 짧은 명령 |
| **에이전트** | 특정 작업 전문 AI 서브프로세스. 예: 코드 리뷰만 하는 프로세스, QA 만 하는 프로세스 |
| **스킬** | 반복되는 작업 절차를 묶어둔 재사용 지침 파일 |
| **훅** | 파일을 저장하는 순간 자동으로 도는 검사 스크립트. 사용자가 부르지 않아도 실행됨 |

---

## 2. 자주 하는 작업 — 상황별 액션 가이드

각 항목은 이 형식이다:

- **언제**: 어떤 상황인지
- **프롬프트 예시**: Claude 에게 뭘 치면 되는지
- **자동으로 벌어지는 일**: 프롬프트 후 Claude 가 하는 것
- **사용자 후속 액션**: 사람이 확인·판단해야 할 것

### A. 디자인 시스템(토큰) 수정 시

#### A-1. 토큰 값만 바뀜

**언제**: Figma 에서 `primary` 색상을 blue 계열에서 neutral 계열로 바꿈. 이름은 그대로.

**프롬프트 예시:**
```
Figma 에서 색상 몇 개 값이 바뀌었어. 반영해줘.
```

**자동으로 벌어지는 일:**
- Claude 가 재추출 실행
- `tokens/design-tokens.json` 갱신
- `src/styles/theme.css` 자동 재생성
- 모든 화면이 새 값으로 렌더

**사용자 후속 액션:**
- 권장: `npm run storybook` 열어서 주요 컴포넌트가 이상 없이 보이는지 눈으로 훑기
- 필수 아님: 코드는 한 줄도 안 건드림

---

#### A-2. 토큰 이름 변경 (rename)

**언제**: `interactive/primary/bg/base` → `interactive/primary/bg/default` 로 이름 통일하고 싶음.

**두 가지 순서 중 선택:**

**순서 A (룰북 먼저 — 권장)**
1. `docs/design-system-rule/color-token-rule.md` 를 직접 열어서 관련 문구 수정
2. `docs/design-system-rule/CHANGELOG.md` 에 한 줄 기록
3. Figma 에서 이름 변경
4. 프롬프트:
```
룰북에서 base 를 default 로 통일했어. Figma 도 바꿨으니 재추출하고
코드에서 옛 이름 참조하는 자리도 다 찾아서 마이그레이션해줘.
```

**순서 B (Figma 먼저)**
1. Figma 에서 이름 변경
2. 프롬프트:
```
/check-tokens
```
3. Claude 가 "🔁 rename" 으로 감지 (같은 ID, 경로 다름) 하고 보고
4. 승인하면 자동으로 json 갱신 + 코드 마이그레이션
5. 룰북 수정 프롬프트 별도로 실행

**자동으로 벌어지는 일:**
- 새 경로로 CSS 변수 방출
- 코드에서 옛 이름 참조하던 자리 리스트업
- 승인 후 자동 치환

**사용자 후속 액션 (필수):**
- 코드 마이그레이션 diff 검토 후 승인
- `npm run rulebook:verify` 로 룰북에 낡은 이름이 남아있지 않은지 확인
- `CHANGELOG.md` 에 기록

---

#### A-3. 토큰 신규 추가

**언제**: Figma 에 hover 상태용 `interactive/primary/bg/hover` 를 새로 추가.

**프롬프트 예시:**
```
Figma 에 hover 토큰 추가했어. 반영해줘.
```

또는:
```
/check-tokens
```

**자동으로 벌어지는 일:**
- Claude 가 재추출 → "🆕 신규 토큰" 으로 보고
- **자동 추가 안 함** — 승인을 요청함
- 승인하면 json 에 추가 + `tokens:build` 재실행

**사용자 후속 액션:**
- 새 토큰이 실제로 필요한 것인지 판단 후 승인
- 승인 후 새 유틸 클래스가 컴포넌트에서 즉시 사용 가능 (`bg-interactive-primary-bg-hover`)

---

#### A-4. 토큰 삭제

**언제**: Figma 에서 안 쓰는 토큰을 지웠음.

**프롬프트 예시:**
```
Figma 에서 토큰 몇 개 지웠어. 반영해줘.
```

**자동으로 벌어지는 일:**
- Claude 가 "🗑️ 삭제된 토큰" 으로 보고
- 코드에서 그 토큰을 쓰고 있는 자리가 있으면 위치까지 함께 보고
- 승인 요청

**사용자 후속 액션 (필수):**
- 코드에서 쓰는 자리가 있으면 어떻게 할지 결정 (다른 토큰으로 교체 / 그 코드 삭제)
- 결정 후 승인

---

#### A-5. 기본 모드 변경 (light → dark 등)

**언제**: Figma 에서 색상 컬렉션의 기본 모드를 바꿈.

**프롬프트 예시:**
```
색상 토큰 기본값 모드 변경됨. 반영하고 Storybook 열어줘.
```

**자동으로 벌어지는 일:**
- 재추출 → 각 토큰의 기본값이 새 모드 값으로 갱신
- `theme.css` 재생성 → 모든 화면이 새 기본으로 재렌더

**사용자 후속 액션 (필수):**
- **눈으로 확인 필수** — 자동 검증으로는 잡히지 않음
- Storybook 에서 주요 컴포넌트가 새 기본에서도 자연스러운지 훑기
- 이상하면 이어서 요청:
```
이 컴포넌트가 새 기본 모드에서 이상해. 봐줘.
```

---

#### A-6. 새 모드 추가

**언제**: high-contrast 모드 같은 걸 새로 만듦.

**프롬프트 예시:**
```
high-contrast 모드를 새로 만들었어. 반영해줘.
```

**자동으로 벌어지는 일:**
- 재추출 → 새 모드 인식
- 모드별 오버라이드 블록이 CSS 에 추가됨

**사용자 후속 액션 (필수):**
- **모든 토큰이 새 모드에도 값을 갖는지 확인** — Figma 는 모드 추가 시 값을 자동으로 채우지 않을 수 있음
- 값이 빈 토큰이 있으면 Figma 에서 채우고 다시 재추출
- 컴포넌트 레벨에서 `data-theme="high-contrast"` 로 이 모드를 명시적으로 지정할지 결정

---

#### A-7. `language` 변수의 값 변경 (예: "다음" → "계속하기")

**언제**: Figma 에서 `language` 컬렉션의 특정 변수 값을 다른 문자열로 바꿈. 예: 변수 `…/jpb5aj` 의 Korean 모드 값을 "텍스트 노드" → "본문" 으로 변경.

**중요**: `language` 변수는 디자인 토큰이 아니다. 시각 토큰([A-1](#a-1-토큰-값만-바뀜)~[A-6](#a-6-새-모드-추가)) 과 파이프라인이 다름:
- 시각 토큰: `design-tokens.json` → `theme.css` 로 흐름
- language 변수: `figma-dump.js` 덤프 → 언어별 i18n 파일 (키 = 변수명 끝 6자 ID) 로 흐름 (i18n = 국제화, internationalization)

**전제**: 없음. 추출 스크립트(`npm run i18n:extract`)와 번역 함수(`src/i18n`)가 이미 있다 ([E-2](#e-2-i18n-인프라-셋업-language-컬렉션이-있을-때)).

**프롬프트 예시:**
```
Figma 에서 language 변수 몇 개 값이 바뀌었어. 반영해줘.
```

**자동으로 벌어지는 일:**
- Claude 가 `figma-dump.js` 로 language 컬렉션을 재추출
- 바뀐 값을 6자 ID · 언어 모드별로 before → after 보고. `--`(미번역)·빈 값은 따로 누락으로 보고
- 승인 후 `npm run i18n:extract` 로 `src/i18n/locales/` 갱신. Figma 에 언어 모드가 늘면 파일도 자동으로 늘어난다
- **컴포넌트 코드는 한 줄도 안 건드림** — 컴포넌트는 6자 ID 로 문자열을 부르니까, 값만 바뀌면 자동 반영

`sync-tokens` / `/check-tokens` 는 `design-tokens.json` 기준이라 language 변수 변경을 잡지 않는다.

**사용자 후속 액션:**
- diff 확인 후 승인
- 앱 실행 또는 Storybook 열어서 새 문자열이 실제로 나오는지 확인
- 영향 큰 문자열 변경(랜딩 카피 등) 은 관계자 리뷰 후 반영

**하지 말 것:**
- i18n 파일을 직접 편집 → 다음 재추출에 덮어써짐. **Figma 를 먼저 바꾸고 재추출** 원칙 유지
- 컴포넌트 코드에서 문자열을 임시로 하드코딩해서 교체 → 하드코딩 원칙 위배

---

### B. 룰북 수정 시

#### B-1. 사용자가 직접 편집

**언제**: `docs/design-system-rule/*.md` 를 에디터로 직접 여는 경우.

**절차:**
1. 룰북 편집
2. 관련 다른 룰북(§참조로 걸린 것들)도 함께 확인
3. `docs/design-system-rule/CHANGELOG.md` 에 한 줄 기록
```
## 2026-09-27
- color-token-rule.md §5 — 그룹 불일치 판정 기준 완화 — 브랜드 확장 대응
```
4. `npm run rulebook:verify` 실행 (`design-tokens.json` 이 있을 때)

**사용자 후속 액션 (권장):**
- 룰북 수정 후 Claude 에게 관련 코드 스캔 요청:
```
방금 color-token-rule.md 을 수정했어. 이 수정이 코드에 영향을 주는지 확인해줘.
```

---

#### B-2. Claude 에게 룰북 수정 위임

**언제**: 직접 수정하기엔 룰북 간 연쇄 영향이 걱정될 때.

**프롬프트 예시:**
```
color-token-rule.md §5 의 그룹 불일치 검사 기준을 완화하고 싶어.
룰북 편집 프로토콜대로 진행해줘.
```

**자동으로 벌어지는 일:**
Claude 가 5단계 프로토콜을 따름:
1. 관련 룰북 전부 Read
2. 영향받는 섹션 열거해서 보고
3. 각 섹션 수정안을 개별 승인 요청
4. `CHANGELOG.md` 갱신
5. `rulebook:verify` 실행

**사용자 후속 액션 (필수):**
- 각 섹션 수정안을 하나씩 확인하고 승인/반려
- 어느 하나가 반려되면 그 이전 승인분은 커밋되지 않음

---

### C. 컴포넌트 작업

#### C-1. Figma 에서 새 컴포넌트를 만들고 코드로 옮김

**언제**: Figma 에서 새 버튼/카드 같은 컴포넌트를 완성한 뒤.

**프롬프트 예시:**
```
이 Figma 컴포넌트 구현해줘: https://figma.com/design/xxx?node-id=123
```

또는:
```
/implement-figma https://figma.com/design/xxx?node-id=123
```

**자동으로 벌어지는 일:**
`figma-implementer` 에이전트가 5단계 절차:
1. Clarify — 뭘 만들지 사용자에게 확인
2. Context Gather — `docs/README.md` 라우터 → 해당 룰북들 자동 Read
3. Plan — 만들 파일 목록, 쓸 토큰, 모드 설정을 보고
4. Generate — 승인 후 4파일 세트 생성 (`.tsx` / `.stories.tsx` / `types.ts` / `index.ts`)
5. Evaluate — 빌드, 타입체크, Figma 스크린샷 대조

**사용자 후속 액션:**
- Plan 단계에서 쓸 토큰이 의도한 것인지 확인 후 승인
- 완료 후 Storybook 에서 컴포넌트가 Figma 와 일치하는지 눈으로 확인

---

#### C-2. 이미 있는 컴포넌트에 스토리를 일괄 추가

**언제**: 컴포넌트는 있는데 `.stories.tsx` 가 빠진 것들이 여럿.

**프롬프트 예시:**
```
/gen-all-stories
```

**자동으로 벌어지는 일:**
- `src/components/` 스캔
- 스토리 없는 컴포넌트에 대해 CSF3 형식 스토리 생성
- 완료 후 신규 생성 수, 기존 존재 수 보고

**사용자 후속 액션:**
- Storybook 에서 각 스토리가 잘 뜨는지 확인
- variant 가 모두 커버됐는지 훑기

---

#### C-3. 하나의 컴포넌트에 대해서만 스토리 만들기

**언제**: 특정 컴포넌트만 스토리가 필요한 경우.

**프롬프트 예시:**
```
/gen-story Button
```

또는:
```
Button 컴포넌트 스토리 만들어줘.
```

**자동으로 벌어지는 일:**
- Button 의 props 인터페이스 분석
- 각 variant 별 스토리 생성
- play function 최소 1개 포함

---

#### C-4. 기존 컴포넌트 수정 (Figma 변경 반영)

**언제**: Figma 에서 Button 에 새 size 를 추가함.

**프롬프트 예시:**
```
Button 컴포넌트에 새 size 추가된 걸 반영해줘: <Figma URL>
```

**자동으로 벌어지는 일:**
- `figma-implementer` 에이전트가 위임받음
- 기존 컴포넌트 확인 → 새 variant 추가 계획 보고 → 승인 후 반영
- 스토리에도 새 variant 자동 추가

---

#### C-5. 컴포넌트에 다국어 텍스트(`language` 변수)가 있을 때

**언제**: Figma 컴포넌트의 text prop 이나 텍스트 노드에 `language` 컬렉션의 변수가 참조로 걸려 있을 때 (예: 하드코딩된 "다음" 이 아니라 `…/jpb5aj` 변수가 걸림).

**전제**: 없음. 번역 함수 `t(id, 언어)` 가 `src/i18n` 에 있다 ([E-2](#e-2-i18n-인프라-셋업-language-컬렉션이-있을-때)).

**프롬프트 예시:**
```
이 Figma 컴포넌트 구현해줘: <URL>
```

특별한 프롬프트가 필요 없음. 일반 Figma 구현 요청과 같음 — `figma-implementer` 가 language 변수를 자동으로 감지함.

**자동으로 벌어지는 일:**
- `figma-implementer` 가 Figma 노드를 읽으면서 text prop 에 걸린 `language` 변수를 감지
- `language-rule.md` 를 자동으로 Read → 원칙 파악
- 코드에 하드코딩된 문자열 대신 번역 함수 사용. 키는 변수명 끝의 6자 ID:
  ```
  // 나쁨: <Text>텍스트 노드</Text>
  // 나쁨: <Text>{t('section-section-2/layer-frame-3/jpb5aj')}</Text>   ← 경로는 바뀔 수 있음
  // 좋음: <Text>{t('jpb5aj')}</Text>
  ```
- Plan 단계에서 "이 컴포넌트는 language 변수 `jpb5aj` 를 참조합니다" 라고 보고
- 값이 `--`(미번역) 인 언어가 있으면 Plan 에 적음

**사용자 후속 액션 (필수):**
- Plan 에서 참조하는 language 변수 목록 확인 후 승인
- 완료 후 브라우저에서 언어 전환해보고 실제로 문자열이 바뀌는지 확인
- 참조된 ID 가 i18n 파일에 실제로 있는지 확인 (없으면 Claude 가 알려줌)

**주의 — 하드코딩 감지의 한계:**
현재 rikaride 의 자동 검사(`check-design-tokens.mjs`, `verify-design`) 는 하드코딩된 색상·치수는 잡지만 **하드코딩된 문자열은 잡지 않음.** 이유: aria-label, 개발자 툴팁, 로그 메시지처럼 정당한 하드코딩 케이스도 많아서 일괄 금지가 어려움.

즉 Claude 가 실수로 `<Text>다음</Text>` 같이 UI 문자열을 하드코딩해도 훅이 경고를 안 줌. **사람 검토가 안전망** — 리뷰 시 하드코딩된 UI 문자열이 있는지 확인.

**정당한 하드코딩 vs UI 하드코딩 구분:**
- ✅ 정당: `aria-label="close"`, `console.log("Debug info")`, 개발용 메시지
- ❌ 문제: 사용자 눈에 보이는 UI 문자열 (버튼 라벨, 안내 문구, 에러 메시지 등)

---

### D. QA / 릴리스 전 검증

#### D-1. 기본 QA (코드만)

**프롬프트 예시:**
```
QA 돌려줘.
```

**자동으로 벌어지는 일:**
`qa-reporter` 에이전트가 코드 검사 9항목 실행:
- 빌드, 타입체크, 토큰 생성, 하드코딩, 존재하지 않는 참조, primitive 참조, `theme.css` 오염, 4파일 구조, Storybook 빌드

**결과:** 통과/실패/경고 리포트

---

#### D-2. Figma 원본까지 비교하는 QA

**프롬프트 예시:**
```
QA 돌려줘, Figma 원본이랑 비교까지.
```

**자동으로 벌어지는 일:**
[D-1](#d-1-기본-qa-코드만) 의 9항목 + Figma 비교 2항목:
- Figma 변수 vs `design-tokens.json` 일치 여부
- Figma 스크린샷 vs 실제 렌더링 대조

**언제 쓰나:** 모드 기본값 변경 후, 릴리스 전, 대규모 토큰 변경 후.

---

#### D-3. Figma 구조 검사

**언제**: Figma 에서 컴포넌트·화면을 만들거나 고친 뒤 (사람이 했든 Claude 가 했든). 코드와는 무관하게 **Figma 파일 자체**가 룰북을 따르는지 본다.

**프롬프트 예시:**
```
/figma-audit https://www.figma.com/design/...?node-id=123-456
```

또는:
```
온보딩 섹션 Figma 검사해줘.
```

**자동으로 벌어지는 일:**
`qa-reporter` 에이전트가 Figma 구조 5항목만 검사:
- 이름 — 컴포넌트 이름(`component-structure-rule.md` §3)과 Text Style 이름(`text-style-rule.md` §2)이 규칙을 따르는가
- 3계층 판별 — 스켈레톤/템플릿/패턴 판별과 중첩이 맞는가
- 섹션 배치 — 위치와 섹션 이름이 규칙대로인가 (`section-layout-rule.md`)
- 변수 바인딩 — 색·간격 등에 리터럴 값이나 primitive 변수가 직접 들어가 있지 않은가
- 하드코딩 텍스트 — `language` 변수에 바인딩 안 된 텍스트 노드가 있는가 (번역 테이블은 제외), 값이 `--`(미번역) 인 모드가 있는가

문제가 있으면 노드 이름과 nodeId 까지 적어서 보고한다. **고치지는 않는다.**

**사용자 후속 액션:**
- 범위 없이 부르면 어느 페이지·섹션을 볼지 되묻는다. 파일 전체는 크니까 범위를 지정하는 게 빠르다
- 보고된 문제를 직접 고치거나, [F](#f-figma-직접-편집-claude-에게-맡기기) 방식으로 Claude 에게 수정을 맡긴다

---

### E. 최초 셋업 (부트스트랩)

#### E-1. 토큰 부트스트랩

**언제**: 프로젝트 첫 셋업 직후, `tokens/design-tokens.json` 이 아직 없을 때.

**프롬프트 예시:**
```
docs/TOKENS.md 절차대로 토큰 부트스트랩 해줘. 이 Figma 파일 씀: <URL>
```

**자동으로 벌어지는 일:**
1. `docs/TOKENS.md` Read
2. `figma-dump.js` 의 step1 실행 → 컬렉션 목록 확인
3. `npm run tokens:verify` 로 룰북 전제와 이름 대조 (다르면 여기서 멈추고 보고)
4. 컬렉션마다 step2 실행 → 변수 덤프
5. step3(Text Style), step4(Effect Style) 실행
6. `npm run tokens:extract` → `design-tokens.json` 생성
7. `npm run tokens:build` → `theme.css` 생성

**사용자 후속 액션 (필수):**
- 컬렉션 이름이 룰북 전제와 다르다는 보고를 받으면 강제로 진행하지 말 것. 세 가지 선택:
  - Figma 이름을 룰북에 맞춰 수정
  - 룰북을 새 이름 체계에 맞춰 수정
  - 이 프로젝트에는 그 룰북을 적용하지 않기로 결정

---

#### E-2. i18n 인프라 셋업 (language 컬렉션이 있을 때)

**상태: 셋업됨.** 다시 할 일은 없고, Figma 의 language 컬렉션이 바뀌면 재추출만 한다 ([A-7](#a-7-language-변수의-값-변경-예-다음--계속하기)).

| 무엇 | 어디 |
|---|---|
| 추출 스크립트 | `tokens/extract/to-i18n.mjs` (`npm run i18n:extract`). 입력은 `figma-dump.js` 의 language 덤프 |
| 언어 파일 | `src/i18n/locales/{언어}.json` — 키 = 변수명 끝 6자 ID. Figma 모드 하나당 파일 하나 |
| 언어 목록 | `src/i18n/locales/index.json` — 기본 언어와 언어 목록. 프로토타입의 언어 설정 메뉴가 이걸 읽는다 |
| 번역 함수 | `src/i18n/index.ts` 의 `t(id, 언어)`. 외부 라이브러리 없이 직접 만든 함수 (프로토타입이라 충분) |

`--`·빈 값은 파일에 넣지 않고 추출할 때 누락으로 보고한다. 앱에서는 기본 언어 문자열로 대체된다.

**사용자 후속 액션:**
- 앱에서 언어를 바꿀 때 typeface-semantic 모드도 함께 바뀌는지 확인 (동기 전환 원칙 — `language-rule.md` §3)

---

### F. Figma 직접 편집 (Claude 에게 맡기기)

A~E 가 "Figma 를 읽어서 코드에 반영" 이라면, 여기는 **Claude 가 Figma 파일 자체를 고치는** 작업이다. `figma-editor` 에이전트가 맡는다.

#### F-0. 공통 흐름 — 먼저 읽을 것

모든 F 작업은 같은 순서로 진행된다:

1. 프롬프트를 받은 Claude(메인 세션)가 룰북을 읽고 **계획을 보고** — 대상 섹션·노드, 만들거나 바꿀 것과 3계층 판별 근거, 쓸 변수 이름, 영향받는 범위, 되돌리는 방법
2. **사용자가 승인**
3. `figma-editor` 가 승인된 범위만 Figma 에서 편집
4. 편집 결과 보고 (편집한 노드, 바뀐 변수, 못 한 것, 후속 작업)
5. 필요하면 [D-3](#d-3-figma-구조-검사) 로 검사

`figma-editor` 는 사용자에게 직접 질문하지 못한다. 그래서 질문·승인은 전부 1~2 단계에서 끝내야 하고, 계획에 없는 판단이 필요해지면 편집을 멈추고 돌아와서 보고한다. 계획에 없는 변수는 만들지도 지우지도 않는다.

**사용자 후속 액션 (공통):**
- 계획 단계에서 대상 섹션과 변수 이름이 의도와 맞는지 확인 후 승인
- 편집 후 Figma 에서 결과를 눈으로 확인. 마음에 안 들면 Figma 버전 기록(Version history) 이나 계획의 "되돌리기 방법" 으로 복구
- 실패 보고가 오면 "이미 편집된 노드" 목록을 확인 — 파일이 반쯤 바뀐 상태일 수 있다

---

#### F-1. 디자인 시스템 수정 (Figma + 코드 토큰 동시 갱신)

**언제**: 변수 값·이름을 바꾸거나 컴포넌트 구조를 고치고, 그 결과를 `tokens/design-tokens.json` 에도 반영해야 할 때.

**프롬프트 예시:**
```
interactive/primary/bg/default 값을 바꾸고 싶어. Figma 고치고 토큰도 반영해줘.
```

**자동으로 벌어지는 일:**
- 계획 승인 후 `figma-editor` 가 **Figma 를 먼저** 고친다 (Figma 가 원본이라서)
- 이어서 `token-checker` 가 재추출 → 바뀐 토큰을 before → after 로 보고 → 승인 후 `design-tokens.json` 갱신 + `tokens:build`
- 이름 변경·삭제가 있었으면 `design-reviewer` 로 코드 영향까지 스캔

**사용자 후속 액션 (필수):**
- 계획 승인 + 토큰 diff 승인, **두 번 승인한다**
- 이름 변경이면 룰북에 옛 이름이 남았는지 `npm run rulebook:verify` 로 확인 ([A-2](#a-2-토큰-이름-변경-rename) 참고)

---

#### F-2. Figma 에 컴포넌트 만들기

**언제**: 새 버튼·카드 같은 컴포넌트를 Figma 에 만들고 싶을 때.

**프롬프트 예시:**
```
Buttons 페이지의 btn-ghost 섹션에 pattern-go-back 패턴을 만들어줘.
```

**자동으로 벌어지는 일:**
- 계획에서 레이어(스켈레톤/템플릿/패턴) 판별 근거, 룰북 네이밍을 적용한 이름, 놓을 섹션, 쓸 변수를 보고
- 승인 후 `figma-editor` 가 생성 → 스크린샷으로 확인
- 코드로는 옮기지 않는다. 코드가 필요하면 이어서 [C-1](#c-1-figma-에서-새-컴포넌트를-만들고-코드로-옮김)

---

#### F-3. 기존 디자인 시스템으로 새 화면 만들기

**언제**: 새 화면이 필요할 때. 가장 복잡한 작업이다 — 기존 컴포넌트 재사용, 확장, 신규 제작이 섞인다.

**프롬프트 예시:**
```
라이더 온보딩 첫 화면을 만들어줘. 상단 진행 표시, 안내 문구, 다음 버튼.
```

**자동으로 벌어지는 일:**
1. Claude 가 파일의 기존 컴포넌트를 조사
2. 화면의 요소마다 **재사용 / 확장 / 신규** 를 나눈 표를 계획에 담아 보고
3. 승인 후 신규·확장 컴포넌트부터 하나씩 처리 ([F-2](#f-2-figma-에-컴포넌트-만들기) 와 같은 방식)
4. 컴포넌트가 다 준비되면 화면 조립

**사용자 후속 액션:**
- **분류표가 핵심 승인 포인트.** "이건 기존 걸로 충분" / "이건 확장 말고 새로" 같은 판단을 여기서 한다
- 큰 화면은 한 번에 맡기기보다 영역 단위로 나눠 요청하는 게 결과가 안정적이다

---

#### F-4. 하드코딩된 Figma 텍스트를 i18n 으로 바꾸기

**언제**: Figma 텍스트 노드에 "다음" 같은 문자열이 직접 쓰여 있어서 `language` 변수로 바꾸고 싶을 때.

**누가 무엇을 하나:**

| 일 | 누가 |
|---|---|
| 하드코딩 텍스트 찾기 | Claude (`/figma-audit`) |
| 언어별 번역 제안 | Claude |
| 변수 생성 · 텍스트 노드 연결 · 번역 테이블 | **사람이 i18n 플러그인으로** |
| 이미 있는 변수의 `--`(미번역)·틀린 값 채우기 | Claude (`figma-editor`, 승인 후) 또는 사람 |

변수 생성·연결을 Claude 에게 맡기지 않는 이유: 플러그인이 변수 이름(`{섹션 경로}/{레이어}/{6자 ID}`)을 붙이면서 key 레이어 같은 자기 내부 데이터를 같이 기록하는데, 이 데이터는 플러그인만 쓸 수 있다. Claude 가 `use_figma` 로 만들면 플러그인이 그 변수를 제대로 관리하지 못한다 (`language-rule.md` §5).

**1단계 — 찾기 + 번역 제안 (Claude):**
```
/figma-audit <온보딩 섹션 URL>
하드코딩 텍스트만 보고, 각 문자열의 영어 번역도 제안해줘.
```
번역 테이블(`i18n-table`) 안의 텍스트와 헤더는 검사에서 빠진다.

**2단계 — 변수 생성·연결 (사람, i18n 플러그인 `CG-figma-plugins/i18n`):**
1. 텍스트 레이어 선택 → "토큰 생성하기"
2. 기본 모드 값은 레이어 텍스트로 채워져 있음. 나머지 모드에 1단계에서 받은 번역 입력 (모르면 비워 두면 `--`)
3. "생성 및 적용" → 변수 생성·연결이 한 번에 됨
4. 필요하면 화면 옆에 번역 테이블을 붙여 검토

**3단계 — 미번역 채우기 (선택, Claude):**
```
온보딩 섹션 language 변수 중 English 가 -- 인 것들 번역 채워줘.
```
계획(변수 ID · before → after) 승인 후 `figma-editor` 가 값만 바꾼다. 이름·연결은 건드리지 않는다.

**사용자 후속 액션:**
- 번역은 Claude 가 제안한 값이니 검토 필요
- 섹션이나 페이지 단위로 `language` 모드를 바꿔 레이아웃이 깨지지 않는지 확인
- 코드용 i18n 파일로 뽑는 건 [E-2](#e-2-i18n-인프라-셋업-language-컬렉션이-있을-때) 의 인프라가 필요하다

---

## 3. 폴더 구조와 파일별 역할

### A. 프로젝트 루트

```
rikaride/
├── CLAUDE.md               ← Claude 가 매 세션 자동으로 읽는 최상위 규칙
├── package.json            ← npm 스크립트 정의
├── vite.config.ts          ← 빌드 도구 설정
├── tsconfig*.json          ← TypeScript 설정
├── index.html              ← Vite 진입점
├── docs/                   ← 문서 (섹션 3-B)
├── tokens/                 ← 토큰 파이프라인 (섹션 3-C)
├── src/                    ← 소스 코드 (섹션 3-D)
├── .storybook/             ← Storybook 설정
└── .claude/                ← Claude Code 전용 설정 (섹션 3-E)
```

폴더별 상세: [3-B `docs/`](#b-docs--문서) · [3-C `tokens/`](#c-tokens--토큰-파이프라인) · [3-D `src/`](#d-src--소스-코드) · [3-E `.claude/`](#e-claude--claude-code-전용-설정)

**CLAUDE.md** 는 Claude 가 프로젝트에 처음 접근할 때 반드시 읽는 파일이다. 이 프로젝트의 전반적인 규칙(토큰 하드코딩 금지, 컴포넌트 4파일 구조 등) 이 여기에 요약되어 있고, 상세 규칙은 `docs/` 로 경로만 가리킨다. 작업 대상 **Figma 파일 URL 도 여기 "Figma 파일" 섹션에 한 곳만** 적는다.

**package.json** 의 스크립트 중 자주 쓸 것:

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 (자동으로 토큰 빌드 선행) |
| `npm run build` | 프로덕션 빌드 |
| `npm run storybook` | Storybook 실행 (:6006) |
| `npm run tokens:build` | `design-tokens.json` → `theme.css` 생성 |
| `npm run tokens:extract` | Figma 덤프 → `design-tokens.json` |
| `npm run tokens:verify` | 컬렉션 이름이 룰북 전제와 맞는지 대조 |
| `npm run rulebook:verify` | 룰북이 언급한 토큰이 실제로 있는지 대조 |
| `npm run typecheck` | 타입 검사만 |

---

### B. `docs/` — 문서

```
docs/
├── README.md               ← 문서 라우터. "어떤 상황에 어떤 문서를 읽을지" 표 (Claude 전용)
├── GUIDEBOOK.md            ← 지금 이 문서. Claude Code로 작업하는 법
├── FIGMA-GUIDEBOOK.md      ← 사람이 Figma에서 직접 작업하는 법 (Claude는 안 읽음)
├── TOKENS.md               ← 토큰 부트스트랩·업데이트 절차
├── DESIGN.md               ← 제품 성격·디자인 원칙 (규칙 아님)
└── design-system-rule/     ← 룰북 11개 + 변경 로그
    ├── color-token-rule.md
    ├── shape-token-rule.md
    ├── typography-token-rule.md
    ├── text-style-rule.md
    ├── effect-token-rule.md
    ├── icon-frame-rule.md
    ├── language-rule.md
    ├── component-structure-rule.md
    ├── section-layout-rule.md
    ├── design-to-dev-rule.md
    ├── annotation-rule.md
    └── CHANGELOG.md
```

**README.md** 는 "이럴 때 이 문서를 읽어라" 는 분기표를 담은 라우터다. Claude 가 작업 전 이 파일을 먼저 읽고, 표에서 해당 행을 찾아 지정된 룰북을 읽는다.

**TOKENS.md** 는 Figma 에서 토큰을 처음 뽑는 부트스트랩 절차와, 이후 값·이름·모드가 바뀌었을 때 대응 절차를 담는다. **주 대상은 Claude** — 사용자가 이 문서의 명령을 직접 실행할 필요는 없다. [2-E-1](#e-1-토큰-부트스트랩) 의 프롬프트만 치면 Claude 가 이 절차대로 진행한다.

**DESIGN.md** 는 "왜 이 프로젝트가 이런 결정을 했는가" 같은 배경 설명. 규칙이 아니라 맥락.

**FIGMA-GUIDEBOOK.md** 는 아래 룰북 11개 중 사람이 Figma에서 직접 컴포넌트를 만들거나 토큰·스타일을 적용할 때 필요한 부분만 사람이 읽기 쉽게 정리한 요약본이다. Claude는 이 문서를 읽지 않고 룰북 원문을 직접 읽는다 — 이 문서와 룰북 원문이 어긋나면 원문이 맞다.

**`design-system-rule/`** 의 11개 룰북은 이 프로젝트의 **기준 문서** 다. Claude 가 컴포넌트를 만들거나 토큰을 다룰 때 반드시 참조한다.

| 룰북 | 다루는 것 |
|---|---|
| `color-token-rule.md` | 색상 토큰의 그룹·역할·상태 3분해(그룹 3종), `styles` 그룹, 모드 축과 다크모드 값 산출, 모드 오버라이드 |
| `shape-token-rule.md` | 간격·radius·아이콘 크기 토큰. 의미 기반 토큰 우선 |
| `typography-token-rule.md` | 폰트 패밀리·굵기·크기·행간 변수 구조 |
| `text-style-rule.md` | 디자이너가 실제로 쓰는 완성 프리셋(Text Style) |
| `effect-token-rule.md` | 그림자·블러·유리 효과·그라디언트 색상 스타일의 시각적 정의와 색 출처 |
| `icon-frame-rule.md` | `icon-frame-*` 컴포넌트와 `icon-frame` 컬렉션 — 텍스트 카테고리·스텝 매칭 규칙 |
| `language-rule.md` | `language` 컬렉션. 다국어 i18n 문자열(디자인 토큰 아님), 텍스트 노드/text prop 에만 적용, 코드 키는 변수명 끝 6자 ID |
| `component-structure-rule.md` | 스켈레톤/템플릿/패턴 3계층 판별 규칙 |
| `section-layout-rule.md` | Figma 페이지 안의 섹션 구성(컴포넌트 레이아웃 / 페이지 레이아웃)과 기존 섹션을 읽는 법 |
| `design-to-dev-rule.md` | Figma↔코드 변환 규칙 — 이름 변환 알고리즘 + 스켈레톤/템플릿 속성 재선언 처리 |
| `annotation-rule.md` | Figma 캔버스 주석 — variant 브래킷, 주소(platter·anchor), annotation, spec, 주석 섹션 |

**CHANGELOG.md** 는 룰북 편집 이력을 기록한다. 사용자·Claude 누가 편집했든 남긴다.

---

### C. `tokens/` — 토큰 파이프라인

```
tokens/
├── design-tokens.json      ← 모든 토큰 값의 유일한 진실의 원천
├── build-theme.mjs         ← design-tokens.json → src/styles/theme.css 변환
├── verify-rulebook.mjs     ← 룰북과 design-tokens.json 정합성 검사
└── extract/                ← Figma 에서 토큰을 뽑는 도구들
    ├── figma-dump.js       ← Figma Plugin API 스니펫 (use_figma 로 실행)
    ├── to-dtcg.mjs         ← 덤프 → design-tokens.json 변환 + 검증
    ├── collections.json    ← 룰북이 전제하는 컬렉션 이름 목록 (검증 기준)
    ├── raw/                ← 덤프 원본 (git 에 안 올림)
    └── README.md           ← extract 절차 요약
```

**design-tokens.json** 은 모든 값의 원본이다. 컴포넌트 코드가 색상 리터럴을 쓰지 않고 이 파일 기반의 CSS 변수만 참조한다. 이름과 경로를 임의로 바꾸지 않는다 — 룰북들이 이 파일을 이름으로 참조한다.

**build-theme.mjs** 는 위 JSON 을 읽어 `src/styles/theme.css` 를 만든다. `npm run tokens:build` 가 이걸 실행한다.

**verify-rulebook.mjs** 는 룰북이 언급한 토큰 경로가 `design-tokens.json` 에 실제로 있는지 대조한다. 룰북과 현실의 어긋남을 조기에 잡기 위한 정보성 검사. `npm run rulebook:verify` 가 실행한다.

**extract/figma-dump.js** 는 Figma Plugin API 를 부르는 JavaScript. `use_figma` MCP 를 통해 실행되어 Figma 변수를 컬렉션 단위로 덤프한다.

**extract/to-dtcg.mjs** 는 덤프한 raw JSON 을 `design-tokens.json` 형식으로 변환한다. 이 과정에서 컬렉션 이름이 룰북 전제와 다르면 멈추고 보고한다.

**extract/collections.json** 은 "룰북이 어떤 컬렉션 이름을 가정하는가" 를 명시한 파일. Figma 실제 컬렉션과 이걸 대조해서 검증한다.

---

### D. `src/` — 소스 코드

```
src/
├── main.tsx                ← 앱 진입점
├── App.tsx                 ← 최상위 컴포넌트
├── index.css               ← Tailwind 로드
├── vite-env.d.ts           ← TypeScript 환경 타입
├── styles/
│   └── theme.css           ← 자동 생성물. 직접 수정 금지
└── components/             ← 디자인 시스템 컴포넌트가 들어가는 곳
    └── {ComponentName}/    ← 각 컴포넌트는 4파일 세트
        ├── {ComponentName}.tsx
        ├── {ComponentName}.stories.tsx
        ├── types.ts
        └── index.ts
```

**styles/theme.css** 는 `build-theme.mjs` 가 자동으로 만드는 파일. `protect-files` 훅이 편집을 차단한다. 값을 바꾸려면 `design-tokens.json` 을 고치고 `tokens:build` 를 다시 돌린다.

**components/** 아래는 각 컴포넌트마다 폴더 하나. 폴더 안에는 **반드시 4개 파일** 세트:

- `{Name}.tsx` — 실제 구현
- `{Name}.stories.tsx` — Storybook 스토리
- `types.ts` — props 타입 정의
- `index.ts` — 폴더 밖으로 노출할 것들 export

파일 이름은 컴포넌트 이름과 동일한 PascalCase. Figma 이름에서 코드 이름으로의 변환 규칙은 `docs/design-system-rule/design-to-dev-rule.md` 에 있다.

---

### E. `.claude/` — Claude Code 전용 설정

```
.claude/
├── CLAUDE.md               ← 작업 프로세스 (7단계) + 룰북 편집 프로토콜
├── settings.json           ← 훅 연결 + 파일 접근 권한 설정
├── agents/                 ← 특정 작업 전문 AI 서브프로세스 (5개)
├── commands/               ← 슬래시 명령 정의 (7개)
├── skills/                 ← 재사용 가능한 절차 묶음 (3개)
└── hooks/                  ← 파일 저장 시 자동 실행되는 검사 (4개)
```

**CLAUDE.md** 는 Claude 가 작업할 때 따라야 할 7단계 프로세스(이해 → 분석 → 탐색 → 계획 → 실행 → 검증 → 완료), 금지 사항, 룰북 편집 프로토콜을 담는다.

**settings.json** 은 훅(자동 검사) 을 언제 실행할지 정의하고, `.env` 나 `theme.css` 같은 보호된 파일 접근을 막는다. 사용자가 직접 편집할 일은 거의 없다.

#### E-1. `agents/` — 에이전트

에이전트는 **특정 작업에 특화된 AI 서브프로세스** 다. 메인 세션이 특정 작업을 위임하면 새로운 컨텍스트에서 그 에이전트가 돌아간다. 자연어("QA 돌려줘") 또는 명시 호출(`@agent-qa-reporter`) 로 부를 수 있다.

| 에이전트 | 하는 일 |
|---|---|
| `figma-implementer` | Figma URL 을 받아 5단계로 컴포넌트를 구현. 룰북을 강제로 Read 하고 계획을 승인받은 뒤 4파일 세트 생성 |
| `token-checker` | Figma 변수와 `tokens/design-tokens.json` 을 비교. 값 변경·rename·신규·삭제·이름 체계 불일치 4~5분류 보고. 승인 시 자동 수정 |
| `design-reviewer` | 코드 전체 스캔. 하드코딩·존재하지 않는 변수 참조·primitive 참조·그룹 불일치·4파일 누락 검출. Figma MCP 는 쓰지 않음 |
| `figma-editor` | 승인된 계획대로 **Figma 파일을 직접 편집**. 변수·컴포넌트 수정, 컴포넌트 생성, 화면 조립, 기존 `language` 변수의 번역 값 채우기 (변수 생성·연결은 사람이 플러그인으로). 사용자에게 직접 묻지 않으므로 계획 승인은 메인 세션이 먼저 받는다 ([2-F](#f-figma-직접-편집-claude-에게-맡기기)) |
| `qa-reporter` | 전체 QA 리포트 생성. 5단계 절차로 코드 검사 9항목 + 옵션으로 Figma 원본 비교 2항목, Figma 구조 검사 5항목까지 |

#### E-2. `commands/` — 슬래시 명령

슬래시 명령은 **짧은 별칭** 이다. 채팅창에 `/build-tokens` 처럼 치면 정해진 작업을 실행한다.

| 명령 | 하는 일 |
|---|---|
| `/build-tokens` | `npm run tokens:build` 실행 |
| `/check-tokens` | `sync-tokens` 스킬 실행 (아래 스킬 표 참고) |
| `/design-audit` | `verify-design` 스킬 실행 |
| `/gen-story` | 지정한 컴포넌트에 스토리 생성 |
| `/gen-all-stories` | 스토리 없는 컴포넌트에 일괄 생성 |
| `/implement-figma` | `figma-implementer` 에이전트에 위임 |
| `/figma-audit` | `qa-reporter` 에 Figma 구조 검사(5항목)만 위임 ([2-D-3](#d-3-figma-구조-검사)) |

#### E-3. `skills/` — 스킬

스킬은 **반복되는 작업의 절차를 묶은 지침 파일** 이다. 슬래시 명령이 스킬을 호출하거나, Claude 가 판단해서 자동으로 스킬을 참조한다.

| 스킬 | 하는 일 |
|---|---|
| `gen-stories` | 컴포넌트 props 를 분석해서 CSF3 스토리 자동 생성. rikaride 4파일 구조 준수 |
| `sync-tokens` | Figma 변수와 `design-tokens.json` 을 5분류로 비교. Figma 변수 ID 기반이라 rename 을 정확히 감지 |
| `verify-design` | 코드에서 하드코딩·잘못된 참조·primitive 참조 검출. `theme.css` 를 화이트리스트로 사용 |

#### E-4. `hooks/` — 훅

훅은 **파일을 저장할 때 자동으로 도는 검사 스크립트** 다. 사용자가 명시적으로 부르지 않는다.

| 훅 | 언제 도나 | 하는 일 |
|---|---|---|
| `check-design-tokens.mjs` | 파일 저장 후 | 저장된 파일에서 하드코딩된 색상·치수 리터럴, 존재하지 않는 CSS 변수 참조 검출 → 경고만, 차단 안 함 |
| `check-story-exists.mjs` | 파일 저장 후 | 컴포넌트 `.tsx` 를 저장했는데 4파일 세트가 안 갖춰지면 경고 |
| `protect-files.mjs` | 파일 저장 전 | `.env`, `src/styles/theme.css` 편집 시도를 차단 |
| `notify.mjs` | Claude 세션 종료 시 | OS 데스크탑 알림 |

---

## 4. 자주 겪는 실수와 대응

| 증상 | 원인 | 대응 |
|---|---|---|
| `theme.css` 가 비어 있음 | `design-tokens.json` 이 아직 없음 | `docs/TOKENS.md` 절차대로 부트스트랩 |
| 유틸 클래스가 안 먹음 (`bg-...`) | 참조하는 CSS 변수가 존재 안 함 (토큰 삭제·rename 후) | `/design-audit` 로 잡기 |
| primitive 토큰을 썼는데 스타일이 안 남 | primitive 는 CSS 로 방출 안 됨 (rikaride 정책) | semantic 토큰으로 교체 |
| Figma 파일 붙였는데 추출이 안 됨 | 컬렉션 이름이 룰북 전제와 다름 | `tokens:verify` 결과대로 세 가지 중 선택 (Figma 이름 수정 / 룰북 수정 / 룰북 적용 안 함) |
| rename 후 코드 여러 곳이 조용히 깨짐 | 옛 유틸 클래스가 남아있음 | `design-reviewer` 로 스캔 |
| 룰북이 낡은 토큰 이름을 언급 | 룰북 편집 놓침 | `npm run rulebook:verify` 로 조기 감지 |
| 컴포넌트에 하드코딩된 UI 문자열이 남아있음 | 자동 검사가 텍스트는 안 잡음 | 사람 리뷰. 리팩터링 시 `language` 변수의 6자 ID 로 교체 ([2-C-5](#c-5-컴포넌트에-다국어-텍스트language-변수가-있을-때) 참고) |
| Figma 텍스트 노드에 문자열이 하드코딩돼 있음 | `language` 변수에 바인딩하지 않고 직접 입력 | `/figma-audit` 으로 찾고 i18n 플러그인으로 연결 ([2-F-4](#f-4-하드코딩된-figma-텍스트를-i18n-으로-바꾸기)) |
| Figma 컴포넌트 이름·섹션 위치가 룰북과 다름 | 네이밍 스키마·섹션 규칙을 놓침 | `/figma-audit` 으로 확인 ([FIGMA-GUIDEBOOK §2, §4](FIGMA-GUIDEBOOK.md#2-이름-붙이기)) |
| 앱에서 언어 전환했는데 폰트가 안 바뀜 | typeface-semantic 모드 전환 로직 누락 | language 모드와 typeface-semantic 모드를 동시에 전환 (`language-rule.md` §3) |
| language 변수 값을 바꿨는데 화면에 안 뜸 | i18n 파일 재추출 안 함 or 앱 리로드 안 함 | 재추출 요청 ([2-A-7](#a-7-language-변수의-값-변경-예-다음--계속하기) 참고). `/check-tokens` 는 language 를 안 봄 |
| 앱에 `--` 가 그대로 보임 / 문자열이 비어 있음 | 그 언어가 미번역 | Figma 에서 해당 모드 값 채우기 ([2-F-4](#f-4-하드코딩된-figma-텍스트를-i18n-으로-바꾸기) 3단계) 후 재추출 |
| 인스턴스의 재선언된 속성(예: `size`)과 실제 렌더링이 다름 | 속성 패널 최상단이 아니라 중첩된 스켈레톤 그룹의 속성을 직접 바꿈 | 최상단 값만 원래 의도대로 되돌리고, 중첩 그룹은 건드리지 않기 ([FIGMA-GUIDEBOOK §3](FIGMA-GUIDEBOOK.md#3-스켈레톤-속성을-템플릿이-다시-써야-할-때) 참고) |

---

## 5. 참고 자료

- `docs/README.md` — 룰북 라우터 (어떤 상황에 어떤 룰북을 볼지, Claude 전용)
- `docs/FIGMA-GUIDEBOOK.md` — 사람이 Figma에서 직접 작업할 때 보는 가이드 (컴포넌트 구조·토큰·스타일 적용법)
- `docs/TOKENS.md` — 토큰 부트스트랩과 업데이트 절차
- `docs/DESIGN.md` — 제품 성격과 디자인 원칙
- `docs/design-system-rule/CHANGELOG.md` — 룰북 변경 이력
- `CLAUDE.md`, `.claude/CLAUDE.md` — Claude 가 따르는 규칙
