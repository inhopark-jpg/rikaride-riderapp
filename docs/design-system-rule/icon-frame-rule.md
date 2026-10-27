# Icon Frame 적용 규칙 (공통 룰북)

> **다루는 것** — `icon-frame` 변수 컬렉션과 이를 소비하는 `icon-frame-*` (5개) 컴포넌트. 모든 아이콘 배치가 `icon-frame-*` 을 거친다는 제약, 2층 구조, 텍스트 카테고리·스텝 ↔ 컴포넌트·모드 매칭.
> **관련 룰북** — `typography-token-rule.md` (`line-height/*` — `icon-line-height` 가 참조하는 원본), `text-style-rule.md` (카테고리·스텝 이름), `shape-token-rule.md` §3, `color-token-rule.md` §6 (positive/negative 색) · §10 (모드 지역 오버라이드)
> **소비 제약** — `icon-frame` 컬렉션 변수는 `icon-frame-*` 컴포넌트에만 바인딩된다. 모든 아이콘 배치는 `icon-frame-*` 을 거친다.

**값이 아니라 의미와 사용 규칙만 다룹니다.** 실제 크기·line-height 숫자는 하드코딩하지 않습니다 — 프로젝트의 `design-tokens.json`이 항상 유일한 진실의 원천입니다.

> **적용 범위 / 전제**: Figma 파일에 `size-N` 형식의 모드를 가진 **`icon-frame` 변수 컬렉션**이 있고, `icon-frame-*` 형식의 컴포넌트 5개가 이 컬렉션의 변수를 소비할 때 유효합니다. 컬렉션·컴포넌트 이름이 다르면 이 룰북을 적용하지 마세요.

## 0. 체크리스트

1. `icon-frame` 컬렉션이 있고 모드가 `size-1` ~ `size-N` 형식인지 확인한다.
2. 컬렉션 안에 `icon-line-height/{text-pair}` 와 `icon-size/{text-pair}` 두 계열이 있는지 확인한다. `text-pair` 는 `display`, `headline`, `body`, `magazine`, `standalone`.
3. `icon-frame-display`, `icon-frame-headline`, `icon-frame-body`, `icon-frame-magazine`, `icon-frame-standalone` 5개 컴포넌트가 있는지 확인한다.
4. 각 컴포넌트가 두 층(바깥 프레임 + 안쪽 `icon-wrap`) 구조이고, 아이콘을 instance swap 속성으로 교체하는지 확인한다.

## 1. 핵심 원칙 — 아이콘은 `icon-frame-*` 을 통해서만 배치한다

**아이콘을 그냥 넣지 않는다.** 아이콘이 필요한 자리에는 항상 `icon-frame-*` 5개 중 하나의 인스턴스를 놓고, 실제 아이콘은 그 인스턴스의 instance swap 속성으로 교체합니다. 벡터나 아이콘 컴포넌트를 직접 배치해 아이콘처럼 쓰면 잘못된 사용입니다. 복합 컴포넌트(예: 버튼의 leading/trailing 아이콘 자리)도 마찬가지로 `icon-frame-*` 인스턴스를 담습니다.

`icon-frame` 컬렉션의 변수는 `icon-frame-*` 컴포넌트 안에만 바인딩되어 있습니다. 다른 요소에 직접 바인딩하지 않습니다. 이 제약은 `typeface-semantic` 이 Text Style 을 통해서만 텍스트에 적용되는 것과 같은 패턴입니다 (`text-style-rule.md` §0).

## 2. `icon-frame` 컬렉션 — 두 계열과 참조 관계

| 계열 | 바인딩 위치 | 참조하는 변수 |
|---|---|---|
| `icon-line-height/{display\|headline\|body\|magazine}` | 바깥 프레임 height | `typeface-semantic` 의 `line-height/{카테고리}/{스텝}` — 모드 `size-N` 이 스텝 N 을 참조 |
| `icon-line-height/standalone` | 바깥 프레임 height | `shape-primitive` 의 size 스케일 (짝지어진 텍스트가 없음) |
| `icon-size/{text-pair}` | `icon-wrap` 너비·높이 | `shape-primitive` 의 size 스케일 |

**`icon-line-height` 가 텍스트의 `line-height` 변수를 참조하는 이유**: 아이콘 프레임 높이를 짝지어진 텍스트의 라인 박스 높이와 항상 같게 유지하기 위해서입니다. 텍스트의 line-height 가 바뀌면 프레임 높이도 자동으로 따라갑니다. 이 참조를 숫자나 다른 토큰으로 끊지 않습니다.

## 3. `icon-frame-*` 컴포넌트의 2층 구조

```
icon-frame-body (예)
├─ height: icon-line-height/body  ← 짝지어진 body 텍스트의 line-height 와 같은 높이
└─ icon-wrap
    └─ width/height: icon-size/body  ← 아이콘 자체의 시각적 크기
       └─ 아이콘 (instance swap 으로 교체)
```

- **바깥 프레임** — 텍스트 라인 박스와 같은 높이라서 텍스트 옆에 나란히 놓으면 세로 정렬이 맞습니다.
- **안쪽 `icon-wrap`** — line-height 는 글자 위아래 여백을 포함하므로 아이콘 자체는 그보다 작습니다.

`icon-frame-standalone` 도 같은 2층 구조입니다. 짝지어진 텍스트가 없다는 점만 다릅니다.

## 4. 컴포넌트 선택 — 텍스트 카테고리 매칭

| 컴포넌트 | 쓰는 상황 |
|---|---|
| `icon-frame-display` | `display` 텍스트와 함께 |
| `icon-frame-headline` | `headline` 텍스트와 함께 |
| `icon-frame-body` | `body` 텍스트와 함께 |
| `icon-frame-magazine` | `magazine` 텍스트와 함께 |
| `icon-frame-standalone` | 텍스트와 페어링 없이 단독으로 (아이콘 버튼 등) |

**규칙:** 함께 놓이는 Text Style 의 카테고리(`text-style-rule.md` §2 의 첫 세그먼트)와 같은 이름의 `icon-frame-*` 을 고릅니다. 굵기는 선택에 영향을 주지 않습니다 — `body/regular/b3` 옆이든 `body/bold/b3` 옆이든 `icon-frame-body` 입니다. 텍스트가 없으면 `icon-frame-standalone` 입니다.

## 5. 모드 선택 — 텍스트 스텝 매칭

`icon-frame-*` 인스턴스(또는 그것을 감싸는 서브트리)에 `icon-frame` 컬렉션의 모드 **`size-N`** 을 명시적으로 지정합니다. **N 은 짝지어진 텍스트의 스텝 번호**입니다.

| 짝지어진 텍스트 | 컴포넌트 | 모드 |
|---|---|---|
| `body/regular/b3` | `icon-frame-body` | `size-3` |
| `body/bold/b6` | `icon-frame-body` | `size-6` |
| `headline/bold/h3` | `icon-frame-headline` | `size-3` |
| `magazine/regular/m2` | `icon-frame-magazine` | `size-2` |
| 없음 | `icon-frame-standalone` | 배치 문맥(버튼 크기, 화면 밀도)에 맞춰 판단 |

그래야 §2 의 참조를 따라 프레임 높이가 그 스텝의 line-height 와 같아집니다.

**그 카테고리에 없는 스텝의 모드는 쓰지 않습니다.** 컬렉션의 모드 수는 카테고리 중 가장 긴 스텝 범위에 맞춰져 있어서, 스텝이 더 적은 카테고리에는 대응하는 텍스트가 없는 모드가 남습니다. 그런 모드의 값은 `0` 입니다. 예: body 텍스트는 b6 까지만 있으므로 `icon-frame-body` 에 `size-7` ~ `size-9` 를 적용할 수 없습니다. 어떤 스텝이 있는지는 Text Style 목록(`text-style-rule.md`)에서 확인합니다.

모드는 서브트리 단위로 지역 오버라이드됩니다 (`color-token-rule.md` §10 과 같은 원리, 별개의 축). 코드에서는 `[data-icon-scale="size-N"]` 속성으로 겁니다.

## 6. 자주 발생하는 오류 패턴

| 오류 | 올바른 처리 |
|---|---|
| 아이콘(벡터·아이콘 컴포넌트)을 `icon-frame-*` 없이 직접 배치 | `icon-frame-*` 인스턴스를 놓고 instance swap 으로 아이콘 교체 |
| 복합 컴포넌트의 아이콘 자리에 아이콘을 직접 넣음 | 그 자리에도 `icon-frame-*` 인스턴스 |
| body 텍스트 옆에 `icon-frame-headline` | 텍스트 카테고리와 같은 이름의 `icon-frame-*` |
| 텍스트 없는 아이콘에 `icon-frame-body` | `icon-frame-standalone` |
| 모드를 텍스트 스텝과 다르게 지정 (b6 옆에 `size-3`) | 스텝 번호와 같은 `size-N` |
| 카테고리에 없는 스텝의 모드 적용 (`icon-frame-body` 에 `size-9`) | 존재하는 텍스트 스텝 범위 안에서만 |
| `icon-line-height` 를 숫자나 다른 토큰으로 바꿔 끊음 | `typeface-semantic` `line-height/*` 참조 유지 (§2) |
| `icon-frame` 변수를 다른 요소에 직접 바인딩 | `icon-frame-*` 컴포넌트 안에서만 |
| `icon-frame` 안에서 크기를 하드코딩 (`w-4 h-4` 등) | 크기는 icon-frame 이 이미 토큰으로 결정 |

## 7. 치트시트

| 하고 싶은 것 | 참고할 곳 |
|---|---|
| body 텍스트 옆에 아이콘 | `icon-frame-body` + 모드 `size-{텍스트 스텝}` |
| display / headline / magazine 텍스트 옆 | 같은 카테고리의 `icon-frame-*` + 모드 `size-{텍스트 스텝}` |
| 텍스트 없이 아이콘만 (아이콘 버튼 등) | `icon-frame-standalone`, 모드는 문맥에 맞게 |
| 아이콘 모양 바꾸기 | `icon-frame-*` 인스턴스의 instance swap 속성 |
| 아이콘 색 | `color-token-rule.md` §6 (positive / negative) |
| 아이콘 높이가 텍스트와 어긋나 보인다 | 카테고리가 맞는지, 모드 `size-N` 이 텍스트 스텝과 같은지 확인 |
