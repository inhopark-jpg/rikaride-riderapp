# Icon Prop 적용 규칙 (공통 룰북)

> **다루는 것** — `icon-frame-*` (5개) 컴포넌트가 `icon-prop` · `icon-size` 토큰을 소비하는 규칙. 2층 구조, 텍스트 카테고리·스텝 매칭.
> **관련 룰북** — `shape-token-rule.md` §3, `typography-token-rule.md`, `color-token-rule.md` §10
> **소비 제약** — icon-prop 토큰은 `icon-frame-*` 컴포넌트를 통해서만 적용. 모든 아이콘 배치는 `icon-frame-*` 을 거침.

**값이 아니라 의미와 사용 규칙만 다룹니다.** 실제 크기·line-height 숫자는 하드코딩하지 않습니다 — 프로젝트의 `design-tokens.json`이 항상 유일한 진실의 원천입니다.

> **적용 범위 / 전제**: 새 Figma 파일이 이 문서에 설명된 **컬렉션 구조와 컴포넌트 이름까지 동일**한 토큰 라이브러리를 쓸 때 유효합니다. `icon-prop` · `icon-size` 컬렉션이 존재하고, `icon-frame-*` 형식의 컴포넌트가 이 토큰들을 소비할 때 이 룰북을 적용합니다. 이름이 다르면 이 룰북을 적용하지 마세요. `typography-token-rule.md` 의 텍스트 카테고리(`display`, `headline`, `body`, `magazine`) 와 세트로 봅니다.

## 0. 체크리스트

1. `icon-prop` 컬렉션이 존재하는지 확인한다.
2. `icon-size` 컬렉션이 `size-N` 형식의 모드를 갖는지 확인한다 (예: size-1 ~ size-9).
3. `icon-frame-*` 형식의 컴포넌트가 5개 있는지 확인한다: `icon-frame-display`, `icon-frame-headline`, `icon-frame-body`, `icon-frame-magazine`, `icon-frame-standalone`.
4. 각 `icon-frame-*` 컴포넌트가 두 층(바깥 프레임 + 안쪽 `icon-wrap`) 구조인지 확인한다.

## 1. 핵심 원칙 — icon-prop 토큰은 `icon-frame-*` 컴포넌트를 통해서만 적용

**`icon-prop` 컬렉션의 토큰은 `icon-frame-*` 컴포넌트 안에서만 사용됩니다.** 임의의 요소나 SVG 벡터에 이 토큰을 직접 바인딩하지 마세요.

그리고 이 프로젝트에서 **모든 아이콘 배치는 반드시 `icon-frame-*` 을 거칩니다.** 벡터 SVG 를 그냥 요소로 배치하고 아이콘처럼 쓰면 잘못된 사용입니다. 복합 컴포넌트(예: Button 의 leading/trailing 아이콘 슬롯) 도 raw SVG 가 아니라 `icon-frame-*` 인스턴스를 받도록 설계되어 있습니다.

이 제약은 `typeface-semantic` 토큰이 Text Style 을 통해서만 텍스트 노드에 적용되는 것과 같은 패턴입니다 (`typography-token-rule.md` §0, `style-rule.md` §0).

## 2. `icon-frame-*` 컴포넌트의 2층 구조

각 `icon-frame-*` 컴포넌트는 두 레이어로 구성됩니다:

```
icon-frame-body (예)
├─ height: icon-line-height/body 토큰 적용
└─ icon-wrap (하위 레이어)
    └─ height: icon-size/body 토큰 적용
       └─ (실제 아이콘 SVG 슬롯)
```

두 층으로 나눈 이유:
- **바깥 프레임 (`icon-line-height` 적용)** — 짝지어진 텍스트의 line-height 와 정확히 같은 높이. 프레임이 텍스트 라인 박스 안에 자연스럽게 자리잡음.
- **안쪽 `icon-wrap` (`icon-size` 적용)** — 실제 아이콘이 차지하는 시각적 크기. line-height 는 문자 위아래 여백을 포함하므로 아이콘 자체는 그보다 작아야 정렬이 자연스럽습니다.

`icon-frame-standalone` 은 짝지어진 텍스트가 없지만 동일하게 2층 구조를 갖습니다 — 크기 결정 기준이 텍스트가 아니라 배치 문맥이라는 점만 다릅니다.

## 3. 컴포넌트 선택 — 텍스트 카테고리 매칭

`icon-frame-*` 의 접미사는 함께 배치될 텍스트 카테고리와 대응합니다:

| 컴포넌트 | 쓰는 상황 |
|---|---|
| `icon-frame-display` | `display` 카테고리 텍스트 옆에 |
| `icon-frame-headline` | `headline` 카테고리 텍스트 옆에 |
| `icon-frame-body` | `body` 카테고리 텍스트 옆에 |
| `icon-frame-magazine` | `magazine` 카테고리 텍스트 옆에 |
| `icon-frame-standalone` | 텍스트 페어링 없이 단독으로 (아이콘 버튼, 아이콘만 있는 컨트롤 등) |

**규칙:** 아이콘 옆 텍스트 카테고리와 같은 이름의 `icon-frame` 을 선택합니다. 텍스트가 없다면 `icon-frame-standalone` 을 씁니다.

## 4. 모드 선택 — 텍스트 스텝과 매칭

`icon-size` 컬렉션의 모드(`size-1`, `size-2`, ...) 는 **텍스트의 스텝 번호와 대응** 합니다.

| 텍스트 스텝 | 아이콘 모드 |
|---|---|
| `body/b1` | `size-1` |
| `body/b6` | `size-6` |
| `headline/h3` | `size-3` |
| `display/d1` | `size-1` |
| standalone (텍스트 없음) | 배치 문맥에 맞춰 선택 |

**규칙:** 텍스트의 스텝 번호와 같은 숫자의 `size-N` 모드를 icon-frame 을 감싸는 서브트리에 지역 오버라이드로 적용합니다. CSS 상으로는 `[data-icon-scale="size-N"]` 로 걸립니다 (`color-token-rule.md` §10 의 서브트리 지역 오버라이드 원칙과 같은 축).

`icon-frame-standalone` 은 짝지어진 텍스트가 없으므로 배치 문맥(버튼 크기, 화면 밀도) 에 맞춰 사용자가 판단합니다.

## 5. 조합 예시

**body 6단계 텍스트 옆에 아이콘을 배치:**

```
1. icon-frame-body 인스턴스를 배치
2. 이 인스턴스를 감싸는 부모(또는 icon-frame 자체) 에
   data-icon-scale="size-6" 을 적용
3. 프레임 안 슬롯에 실제 아이콘 SVG 를 넣는다
```

**복합 컴포넌트(예: Button) 에 아이콘 슬롯이 있을 때:**

Button 같은 복합 컴포넌트는 아이콘 슬롯이 **`icon-frame-*` 인스턴스를 받도록** 설계되어 있습니다. 슬롯에 raw SVG 를 넣지 않고, 텍스트 카테고리에 맞는 `icon-frame-*` 인스턴스를 넣고 그 안에 SVG 를 배치합니다.

## 6. 자주 발생하는 오류 패턴

| 오류 | 올바른 처리 |
|---|---|
| SVG 벡터를 `icon-frame` 없이 직접 배치 | 모든 아이콘은 `icon-frame-*` 을 통과해야 함 |
| `icon-prop` 토큰을 임의의 요소에 직접 바인딩 | `icon-frame-*` 컴포넌트를 통해서만 적용 가능 |
| body 텍스트 옆에 `icon-frame-headline` 사용 | 텍스트 카테고리와 동일한 icon-frame 선택 |
| `icon-size` 모드를 텍스트 스텝과 다르게 지정 (예: body-6 옆에 size-3) | 스텝 번호 일치 |
| 텍스트 없는 아이콘에 `icon-frame-body` 를 사용 | 텍스트가 없으면 `icon-frame-standalone` |
| Button 등 복합 컴포넌트의 슬롯에 raw SVG 삽입 | 슬롯에는 `icon-frame-*` 인스턴스를 넣고 그 안에 SVG |
| `icon-frame` 안에서 크기를 하드코딩 (`w-4 h-4` 등) | 크기는 icon-frame 이 이미 토큰으로 결정 — 하드코딩 금지 |

## 7. 치트시트

| 하고 싶은 것 | 참고할 곳 |
|---|---|
| body 텍스트 옆에 아이콘 | `icon-frame-body` + `data-icon-scale="size-{텍스트 스텝}"` |
| headline / display / magazine 텍스트 옆 | 같은 카테고리의 `icon-frame-*` |
| 텍스트 없이 아이콘만 (아이콘 버튼 등) | `icon-frame-standalone` |
| 복합 컴포넌트(Button 등) 안의 아이콘 슬롯 | 해당 슬롯에 `icon-frame-*` 인스턴스 배치 |
| SVG 를 그냥 넣고 싶다 | 안 됨. 반드시 `icon-frame-*` 을 거친다 |
| 아이콘 크기가 텍스트와 어긋나 보인다 | `data-icon-scale` 이 텍스트 스텝과 일치하는지, icon-frame 카테고리가 맞는지 확인 |
