# Text Style 적용 규칙 (공통 룰북)

> **다루는 것** — 디자이너가 텍스트 노드에 실제로 적용하는 완성 프리셋(Text Style). 이름 `{카테고리}/{굵기}/{스텝}`.
> **관련 룰북** — `typography-token-rule.md` (밑단 변수)
> **소비 제약** — 5속성 (family/weight/size/line-height/letter-spacing) 을 빠짐없이 개별 적용.

**값이 아니라 의미와 사용 규칙만 다룹니다.** 실제 폰트 크기·line-height 숫자는 하드코딩하지 않습니다 — 프로젝트의 `design-tokens.json`이 항상 유일한 진실의 원천입니다.

> **적용 범위 / 전제**: 새 Figma 파일이 이 문서에 설명된 **컬렉션 구조와 토큰 이름(경로)까지 동일**한 토큰 라이브러리를 쓸 때 유효합니다. 파일이 바뀌면 같은 토큰 이름의 **값**(색상, 수치 등)은 달라질 수 있고 그건 정상입니다 — 값은 항상 그 프로젝트에서 새로 추출한 `design-tokens.json`을 따릅니다. 하지만 **토큰 이름 자체가 다르면**(예: `interactive/primary/bg/default` 대신 `button/main/background/base-color`) 이 룰북을 적용하지 마세요. `typography-token-rule.md`(Typography 변수)와 세트로 봅니다 — 이 문서는 그 변수들을 실제로 조합해서 디자이너가 레이어에 적용하는 완성 프리셋(Text Style) 쪽 규칙입니다.

## 0. Text Style은 Typography 변수를 "바인딩"해서 만들어진다

Text Style 하나는 5개 속성(`font-family`, `font-weight`, `font-size`, `line-height`, `letter-spacing`)을 가지는데, 이 프로젝트는 그중 **4개(family/weight/size/line-height)가 전부 `Typography` 변수를 참조(bind)하는 alias**입니다. `letter-spacing`만 변수 바인딩 없이 리터럴 값으로 존재합니다(§5). 코드로 옮길 때도 이 alias 관계를 최대한 유지하세요 — 폰트 크기가 바뀌면 Text Style과 그 밑의 변수가 같이 갱신되게 하는 구조입니다.

## 1. 체크리스트

1. 이 프로젝트에 Text Style 목록이 있는지 확인한다 (Typography 변수 추출과는 별개 작업 — `getLocalTextStylesAsync()` 계열로 조회).
2. 카테고리별로 실제 존재하는 굵기(weight) 조합이 몇 개인지 먼저 확인한다 — 카테고리마다 다르다 (§3).
3. 각 Text Style이 어떤 Typography 변수에 바인딩되어 있는지 확인한다 — 이름만 보고 짐작하지 않는다. 카테고리·굵기가 스타일 이름과 다른 변수에 바인딩되어 있으면 Figma 오류다 (§4).

## 2. 명명 규칙: `{카테고리}/{굵기}/{스텝}`

패턴이 `{카테고리}/{스텝}-{굵기접미사}` (예: `Body/body2-R`)가 아니라, **굵기가 가운데에 독립된 경로 세그먼트로 들어갑니다**: `display/bold/d1`, `body/medium/b3`, `magazine/regular/m2`. 코드에서 파싱할 때 `/`로 나눈 두 번째 세그먼트가 굵기라는 걸 기준으로 삼으세요.

카테고리는 `display` > `headline` > `body` > `magazine` — 매거진(에디토리얼 느낌의 세리프체) 카테고리가 별도로 있는 게 특징입니다. 각 카테고리 안에서 스텝 번호는 **1이 가장 크고, 숫자가 커질수록 작아지는 방향**으로 일관되게 설계되어 있습니다.

## 3. 카테고리마다 지원하는 굵기 개수가 다르다 (비대칭 확인됨)

| 카테고리 | 실제 존재하는 굵기 |
|---|---|
| `display` | `bold` 하나만 |
| `headline` | `bold` 하나만 |
| `body` | `regular` / `medium` / `bold` 세 가지 |
| `magazine` | `regular` / `bold` 두 가지 |

**"헤드라인에 medium 버전이 있겠지" 같은 가정을 하지 마세요.** display·headline은 굵은 스타일 하나로 고정되어 있고, 본문 성격의 body·magazine만 여러 굵기를 제공합니다. 필요한 굵기가 없는 카테고리라면, 디자이너에게 추가가 필요한지 먼저 확인하세요 — 임의로 다른 카테고리의 값을 가져다 쓰지 않습니다.

## 4. 바인딩된 변수의 카테고리·굵기는 스타일 이름과 일치한다

`{카테고리}/{굵기}/{스텝}` Text Style은 `font-family/{카테고리}/*`, `font-weight/{카테고리}/{굵기}`, `font-size/{카테고리}/{스텝}`, `line-height/{카테고리}/{스텝}`에 바인딩됩니다. 예: `body/medium/b3` → `font-weight/body/medium`, `font-size/body/b3`, `line-height/body/b3`. 다른 카테고리의 변수를 빌려 쓰지 않습니다 — §3의 카테고리별 굵기마다 전용 font-weight 변수가 있습니다.

**어긋나 있으면 의도된 재사용이 아니라 Figma 쪽 오류입니다.** 값이 같더라도 코드에서 그대로 옮기거나 이름을 맞춰 매핑하지 말고, 어떤 스타일이 어떤 변수를 가리키는지 보고하고 멈춥니다.

## 5. `letter-spacing`은 변수가 아니라 리터럴, 그리고 전부 기본값

이 프로젝트의 모든 Text Style은 `letter-spacing`이 변수 바인딩 없이 리터럴 값으로만 존재하며, 지금까지는 전부 "커스텀 자간 없음(기본값)" 상태입니다. 즉 이 디자인 시스템은 현재 자간을 조정해서 쓰지 않습니다. 그렇다고 이 속성을 생략하지 말고, **5개 속성 전부(family/weight/size/line-height/letter-spacing)를 빠짐없이 개별 적용**하세요 — 나중에 특정 스타일에 자간이 추가될 수도 있고, 생략하면 그 변경을 놓치게 됩니다. `text-case`/`text-decoration`도 마찬가지로 지금은 전부 기본값이지만 명시적으로 적용해두는 게 안전합니다.

## 6. 치트시트

| 하고 싶은 것 | 참고할 곳 |
|---|---|
| 제목/본문/캡션 등 기존 화면과 같은 텍스트 | 역할에 맞는 `{카테고리}/{굵기}/{스텝}` Text Style을 통째로 적용 |
| 본문에 강조 표시가 필요하다 | `body`는 regular/medium/bold 세 굵기가 다 있으니 그중 선택 |
| 헤드라인을 더 얇게/굵게 하고 싶다 | 안 됨 — `headline`은 `bold` 하나뿐, 디자이너 확인 필요 |
| 에디토리얼/잡지 느낌의 텍스트 | `magazine/{regular|bold}/m{1-3}` (세리프체) |
| Text Style의 굵기 변수 이름이 카테고리와 안 맞아 보인다 | §4 참고 — Figma 오류다. 보고하고 멈춘다 |
