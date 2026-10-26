# Shape Token 적용 규칙 (공통 룰북)

> **다루는 것** — spacing / radius 토큰 선택. 숫자 스텝 전에 의미 기반 토큰(`surface-margin`·`viewport-margin` 등) 을 먼저 확인. 아이콘 크기는 별도 `icon-frame` 컬렉션 (§3).
> **관련 룰북** — `color-token-rule.md`, `icon-frame-rule.md`
> **소비 제약** — primitive 참조 금지. `icon-frame` 컬렉션 변수는 `icon-frame-rule.md` 대로 `icon-frame-*` 컴포넌트를 통해서만 소비.

**값이 아니라 의미와 사용 규칙만 다룹니다.** 실제 spacing/radius/size 숫자는 하드코딩하지 않습니다 — 프로젝트의 `design-tokens.json`이 항상 유일한 진실의 원천입니다.

> **적용 범위 / 전제**: 새 Figma 파일이 이 문서에 설명된 **컬렉션 구조와 토큰 이름(경로)까지 동일**한 토큰 라이브러리를 쓸 때 유효합니다. 파일이 바뀌면 같은 토큰 이름의 **값**(색상, 수치 등)은 달라질 수 있고 그건 정상입니다 — 값은 항상 그 프로젝트에서 새로 추출한 `design-tokens.json`을 따릅니다. 하지만 **토큰 이름 자체가 다르면**(예: `interactive/primary/bg/default` 대신 `button/main/background/base-color`) 이 룰북을 적용하지 마세요.

## 0. 체크리스트

1. `shape-primitive` / `shape-semantic` 두 컬렉션이 있는지 확인한다 (이 프로젝트는 **2단계 구조**).
2. 아이콘 크기가 필요하면 `shape-*`가 아니라 `icon-frame-*` 컴포넌트를 쓴다 (§3).
3. 값은 항상 `design-tokens.json`에서 조회한다.

## 1. 2단계 구조 — `shape-primitive` → `shape-semantic`

```
shape-primitive  ← spacing/radius/size 원자 단위 숫자 스케일
shape-semantic   ← 의미 있는 이름으로 재포장된 토큰. 전부 shape-primitive를 참조(alias)함
```

**원칙: 컴포넌트/코드에서는 `shape-semantic`을 우선 사용한다.** `shape-semantic`은 "이 숫자가 왜 이 값인지"를 이름에 담고 있어서(예: 여백 관련 용도별 이름), 나중에 디자인이 바뀌어도 코드의 의미가 안 깨집니다.

### `shape-semantic`에만 있는, description 있는 특별 토큰들

일반 숫자 스텝(`spacing/global/spacing-N`)과 별개로, **용도가 이름에 명시된 토큰**이 존재합니다 (실제 description 기반):

| 패턴 | 의미 |
|---|---|
| `spacing/surface-margin/base` | dialog·card처럼 하위 요소를 감싸는 **부모 컨테이너의 기본 패딩** |
| `spacing/viewport-margin/side/base` | 화면 좌우 끝 ~ 콘텐츠 시작 사이의 **안전 여백(Safe Zone)** |
| `spacing/viewport-margin/top/base`, `.../bottom/base` | 화면 상단/하단 ~ 콘텐츠(또는 고정 UI) 사이의 안전 여백 |
| `radius/surface-radius/base` | dialog·card 등 **부모 컨테이너의 기본 모서리 둥글기** |
| `radius/surface-radius/low` | 부모 컨테이너 **내부 하위 요소**의 기본 모서리 둥글기 |

→ 새 다이얼로그/카드/바텀시트 같은 "컨테이너 안에 컨테이너가 있는" 구조를 만들 때는, 숫자 스텝을 직접 고르지 말고 **이 의미 기반 토큰이 있는지부터 확인**하세요. 화면 가장자리 안전 여백을 처리할 때도 `viewport-margin/*`을 먼저 찾으세요.

## 2. 일반 `spacing`/`radius`/`size` 숫자 스텝

용도가 명시 안 된 나머지 토큰들은 그냥 숫자 눈금입니다 — 필요한 크기에 제일 가까운 스텝을 가져다 씁니다. `radius-full`(또는 `full`이 붙은 토큰)은 완전한 pill/원형용 특수값입니다.

## 3. 아이콘 크기 — `shape-*` 가 아니라 `icon-frame` 컬렉션

아이콘 크기는 `shape-*` 에서 고르지 않습니다. 별도의 **`icon-frame` 컬렉션**(`icon-size/*`, `icon-line-height/*`, `size-N` 모드)이 정하고, 이 변수들은 `icon-frame-*` 컴포넌트에만 바인딩되어 있습니다. 아이콘이 필요하면 `icon-frame-*` 인스턴스를 놓고 모드를 고릅니다 — 컬렉션 구조, 컴포넌트·모드 선택 규칙은 `icon-frame-rule.md` 에 있습니다.

## 4. 치트시트

| 하고 싶은 것 | 참고할 곳 |
|---|---|
| 다이얼로그/카드 등 컨테이너 패딩·모서리 | `spacing/surface-margin/base`, `radius/surface-radius/*` |
| 화면 가장자리 안전 여백 | `spacing/viewport-margin/{side|top|bottom}/base` |
| 일반 요소 간 gap | `shape-semantic`의 일반 spacing 스텝 |
| 완전히 동그란/캡슐형 요소 | `radius-full` |
| 텍스트 옆에 나란히 놓는 아이콘 | `icon-frame-rule.md` — 같은 카테고리의 `icon-frame-*` + 모드 `size-{텍스트 스텝}` |
| 텍스트 없이 단독으로 쓰는 아이콘 | `icon-frame-standalone` (`icon-frame-rule.md`) |
