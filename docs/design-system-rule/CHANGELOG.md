# 룰북 변경 로그

`docs/design-system-rule/` 아래 룰북을 수정할 때마다 여기에 한 줄 이상 기록한다.
사용자가 직접 편집한 경우든 Claude 에게 위임한 경우든 모두 남긴다.

형식:

```
## YYYY-MM-DD
- {파일명}#{섹션(선택)} — {무엇이 바뀌었는가} — {왜}
```

같은 날 여러 편집이 있으면 한 날짜 아래 여러 줄로.

---

## 2026-10-09

- **color-token-rule.md §3 「그룹 종류 선택」 신설** — 그룹 종류는 상호작용 여부로 먼저 갈림: 정적 컴포넌트는 처음부터 non-interactive, 상호작용 컴포넌트는 interactive 1순위이되 그래픽 요소(knob 등)·대비 부적절 시 해당 레이어만 non-interactive 차용 허용(새 그룹 컨텍스트, variant별 스케일 지정, pressed 는 state-overlay, description 에 근거) — pattern-switch 제작 중 interactive 토큰만으로는 knob·off 트랙 색을 정할 수 없었고, 룰북에 해당 경우가 없어 QA 가 그룹 불일치로 오판할 여지가 있었음
- **color-token-rule.md §7** — 치트시트에 정적 컴포넌트 / 차용 행 2개 추가 — 위 규칙 반영
- **color-token-rule.md §8** — QA 절차 3-1 추가: 차용 레이어는 위반이 아니라 새 그룹 컨텍스트, description 근거 없으면 "근거 누락" — QA 오판 방지
- **FIGMA-GUIDEBOOK.md** — 「그룹 종류 선택」 요약 절과 치트시트 2행 추가 — 원문 동기화
- **color-token-rule.md §3·§8, FIGMA-GUIDEBOOK.md** — "차용 근거를 컴포넌트 description 에 남긴다" 요구와 QA "근거 누락" 기록 제거, QA 는 차용 조건 충족 여부를 직접 확인 — 사용자 결정: 컴포넌트 설명에 차용 이유를 적지 않음
- **color-token-rule.md §4·§7, FIGMA-GUIDEBOOK.md** — `interactive/state-overlay/brand-light/pressed`·`brand-dark/pressed` 추가, 모드별로 밝기가 바뀌는 브랜드 배경에는 light/dark 대신 이 둘을 쓰도록 명시 — light/dark 는 배경 밝기가 모드마다 고정이라는 전제인데, 브랜드 배경(btn-primary, chip branded, switch on 트랙)에서 sky-blue·mango-yellow 등 밝은 테마일 때 오버레이 방향이 뒤집혀 눌림이 안 보이는 문제가 검수로 확인됨
- **color-token-rule.md §4·§7, FIGMA-GUIDEBOOK.md (같은 날 재개정)** — `brand-light`/`brand-dark` 2분할을 철회하고 `interactive/state-overlay/brand/pressed` 단일 토큰으로 환원. 오버레이 선택 기준을 "배경 토큰의 그룹"으로 명시: interactive 브랜드 배경 → `brand`, non-interactive 브랜드 배경(`brand/bg/*`) → 스케일 밝기에 맞춰 `light`/`dark`, govt-navy 처럼 팔레트가 어두운 모드 주의 문구 추가 — `interactive/primary/bg/default` 는 모드마다 밝기가 정반대로 바뀌어 "brand-light" 라는 이름이 맞지 않았고, non-interactive 브랜드 bg 는 스케일 이름이 곧 밝기라 light/dark 로 충분함 (단 govt-navy 는 같은 스케일이 한 단계 이상 어두움을 데이터로 확인)
- **color-token-rule.md §4·§7, FIGMA-GUIDEBOOK.md (같은 날 3차)** — 오버레이 선택 기준을 "어두운 배경 → light, 밝은 배경 → dark, 모드에 따라 밝기가 바뀌는 배경 → brand" 로 일반화. 특정 모드명·그룹명·토큰 예시와 govt-navy 주의 문구 제거 — 모드/그룹 이름이 바뀔 때 룰북이 낡지 않도록. 직전 문구가 `brand/bg/darker` 에 `dark` 를 권하는 등 표(어두운 배경 → light)와 반대 방향을 안내하던 오류도 함께 해소

## 2026-10-01

- **design-to-dev-rule.md 범위 재정의** — "이름 변환만" 에서 "Figma↔코드 변환 전반(이름 변환 + 속성 재선언 처리)" 로 목적 확장 — 스켈레톤 속성을 템플릿이 다루는 방식(노출 vs 재선언)에 대한 일관된 규칙이 없어 컴포넌트마다 임기응변으로 처리되던 것을 정리
- **design-to-dev-rule.md §5 신설 — 속성 재선언 처리**:
  - 스켈레톤 속성을 템플릿이 다루는 두 가지 Figma 구현 방식(노출 vs 재선언) 정의. 기본은 노출, 특정 값에서 색상·동작이 실제로 갈라질 때만 재선언 — 판단은 prop 단위(템플릿 전체 단위 아님)
  - 값의 부분집합만 다른 경우(예: `size-xs` 미지원)는 재선언이 아니라 스켈레톤 자체를 분리 — `component-structure-rule.md` §3 "패밀리 ≠ 공유 스켈레톤" 원칙을 적용한 것
  - 값 범위 차이를 "의도적 설계"로 확정하려면 Figma 컴포넌트 description 또는 사용자 확인 등 근거가 있어야 함. 근거 없으면 멈추고 보고 (토큰 근사값 금지 원칙과 동일)
  - 재선언된 속성을 다룰 때 사람·Claude 모두 템플릿 자체(최상단) 속성만 설정하고 중첩된 스켈레톤 그룹은 건드리지 않음 — 노출/재선언 구분 부담과 값 어긋남 위험을 근본적으로 제거
  - 코드에서는 스켈레톤 쪽 타입을 참조로 파생(`SkeletonProps["size"]` 등)해서 프로퍼티 타입을 만들고 손으로 재입력하지 않음 — Figma 내부 구현이 바뀌어도 코드 공개 API는 그대로 유지
- **component-structure-rule.md 헤더** — design-to-dev-rule.md 관련 룰북 설명을 범위 확장에 맞춰 갱신
- **docs/README.md** — design-to-dev-rule.md 요약 설명 갱신

---

## 2026-09-29

- **verify-rulebook.mjs 확장** — 기존 룰북-토큰 정합성 검사(③) 에 두 검사 추가: ① 라우터 커버리지 (docs/README.md 가 모든 룰북을 언급하는지), ② §참조 무결성 (룰북 간 §참조가 실제 §를 가리키는지). 자동 검증 그물망 확장으로 §참조 그물망 우려 완화
- **10개 룰북 전체 표준 헤더 추가** — 각 룰북 상단에 `> **다루는 것** / **관련 룰북** / **소비 제약**` 3줄 블록. Claude·인간 모두 파일 전체를 Read 하지 않고 관계·스코프·제약을 즉시 파악 가능. 자동화된 인덱싱을 위한 기초 구조도 겸함

---

## 2026-09-28

- **liquid-glass-rule.md 신규** — `effects/liquid-glass/*` 와 별개인 최상위 `liquid-glass` 컬렉션(supported/unsupported 모드) 규칙. 플랫폼별 유리 효과 지원 여부 스위치. 컴포넌트의 `liquid-glass` 속성값에 바인딩되는 방식과 서브트리 오버라이드 적용 명시
- **language-rule.md 신규** — `language` 컬렉션(다국어 i18n 문자열) 규칙. 텍스트 노드/text prop 에만 적용 가능하다는 제약, 토큰명=번역키, typeface-semantic 과 동기 전환, `design-tokens.json` 이 아닌 별도 i18n 파일 파이프라인 원칙 명시
- **effect-token-rule.md §0-1·§3·§5** — §3 의 liquid-glass 토큰 경로를 `effects/liquid-glass/*` 로 명시 (별도 최상위 컬렉션과 구분), 스위치 컬렉션 존재 안내 및 `liquid-glass-rule.md` 교차 참조 추가
- **typography-token-rule.md §3** — `language` 컬렉션과 동기 전환 원칙 추가 (typeface 는 폰트, language 는 문자열, 앱 언어 전환 시 둘 다 동시에 바꿔야 함)
- **collections.json** — `liquid-glass` (emit:true, modeNamePattern supported/unsupported) 및 `language` (emit:false, 별도 i18n 파일 파이프라인) 추가. 실제 heads 는 부트스트랩 시 확인
- **docs/README.md** — 라우터에 liquid-glass·language 관련 행 추가, 룰북 요약 표에 두 룰북 요약 추가
- **docs/GUIDEBOOK.md, 루트 CLAUDE.md** — "룰북 8개" → "10개" 및 룰북 목록에 liquid-glass-rule.md · language-rule.md 반영 (스테일 방지)
- **icon-prop-rule.md 신규** — `icon-prop` 컬렉션과 `icon-frame-*` (5개) 컴포넌트의 관계, 2층 구조, 텍스트 카테고리·스텝 매칭 규칙 명시. icon-prop 토큰은 `icon-frame-*` 을 통해서만 적용 가능하며 이 프로젝트의 모든 아이콘 배치는 `icon-frame-*` 을 거친다는 제약 포함
- **shape-token-rule.md §3** — Figma 에서 `icon-weight` 가 삭제됐으므로 관련 서술 제거. 소비 규칙과 카테고리·모드 매칭 규칙은 `icon-prop-rule.md` 로 이관, §3 은 토큰 구조만 짧게 유지 (중복 제거)
- **shape-token-rule.md §4 치트시트** — 아이콘 행을 `icon-prop-rule.md` 참조로 갱신
- **typography-token-rule.md** — §0 체크리스트 4·§4 치트시트에서 아이콘 관련 참조를 `shape-token-rule.md §3` → `icon-prop-rule.md` 로 갱신
- **collections.json** — `icon-prop` 컬렉션 추가(heads 는 부트스트랩 시 확인). `icon-size` heads 에서 `icon-weight` 제거, rulebook 참조를 `icon-prop-rule.md` 병기로 갱신
- **docs/README.md** — Claude 라우터에 `icon-frame-*` 컴포넌트를 다룰 때의 행 추가
- **docs/GUIDEBOOK.md, 루트 CLAUDE.md** — "룰북 7개" → "8개" 및 룰북 목록에 icon-prop-rule.md 반영 (스테일 방지)

## 2026-09-27

- CHANGELOG.md 신설. 룰북 변경 이력 추적 시작.
