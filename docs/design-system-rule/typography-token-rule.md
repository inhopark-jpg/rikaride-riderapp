# Typography Token 적용 규칙 (공통 룰북)

> **다루는 것** — font-family / weight / size / line-height 변수 구조. 카테고리(display · headline · body · magazine) 별 지원 굵기 비대칭.
> **관련 룰북** — `style-rule.md` (완성 프리셋), `language-rule.md` (동기 전환), `icon-prop-rule.md` (카테고리 매칭)
> **소비 제약** — 실제 텍스트 노드 적용은 Text Style 프리셋을 권장 (`style-rule.md`).

**값이 아니라 의미와 사용 규칙만 다룹니다.** 실제 폰트 크기 숫자, line-height 숫자 등은 하드코딩하지 않습니다 — 프로젝트의 `design-tokens.json`이 항상 유일한 진실의 원천입니다.

> **적용 범위 / 전제**: 새 Figma 파일이 이 문서에 설명된 **컬렉션 구조와 토큰 이름(경로)까지 동일**한 토큰 라이브러리를 쓸 때 유효합니다. 파일이 바뀌면 같은 토큰 이름의 **값**(색상, 수치 등)은 달라질 수 있고 그건 정상입니다 — 값은 항상 그 프로젝트에서 새로 추출한 `design-tokens.json`을 따릅니다. 하지만 **토큰 이름 자체가 다르면**(예: `interactive/primary/bg/default` 대신 `button/main/background/base-color`) 이 룰북을 적용하지 마세요.

## 0. 체크리스트

1. `typeface-primitive` / `typeface-semantic` 두 컬렉션이 있는지 확인한다 (2단계 구조).
2. `typeface-semantic`은 **브랜드×언어 조합의 여러 모드**를 가진다 — 어떤 모드가 이 프로젝트에 해당하는지 먼저 확인한다.
3. Figma에 typeface-semantic 변수를 그대로 감싼 **Text Style(레거시 스타일 리소스)도 별도로 존재**할 수 있다 — 디자이너가 레이어에 실제로 적용하는 건 보통 이 Text Style 쪽이니, 컴포넌트 작업 시 함께 확인한다.
4. 아이콘과 나란히 쓰는 텍스트라면 `icon-prop-rule.md` 를 참고한다 (텍스트 카테고리별 `icon-frame-*` 컴포넌트로 배치, `data-icon-scale` 로 스텝 매칭).

## 1. 2단계 구조 + 완성 프리셋(Text Style)의 3중 구조

```
typeface-primitive  ← 폰트 크기 원자 스케일 (scale/scale-N)
typeface-semantic    ← font-family / font-weight / font-size / line-height, 전부 typeface-primitive 참조
Text Style (레거시)   ← 디자이너가 실제로 레이어에 적용하는 완성 프리셋. typeface-semantic을 바인딩
```

### ⭐ `line-height`가 독립된 변수로 존재한다

이 프로젝트는 `line-height/{카테고리}/{스텝}`가 `typeface-semantic`의 독립된 변수로 존재하고, `typeface-primitive`의 같은 숫자 스케일을 참조합니다. 즉 font-size와 line-height가 **같은 원자 스케일을 공유**합니다 — 새로운 크기 조합을 만들 때 이 스케일 재사용 관계를 유지하세요 (line-height에 스케일에 없는 임의의 숫자를 새로 넣지 않는다).

## 2. `font-family/*`, `font-weight/*`, `font-size/*`, `line-height/*` — 카테고리 구조

카테고리: `display`, `headline`, `body`, `magazine`.

- **font-family**: 카테고리별로 다른 폰트가 지정될 수 있음(display만 별도 폰트, 나머지는 공용 폰트인 경우가 많음 — 실제 값 확인).
- **font-weight**: 카테고리마다 지원하는 굵기 종류가 다를 수 있음 (`display`는 `bold`/`regular`/`medium` 세 가지, `body`는 `bold`만 있는 식으로 **비대칭**일 수 있으니, 없는 굵기를 가정하지 말고 실제 존재하는 조합만 사용).
- **font-size / line-height**: 카테고리+스텝(예: `d1`, `h3`, `b5`, `m2`)별로 `typeface-primitive`의 스케일 값 하나씩을 alias로 가져다 씀.

## 3. `typeface-semantic`의 모드 = "브랜드 × 언어" 조합 (색상 테마 모드와는 다른 축)

이 컬렉션의 모드는 색상처럼 "브랜드 무드"가 아니라 **"어느 브랜드 앱 + 어느 언어권"** 조합입니다 (예: 같은 디자인 시스템을 쓰는 여러 자체 브랜드 앱이 언어별로 폰트가 달라지는 경우 — 한국어는 한글 전용 폰트, 영어는 다른 폰트를 쓰는 식). **새 프로젝트가 어느 브랜드/언어에 해당하는지 먼저 확정하고, 그 모드로만 값을 뽑으세요.** 다국어 지원이 필요한 앱이면 런타임에 언어가 바뀔 때 이 모드도 같이 전환되어야 합니다 — 색상 테마 전환과는 별개의 로직입니다.

**`language` 컬렉션과 동기 전환:** 앱의 다국어 **문자열** 은 별도 `language` 컬렉션에서 관리되고 (`language-rule.md` 참조), 이 `typeface-semantic` 은 언어별 **폰트** 를 관리합니다. **앱 언어가 바뀌면 두 컬렉션의 모드를 동시에 전환해야** 합니다 — 하나만 바꾸면 텍스트 내용과 폰트가 어긋납니다.

## 4. 치트시트

| 하고 싶은 것 | 참고할 곳 |
|---|---|
| 기존 화면과 같은 스타일의 텍스트 | 먼저 Figma의 Text Style(레거시 스타일)에 맞는 프리셋이 있는지 확인 |
| 새로운 크기 조합이 필요하다 | `typeface-primitive`의 같은 스케일 값에서 font-size/line-height를 짝지어 고른다 |
| 다국어 지원 시 폰트가 안 바뀐다 | `typeface-semantic`의 브랜드×언어 모드 전환 로직 확인 |
| 아이콘과 나란히 쓰는 텍스트 | `icon-prop-rule.md` — 같은 카테고리의 `icon-frame-*` 사용, `data-icon-scale` 로 스텝 매칭 |
| 특정 카테고리에 원하는 굵기가 없다 | 그 카테고리가 실제로 지원하는 font-weight 목록을 먼저 확인 (비대칭 구조) |
