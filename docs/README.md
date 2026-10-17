# 문서 라우터

이 프로젝트 문서의 목차이자 분기표다.

**여기에는 `@` 임포트를 쓰지 않는다.** 전부 로드되면 분기표의 의미가 없어지고 매 세션 컨텍스트를 낭비한다. 경로만 적고, 필요한 것만 Read 한다.

## 분기표

| 작업 | 읽을 문서 (순서대로) |
|---|---|
| Figma → 코드 (화면/컴포넌트 구현) | `design-system-rule/component-structure-rule.md` → `design-system-rule/section-layout-rule.md` → `design-system-rule/design-to-dev-rule.md` → 해당 토큰 룰 |
| 코드 → Figma (컴포넌트를 Figma에 만들 때) | `design-system-rule/component-structure-rule.md` → `design-system-rule/section-layout-rule.md` → `design-system-rule/design-to-dev-rule.md` |
| Figma 섹션 정리·읽기 (Organize Sections 플러그인 작업 포함) | `design-system-rule/section-layout-rule.md` → `design-system-rule/component-structure-rule.md` |
| 컴포넌트/파일 이름 짓기 | `design-system-rule/design-to-dev-rule.md` |
| 색을 고를 때 / 색이 맞는지 검증할 때 | `design-system-rule/color-token-rule.md` |
| 간격·radius·아이콘 크기 | `design-system-rule/shape-token-rule.md` |
| 아이콘 프레임 컴포넌트(`icon-frame-*`) 다룰 때 | `design-system-rule/icon-prop-rule.md` |
| 폰트 크기/굵기/행간 | `design-system-rule/typography-token-rule.md` + `design-system-rule/style-rule.md` |
| 그림자·블러 | `design-system-rule/effect-token-rule.md` |
| liquid-glass 지원 여부 스위치 (supported/unsupported 모드) | `design-system-rule/liquid-glass-rule.md` |
| 다국어 문자열 (`language` 컬렉션) | `design-system-rule/language-rule.md` |
| 토큰 값 업데이트 / Figma 재추출 | `docs/TOKENS.md` |
| 제품 성격, 디자인 원칙 | `docs/DESIGN.md` |

## 각 문서가 다루는 것

### 룰북 (`docs/design-system-rule/`)

기준 문서다. 수정하려면 승인이 필요하다.

| 파일 | 한 줄 설명 |
|---|---|
| `color-token-rule.md` | 색상 토큰을 **그룹/역할/상태** 3분해로 고르는 법. interactive(`default`)와 non-interactive(`base`)가 다른 어휘를 쓴다. `icon-frame`의 `negative` 레이어 규칙, 모드가 서브트리 단위로 지역 오버라이드된다는 점까지 |
| `shape-token-rule.md` | spacing / radius / icon-size. 숫자 스텝을 고르기 전에 `surface-margin`·`viewport-margin` 같은 **의미 기반 토큰이 있는지 먼저** 확인하라는 규칙. `icon-size` 컬렉션의 토큰 구조만 다루고, 소비 규칙은 `icon-prop-rule.md` 로 이관됨 |
| `icon-prop-rule.md` | `icon-frame-*` (5개) 컴포넌트가 `icon-prop`·`icon-size` 토큰을 소비하는 규칙. 2층 구조(프레임 + icon-wrap), 텍스트 카테고리·스텝 매칭, 모든 아이콘 배치는 `icon-frame-*` 을 통해서만 가능하다는 제약 |
| `typography-token-rule.md` | font-family / weight / size / line-height 변수 구조. 카테고리(display·headline·body·magazine)마다 **지원 굵기가 비대칭**이다. 모드 축이 "브랜드×언어"로 색상과 다르다 |
| `style-rule.md` | 디자이너가 실제로 레이어에 적용하는 완성 프리셋(Text Style). 이름이 `{카테고리}/{굵기}/{스텝}`이고 **굵기가 가운데 세그먼트**. 5속성을 빠짐없이 적용하는 규칙 |
| `effect-token-rule.md` | shadow(5필드 분리) / background-blur(uniform vs progressive) / `effects/liquid-glass/*` (유리 효과 시각적 정의). **liquid-glass는 표준 CSS로 재현 불가**라는 경고와 플랫폼별 대안 |
| `liquid-glass-rule.md` | 최상위 `liquid-glass` 컬렉션(supported/unsupported 모드). 플랫폼별 지원 여부 스위치. `effects/liquid-glass/*` 와 별개. 앱 루트에 `[data-liquid-glass]` 서브트리 오버라이드로 적용 |
| `language-rule.md` | `language` 컬렉션(다국어 i18n 문자열). 텍스트 노드/text prop 에만 적용, 토큰명=번역키, `design-tokens.json` 이 아닌 별도 i18n 파일로 추출. typeface-semantic 모드와 동기 전환 |
| `component-structure-rule.md` | 스켈레톤/템플릿/패턴 3계층 판별 2단계 테스트, 중첩 규칙, 빌딩블록·스코프 플래그, 네이밍 스키마, 페이지 배치 규칙 |
| `section-layout-rule.md` | Figma 페이지 안의 섹션 구성. 컴포넌트 레이아웃(패밀리 → sub-group → template/pattern/building-block)과 페이지 레이아웃(흐름 → sub-group → page/sub page). **위치가 곧 사용 관계** — 빌딩블록은 쓰는 쪽을 모두 포함하는 가장 안쪽 섹션 아래. 기존 섹션을 읽어 레이어·공유 범위를 판별하는 절차 |
| `design-to-dev-rule.md` | Figma↔코드 변환 규칙 — 이름 기계적 변환 알고리즘(`.` → `_`, `pattern-` 을 앞으로) + 스켈레톤/템플릿 속성 재선언 처리 |

### 프로젝트 문서 (`docs/`)

| 파일 | 한 줄 설명 |
|---|---|
| `TOKENS.md` | 토큰 최초 추출(부트스트랩)과 이후 업데이트 절차, 불일치를 발견했을 때 멈추는 기준과 보고 형식 |
| `DESIGN.md` | 룰북이 다루지 않는 "왜" — 제품 성격, 타겟, 디자인 원칙, 조합할 때 피할 패턴. 규칙은 여기 없다 |

## 규칙이 아니라 값이 필요할 때

토큰의 **실제 값**은 문서가 아니라 `tokens/design-tokens.json` 에 있다. 룰북은 값을 담지 않는다 — 일부러 그렇게 되어 있다. 값을 문서에 복사하면 Figma가 바뀔 때 어긋난다.

생성된 CSS 변수 목록은 `src/styles/theme.css` 에서 볼 수 있다 (자동 생성물, 직접 수정 금지).

## 코드 규칙은 어디에

프레임워크·스타일링·파일 구조·빌드 명령어는 루트 `CLAUDE.md`, 작업 프로세스와 금지사항은 `.claude/CLAUDE.md` 에 있다. 둘 다 항상 로드되므로 여기 중복해 적지 않는다.
