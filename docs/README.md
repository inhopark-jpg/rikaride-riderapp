# 문서 라우터

이 프로젝트 문서의 목차이자 분기표다.

**여기에는 `@` 임포트를 쓰지 않는다.** 전부 로드되면 분기표의 의미가 없어지고 매 세션 컨텍스트를 낭비한다. 경로만 적고, 필요한 것만 Read 한다.

## 분기표

| 작업 | 읽을 문서 (순서대로) |
|---|---|
| Figma → 코드 (화면/컴포넌트 구현) | `design-system-rule/component-structure-rule.md` → `design-system-rule/section-layout-rule.md` → `design-system-rule/design-to-dev-rule.md` → 해당 토큰 룰 (주석을 읽어야 하면 `design-system-rule/annotation-rule.md`) |
| 코드 → Figma (컴포넌트를 Figma에 만들 때) | `design-system-rule/component-structure-rule.md` → `design-system-rule/section-layout-rule.md` → `design-system-rule/design-to-dev-rule.md` → `design-system-rule/annotation-rule.md` |
| Figma 섹션 정리·읽기 (Organize Sections 플러그인 작업 포함) | `design-system-rule/section-layout-rule.md` → `design-system-rule/component-structure-rule.md` → `design-system-rule/annotation-rule.md` |
| Figma 주석 달기·읽기 (variant 브래킷, `address-platter`·`.address-anchor`, annotation, spec, 주석 섹션) | `design-system-rule/annotation-rule.md` → `design-system-rule/section-layout-rule.md` |
| 컴포넌트/파일 이름 짓기 | `design-system-rule/design-to-dev-rule.md` |
| 색을 고를 때 / 색이 맞는지 검증할 때 | `design-system-rule/color-token-rule.md` |
| 간격·radius | `design-system-rule/shape-token-rule.md` |
| 아이콘 배치 / 아이콘 프레임 컴포넌트(`icon-frame-*`) 다룰 때 | `design-system-rule/icon-frame-rule.md` |
| 폰트 크기/굵기/행간 | `design-system-rule/typography-token-rule.md` + `design-system-rule/text-style-rule.md` |
| 그림자·블러·그라디언트 | `design-system-rule/effect-token-rule.md` |
| 다국어 문자열 (`language` 컬렉션) | `design-system-rule/language-rule.md` |
| 토큰 값 업데이트 / Figma 재추출 | `docs/TOKENS.md` |
| 제품 성격, 디자인 원칙 | `docs/DESIGN.md` |

## 각 문서가 다루는 것

### 룰북 (`docs/design-system-rule/`)

기준 문서다. 수정하려면 승인이 필요하다.

| 파일 | 한 줄 설명 |
|---|---|
| `color-token-rule.md` | 색상 토큰을 **{역할}/{그룹}/{맥락}/{스케일}** 로 고르는 법. 최상위마다 다른 어휘 — `surface`·`stroke`(맥락별 스케일, 기본값 `base`), `on-surface`(색·유형·강조 단계), `interactive`(상태, 기본값 `default`), `state-overlay`, 그리고 Style 리소스가 소비하는 `styles`(레이어에 직접 안 씀). **면은 맥락(elevation·floating·overlay)으로, 글자·아이콘은 뒤 배경까지 합성한 실제 배경과의 대비로 고른다** — 그룹 일치가 아니다. `icon-frame`의 `negative` 레이어 규칙, 모드 축(명도 × 브랜드)과 다크모드 값 산출(미러링 + 예외), 모드가 서브트리 단위로 지역 오버라이드된다는 점까지 |
| `shape-token-rule.md` | spacing / radius. 숫자 스텝을 고르기 전에 `surface-margin`·`viewport-margin` 같은 **의미 기반 토큰이 있는지 먼저** 확인하라는 규칙. 아이콘 크기는 다루지 않고 `icon-frame-rule.md` 로 보낸다 |
| `icon-frame-rule.md` | `icon-frame` 컬렉션과 `icon-frame-*` (5개) 컴포넌트. 모든 아이콘 배치는 `icon-frame-*` 을 거친다는 제약, 2층 구조(프레임 + icon-wrap), 텍스트 카테고리 → 컴포넌트·스텝 → `size-N` 모드 매칭, `icon-line-height` 가 텍스트 `line-height` 를 참조하는 관계 |
| `typography-token-rule.md` | font-family / weight / size / line-height 변수 구조. 카테고리(display·headline·body·magazine)마다 **지원 굵기가 비대칭**이다. 모드 축이 "브랜드×언어"로 색상과 다르다 |
| `text-style-rule.md` | 디자이너가 실제로 레이어에 적용하는 완성 프리셋(Text Style). 이름이 `{카테고리}/{굵기}/{스텝}`이고 **굵기가 가운데 세그먼트**. 5속성을 빠짐없이 적용하는 규칙 |
| `effect-token-rule.md` | shadow(5필드 분리) / background-blur(uniform vs progressive) / `effects/liquid-glass/*` (유리 효과 시각적 정의) / `gradient/*` 색상 스타일(유일하게 Variable 이 아님). 그림자·그라디언트 색이 `color-semantic` 의 `styles` 그룹을 거쳐야 모드가 따라온다는 점, **liquid-glass는 표준 CSS로 재현 불가**라는 경고와 플랫폼별 대안 |
| `language-rule.md` | `language` 컬렉션(다국어 i18n 문자열, 디자인 토큰 아님). 텍스트 노드/text prop 에만 적용. 변수 하나 = 번역 항목 하나, 코드 키는 변수명 끝 6자 ID. 변수 생성·연결은 사람이 전용 도구로 하고 Claude 는 찾기·번역 제안·기존 값 수정만. 번역 테이블은 검사 제외, `--` = 미번역. `design-tokens.json` 이 아닌 별도 i18n 파일로 추출. typeface-semantic 모드와 동기 전환 |
| `component-structure-rule.md` | 스켈레톤/템플릿/패턴 3계층 판별 2단계 테스트, 중첩 규칙, 빌딩블록·스코프 플래그, 네이밍 스키마, 페이지 배치 규칙 |
| `section-layout-rule.md` | Figma 페이지 안의 섹션 구성. 컴포넌트 레이아웃(패밀리 → sub-group → template/pattern/building-block)과 페이지 레이아웃(흐름 → sub-group → page/sub page). **위치가 곧 사용 관계** — 빌딩블록은 쓰는 쪽을 모두 포함하는 가장 안쪽 섹션 아래. 기존 섹션을 읽어 레이어·공유 범위를 판별하는 절차 |
| `design-to-dev-rule.md` | Figma↔코드 변환 규칙 — 이름 기계적 변환 알고리즘(`.` → `_`, `pattern-` 을 앞으로) + 스켈레톤/템플릿 속성 재선언 처리 |
| `annotation-rule.md` | Figma 캔버스 주석. variant 브래킷은 셋의 **위(X축)·왼쪽(Y축)에만**, 라벨은 `{속성}:` 줄바꿈 `{값}`. `address-platter` + `.address-anchor`(UI 이름과 같은 텍스트, 다른 곳에서 인스턴스로 가리킴). 레이어 하나는 annotation(카테고리 없음), 컴포넌트 전체는 spec, 예시·그림은 주석 섹션(fill 없음 + dashed stroke) |

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
