# Figma 작업 가이드 (FG)

이 문서는 **사람이 Figma에서 직접 작업할 때** 보는 문서다. Claude는 이 문서를 읽지 않는다 — Claude는 `docs/design-system-rule/` 아래 룰북 원문과 `docs/README.md` 라우팅표를 본다.

**이 문서는 요약본이다.** 진짜 기준은 항상 `docs/design-system-rule/*.md` 원문이고, 여기 내용과 원문이 어긋나면 **원문이 맞다**. 원문이 바뀌면 이 문서도 같이 갱신해야 한다 — 각 섹션 제목 옆에 원문 경로를 적어뒀으니, 뭔가 이상하면 그 파일을 먼저 확인한다.

**Figma 편집을 Claude 에게 맡길 수도 있다** — 컴포넌트 생성, 화면 조립, 하드코딩 텍스트 찾기와 번역 제안 등. 방법은 [GUIDEBOOK §2-F](GUIDEBOOK.md#f-figma-직접-편집-claude-에게-맡기기). 직접 작업한 뒤 이 문서의 규칙을 지켰는지는 `/figma-audit` 으로 검사할 수 있다 ([GUIDEBOOK §2-D-3](GUIDEBOOK.md#d-3-figma-구조-검사)).

디자인 토큰의 값(색상 hex, 간격 숫자 등)은 이 문서에도, 어떤 룰북에도 없다. 전부 `tokens/design-tokens.json` 또는 Figma 변수 패널에서 직접 조회한다. 여기서 다루는 건 "어떤 토큰을 왜 쓰는가"뿐이다. (예외: [§4](#4-섹션-정리하기)의 섹션 간격·배경색은 토큰이 아니라 캔버스 정리용 고정값이라 룰북과 이 문서에 직접 적는다.)

---

## 목차

1. [컴포넌트 만들기 — 3계층 구조](#1-컴포넌트-만들기--3계층-구조)
2. [이름 붙이기](#2-이름-붙이기)
3. [스켈레톤 속성을 템플릿이 다시 써야 할 때](#3-스켈레톤-속성을-템플릿이-다시-써야-할-때)
4. [섹션 정리하기](#4-섹션-정리하기)
5. [색상 적용하기](#5-색상-적용하기)
6. [간격·radius·아이콘 크기](#6-간격radius아이콘-크기)
7. [아이콘 배치하기](#7-아이콘-배치하기)
8. [텍스트 스타일 적용하기](#8-텍스트-스타일-적용하기)
9. [그림자·블러·리퀴드 글라스](#9-그림자블러리퀴드-글라스)
10. [다국어 문자열](#10-다국어-문자열)
11. [자주 하는 실수 모음](#11-자주-하는-실수-모음)
12. [부록 — 룰북 원문 대응표](#12-부록--룰북-원문-대응표)

---

## 1. 컴포넌트 만들기 — 3계층 구조

*(원문: `component-structure-rule.md`)*

모든 컴포넌트는 **스켈레톤 / 템플릿 / 패턴** 셋 중 하나다.

| 레이어 | 정의하는 것 | 콘텐츠(텍스트/아이콘) |
|---|---|---|
| **스켈레톤** | 형태 — radius, height, padding, gap, icon size | 없음 (색 소유 없음 — 칠한 색은 자리표시, 무채색 권장) |
| **템플릿** | 스킨 — 색상, 상태, 엘리베이션 | 플레이스홀더, 수정 가능 |
| **패턴** | 스킨 + 고정된 의미 | 완전히 고정 (데이터 슬롯 `{item_name}` 제외) |

### 어떤 레이어인지 판별하는 법 (2단계 테스트, 순서대로)

0. **스켈레톤이 될 수 없는 경우인가?** 템플릿을 담았거나, 퍼블리시되는 패턴을 담았거나, 자신이 빌딩블록이 아니면서 패턴을 담았으면 → 1번을 건너뛰고 2번으로. (빌딩블록 패턴은 스켈레톤의 부품일 수 있어 여기서 세지 않는다.)
1. **색상/상태/엘리베이션을 소유하는가?** (칠해진 색이 아니라 그 색을 여기서 정하는지) → 아니오면 **스켈레톤**. 끝. (수정 가능한 속성이 하나도 없어도 스켈레톤이다 — "고정이냐 수정 가능이냐"는 질문 자체가 이 레이어엔 안 통한다.)
2. **텍스트/아이콘/중첩 인스턴스 중 여전히 수정 가능한 게 있는가?** → 있으면 **템플릿**, 없으면 **패턴**. (고정된 콘텐츠를 켜고 끄기만 하는 표시 boolean·데이터 슬롯은 "수정 가능"에 넣지 않는다.)

다른 기준(예: "형제 인스턴스가 다르게 쓸 것 같다")은 쓰지 않는다 — 사람마다 판단이 달라진다.

### 중첩 규칙

```
스켈레톤 → 스켈레톤, 빌딩블록 패턴만 중첩 가능
템플릿   → 스켈레톤, 템플릿, 패턴 전부 중첩 가능
패턴     → 스켈레톤, 템플릿, 패턴 전부 중첩 가능
```

자기 자신과 같거나 아래 레이어만 중첩할 수 있다. 스켈레톤 안에 템플릿이나 퍼블리시되는 패턴이 들어가면 색상 규칙 위반이다. 부품인 빌딩블록 패턴(`.` 접두사)은 들어갈 수 있다. (예외: `icon-frame-*`도 스켈레톤에 들어갈 수 있다)

### 속성은 누가 소유하는가

| 속성이 바뀌면 영향받는 것 | 소유 레이어 |
|---|---|
| 형태, 크기, 간격, 배치 | 스켈레톤 |
| 보이는 방식(같은 면적 안에서) | 템플릿 |
| 의미·문구 | 패턴 |

- `disabled` 같은 상태 속성은 아무리 고정된 패턴을 거쳐도 화면까지 반드시 전달돼야 한다 — 중간에 상태가 끊기면 버그다.
- 멀티 브랜드: 스켈레톤은 공유, 템플릿은 브랜드별(색상=브랜드), 패턴은 제품별. 브랜드마다 지오메트리가 다르면 스켈레톤 자체를 분리한다(템플릿에서 오버라이드하지 않는다).

### 플래그 (레이어와 별개)

- **빌딩블록**: 인스턴스가 화면에 직접 배치되지 않는 컴포넌트. 스켈레톤은 항상 빌딩블록. 이름 앞에 `.` 접두사. "단독 사용 불가 = 스켈레톤"이라고 넘겨짚지 않는다 — 별개의 질문이다.
- **스코프(전역/전용)**: 이름에 표시하지 않는다. 컴포넌트가 위치한 페이지가 스코프를 나타낸다.

### variant 로 묶을지, 별도 컴포넌트로 나눌지

먼저 묻는다: **같은 인스턴스가 사용 중에 오가는 상태인가, 처음에 골라 쓰는 타입인가?**

- **상태**(pressed, disabled, collapsed/expanded, 시스템이 크기를 바꿔 보여주는 위젯 형태 등) → **하나의 컴포넌트 셋**. 상태마다 레이아웃이 다르거나 일부 상태에서만 쓰는 속성이 있어도 묶는다.
- **타입**(btn-primary / btn-ghost 등) → 같은 스켈레톤에 속성이 전부 같으면 하나의 셋, 속성이 하나라도 갈라지면 **별도 컴포넌트**로 나누고 타입을 subgroup 으로 이름에 넣는다.
- 합친 배리언트가 대략 50개를 넘으면 타입 축에서 나눈다.

> 단순히 색상만 다르고(예: `type: default | destructive`) 나머지 속성이 전부 같다면 분리 사유가 아니다 — 하나의 컴포넌트에 `type` 속성으로 둔다.

### 페이지 배치 (순서대로 판단, 먼저 해당되는 데서 멈춤)

1. 그 자체로 정체성이 있는가(맥락 없이 이름만으로 요청할 만한가 — "버튼 추가해줘") → **자기 전용 페이지**
2. 하나의 기능에만 전용인가 → **해당 기능 페이지**
3. 정확히 하나의 패밀리만 이 컴포넌트를 구성 요소로 쓰는가 → **그 패밀리 페이지**
4. 서로 무관한 2개 이상의 패밀리가 쓴다 → **01 Foundations**

재사용 빈도가 높다고 무작정 Foundations로 옮기지 않는다 — 정체성이 있으면(예: 버튼) 자기 페이지를 유지한다.

### 언제 새로 만드는가 (2회 규칙)

| 상황 | 조치 |
|---|---|
| 일회성 콘텐츠, 반복될지 불확실 | 컴포넌트로 만들지 않고 인스턴스에 직접 입력 |
| 두 번째로 반복되거나, 처음부터 봐도 명백히 범용적 | 패턴으로 만들고 처음부터 올바른 스코프로 배치 |
| 로컬 컴포넌트가 두 번째 기능에서도 필요해짐 | 전역으로 승격(이름 변경, 페이지 이동) |
| 템플릿 패밀리에 진짜 두 번째 타입이 생김 | 스켈레톤 추출 |

불확실할 때만 "두 번째 등장까지 기다린다". "확인" 버튼처럼 보자마자 명백히 범용적인 건 처음부터 전역으로 만들어도 된다. **강등(전역→로컬)은 하지 않는다** — 결과적으로 한 곳에서만 쓰였어도 전역 상태를 유지한다.

### 패밀리 ≠ 공유 스켈레톤

**패밀리는 공유된 정체성이지, 공유된 스켈레톤이 아니다.** 같은 패밀리 안에서도 스켈레톤이 서로 다를 수 있다. 겉보기엔 비슷해서 스켈레톤을 공유시켰는데, 실제로 지원 범위(사이즈, 상태 등)가 다르다는 게 나중에 드러나면 — 그건 같은 스켈레톤이 아니었다는 뜻이다. (자세한 판단 기준은 [§3](#3-스켈레톤-속성을-템플릿이-다시-써야-할-때) 참고.)

---

## 2. 이름 붙이기

*(원문: `component-structure-rule.md` §3, `design-to-dev-rule.md` §1~4)*

| 레이어 | Figma 이름 형태 | 예시 |
|---|---|---|
| 스켈레톤 | `.skeleton/{family}-{subgroup}` | `.skeleton/btn` |
| 템플릿 | `{family}-{subgroup}` | `btn-ghost` |
| 패턴 (템플릿을 활용) | `{template}/pattern-{name}` | `btn-primary/pattern-go-back` |
| 패턴 (템플릿 없이 만듦) | `pattern-{family}-{name}` | `.pattern-gnb-item-bg` |

- `subgroup`은 선택 사항, 항상 하이픈(`-`)으로 결합. 슬래시(`/`)는 딱 두 경우에만: `.skeleton/`, 그리고 `{template}/pattern-{name}` — 특정 템플릿을 활용한 패턴일 때만. 템플릿 없이 만든 패턴은 슬래시 없이 `pattern-` 을 맨 앞에 둔다.
- **이름은 "그것이 무엇인지"로 짓는다** — 위치나 구성 요소로 짓지 않는다. 나쁜 예: `btn-layout-with-cancel-and-confirm-buttons/pattern-x`. 좋은 예: `btn-layout/pattern-cancel-confirm`.
- **"default", "main" 같은 이름을 패턴 이름으로 쓰지 않는다.** 패턴은 자기 자신을 설명하는 구체적인 이름이어야 한다.
- `pattern-`는 스켈레톤에 절대 안 붙는다. 콘텐츠가 고정된 모든 패턴엔 항상 붙는다(대응하는 열린 템플릿이 실제로 있는지 여부와 무관).

**Figma에서 이 규칙대로 이름을 붙이면, Claude가 코드로 옮길 때 이름이 기계적으로 변환된다** (`.` → `_`, `pattern-`가 맨 앞으로, PascalCase):

| Figma | 코드 컴포넌트명 |
|---|---|
| `.skeleton/btn-ghost` | `_SkeletonBtnGhost` |
| `btn-ghost` | `BtnGhost` |
| `btn-ghost/pattern-go-back` | `PatternBtnGhostGoBack` |

Figma 쪽 이름이 이 스키마를 안 따르면 자동 변환이 깨지거나 Claude가 판단을 잘못할 수 있다 — 새 컴포넌트를 만들 때 이름부터 이 표에 맞춰 짓는다.

---

## 3. 스켈레톤 속성을 템플릿이 다시 써야 할 때

*(원문: `design-to-dev-rule.md` §5)*

스켈레톤이 가진 속성(`size`, `loading` 등)을 템플릿이 그대로 쓰거나 다르게 써야 하는 경우, Figma엔 두 가지 방식이 있다:

1. **중첩 인스턴스 속성 노출(expose)** — 템플릿이 스켈레톤 인스턴스의 속성을 그대로 밖으로 뚫어서 보여준다. 스켈레톤에 값이 추가되면 자동으로 따라온다. 유지보수 비용 없음.
2. **템플릿 자체 속성으로 재선언** — 템플릿이 자기만의 독립된 속성을 새로 만든다. 스켈레톤이 커지면 수동으로 갱신해야 한다.

### 작업 순서

1. **기본은 노출(1번)이다.** 손댈 게 없다.
2. **특정 값에서 색상·동작이 실제로 갈라질 때만** 그 속성 하나만 재선언한다(2번). **판단은 속성 단위다** — 하나를 재선언했다고 나머지까지 통일해서 재선언하지 않는다. (예: `btn-primary`는 `size`는 노출, `loading`만 재선언.)
3. **값의 일부만 지원해야 하면 재선언하지 말고 스켈레톤 자체를 나눈다.** 예: `badge-pill`과 `badge-ghost`가 겉보기엔 같아서 `.skeleton/badge`를 공유했는데, `badge-ghost`가 `size-xs`를 지원하지 않는다면 → `.skeleton/badge-pill` / `.skeleton/badge-ghost`로 나눈다. 나눈 뒤엔 각자 1번(노출)만 쓰면 되므로 재선언 자체가 필요 없어진다.
4. **값 범위를 의도적으로 제한한 거라면 그 컴포넌트의 Figma description에 이유를 적는다.** 안 적으면 나중에 "디자이너가 안 만든 건지 일부러 뺀 건지" 아무도 구분 못 한다.
5. **재선언한 속성을 쓸 때는 항상 속성 패널 최상단(템플릿 자체) 값만 만진다.** 그 아래 중첩된 스켈레톤 그룹에 같은 이름의 속성이 또 보여도 절대 건드리지 않는다 — 둘은 서로 연결돼 있지 않아서, 따로 만지면 값이 어긋난 채로 배포될 수 있다.

---

## 4. 섹션 정리하기

*(원문: `section-layout-rule.md`)*

Figma 페이지 안의 컴포넌트와 화면은 **Section 중첩**으로 정리한다. 섹션의 위치만 보고도 누가 무엇을 쓰는지 알 수 있게 하는 게 목적이다. 핵심 원칙은 하나다 — **쓰는 쪽이 위, 재료가 아래.**

> "페이지"라는 말이 두 가지라 주의한다. 그냥 "페이지"(page 섹션, 페이지 레이아웃)는 **앱·웹의 화면 페이지**고, Figma 좌측 패널의 페이지는 항상 **"Figma 페이지"**라고 부른다.

### 섹션 이름

| 섹션 | 이름 |
|---|---|
| 최상위 | 패밀리명(`button`) 또는 흐름 이름(`Home`) |
| sub-group | **이름 없음** — 이름 없는 섹션은 sub-group 에만 쓴다 |
| template / pattern | 안에 든 컴포넌트 이름과 **글자 하나까지 같게** (`btn-primary`) |
| building-block | 항상 `building-block` (컴포넌트 이름 아님) |
| 주석 섹션(`적용 예시` 등) | 자유. **fill 없음 + dashed stroke** ([주석 달기](#주석-달기)) |

섹션 하나에는 **주제 컴포넌트(또는 화면) 하나**만 넣는다. (예외: 아이콘 글리프는 분류별 섹션으로 묶는다)

### 컴포넌트 레이아웃 (패밀리·Foundations Figma 페이지)

- 패밀리 섹션 안에 sub-group 을 가로로 놓는다. **sub-group = 같은 빌딩블록(주로 스켈레톤)을 함께 쓰는 템플릿·패턴의 묶음.** 공유하는 게 없으면 따로 sub-group 을 만든다 (복합 템플릿, 독립 패턴도 각자).
- template 섹션은 위에서부터 **pattern 섹션 줄 → 템플릿 본문(주석·주석 섹션 포함) → building-block 줄**. 패턴은 이름 앞부분이 가리키는 template 섹션에 넣는다 (`btn-ghost/pattern-go-back` → `btn-ghost` 섹션).
- building-block 섹션 안에는 빌딩블록 하나(패턴이 있는 템플릿이면 위에 pattern 줄), 그 아래에 그 빌딩블록이 쓰는 빌딩블록들 (재귀).
- 형제끼리 높이를 맞추지 않는다.

### 페이지 레이아웃 (Feature Figma 페이지)

- 흐름 하나가 최상위 섹션 하나. 안의 sub-group 은 **세로로** 쌓는다.
- page 섹션은 위에 **[화면] → (1000) → [하위 page 들]**, 아래에 **building-block 줄**. 하위 page 도 같은 구조를 반복한다 (하위 page = 이 화면에서 진입하는 화면).
- 여기서 building-block 은 **그 화면들이 쓰는 이 feature 전용(로컬) 컴포넌트**다. 자기 Figma 페이지가 있는 패밀리 컴포넌트는 두지 않는다.
- 같은 줄의 형제 page 섹션은 높이를 맞춘다.

### 빌딩블록을 어디에 두는가

1. 다른 빌딩블록이 쓰면 → 그 빌딩블록의 building-block 섹션 **안**에 중첩
2. 아니면 → 쓰는 것들을 **모두 포함하는 가장 안쪽 섹션의 맨 아래** (템플릿 하나만 쓰면 그 template 섹션, 여럿이 쓰면 sub-group / 화면 하나만 쓰면 그 page 섹션, 여럿이면 그들을 포함하는 섹션)
3. 이 Figma 페이지 안에 쓰는 곳이 없으면 → 독립 sub-group

building-block 섹션이 아닌 섹션의 맨 아래 줄에 놓인 building-block 섹션은 부모 섹션이 더 넓으면 그 폭까지 늘린다 (같은 줄에 여럿이면 각자 폭 유지). building-block 섹션 안에 중첩된 building-block 섹션(재료의 재료)은 자기 내용 폭을 유지한다.

### 배경색과 간격 (캔버스 고정값)

- 배경: 최상위 **투명** → 흰색 `#FFFFFF` → `#F2F2F2` → `#E6E6E6` → `#F2F2F2` … 깊이마다 번갈아. 주석 섹션은 fill 없이 두고 순서에서 건너뛴다.
- 간격: 섹션 안쪽 여백 100 / 형제 사이 100 / 컴포넌트 레이아웃 위아래 띠 사이 200 / 페이지 레이아웃 띠 사이·sub-group 사이 1000.

### 하지 말 것

- 작은 흰색 컴포넌트가 안 보인다고 **배경용 섹션으로 감싸지 않는다** — 이름 없는 섹션은 sub-group 으로 읽힌다. 필요하면 섹션이 아닌 배경 frame 을 뒤에 깐다.
- 컴포넌트 이름을 바꾸고 섹션 이름을 그대로 두지 않는다 — 둘은 항상 같아야 한다.

### 주석 달기

*(원문: `annotation-rule.md`)*

| 설명할 것 | 도구 | 위치 |
|---|---|---|
| variant 가 어느 속성 값인지 | `section-indicator` 브래킷 | 셋의 **위(X축)·왼쪽(Y축)에만** |
| 이 UI 가 무엇인지, 이름 | `address-platter` + `.address-anchor` | UI 근처, 같은 섹션 |
| 컴포넌트 안 특정 레이어 | Figma annotation (카테고리 없음) | 그 레이어 |
| 컴포넌트 전체 | Figma spec | 주제 옆, 같은 섹션 |
| 적용 예시·그림 설명 | 주석 섹션 | 주제 옆, 같은 섹션 |

- **브래킷 라벨**은 `{속성}:` 줄바꿈 `{값}` 두 줄. 한 축에 속성이 여럿이면 덜 자주 바뀌는 속성이 바깥. 값이 하나뿐인 속성은 생략. 라벨끼리, 다른 주석과 겹치지 않게 간격을 넓힌다.
- **anchor** 는 platter 안에 메인 컴포넌트로 만들고, 텍스트는 UI 이름과 글자 하나까지 같게. 다른 곳에서 이 UI 를 가리킬 때 anchor 인스턴스를 놓으면 go to main component 로 원본에 갈 수 있다. 새 UI 의 anchor 는 복제해서 새 메인 컴포넌트로.
- **주석 섹션**: fill 없음, stroke 검정 2 / dash 8·8 / OUTSIDE. 배경을 칠하면 구조 섹션으로 오독된다.
- **컴포넌트 셋 테두리**: Figma 기본 보라 점선(`#8A38F5`, 1 / dash 10·5 / INSIDE, radius 5)을 지우지 않는다. 스크립트로 만든 셋에는 빠지므로 직접 넣는다.

---

## 5. 색상 적용하기

*(원문: `color-token-rule.md`)*

### 2단계 구조 + 이름 구조

```
color-primitive  ← 원색 램프 + 색상군마다의 투명도 램프 (main-alpha / dark-alpha / light-alpha)
color-semantic   ← 실제로 컴포넌트에 바인딩. color-primitive를 참조
```

**컴포넌트에는 항상 `color-semantic`만 쓴다.** 이름은 `{역할}/{그룹}/{맥락}/{스케일}` 이다.

- **역할** 3가지: `surface`(면), `stroke`(테두리·구분선), `inner`(면 위의 텍스트·아이콘).
- **그룹**은 세 역할 공통: `neutral`·`brand`·`success`·`error`·`warning`·`info`.
- **맥락**도 세 역할 공통: `default`·`inverse`·`fixed-deep`·`fixed-pale`. `surface` 에서는 면의 톤, `stroke`·`inner` 에서는 선·글자 자신의 톤이다 — 같은 맥락 이름끼리 짝이 아니다.
- `deep`·`pale` 은 밝기가 아니라 **진하기**다. 색 그룹의 진한 쪽은 그 자체로 밝을 수 있다(노랑 계열 등). 이름으로 짝을 정하지 말고 대비를 잰다.
- 이 구조를 따르지 않는 최상위 셋: `interactive/{변이}/{surface|stroke|inner}/{상태}`, `state/pressed/{on-light|on-dark|on-brand}`·`state/disabled/global`, `styles/{shadow|gradient}/*`.
- **면과 글자는 같은 그룹일 필요가 없다.** 글자는 실제로 얹히는 배경과의 대비로 고른다 (아래 「글자 고르기」).

### 최상위마다 다른 어휘

| | `interactive` | `surface` | `stroke` · `inner` | `styles` |
|---|---|---|---|---|
| 마지막 세그먼트 | **상태**: `default`, `disabled`, `selected`, `selected-brand`, `floating`, `overlay-default`, `overlay-brand`, `subtle`, `placeholder`, `brand` | `lowest`~`base` (불투명) · `high`~`highest` (반투명) | `lowest`~`base` | 역할마다 고정 목록 |
| "기본값" 이름 | `default` | `base` | `base` | 없음 |
| 레이어에 직접 바인딩 | 예 | 예 | 예 | **아니오** |

| 맥락 | 라이트 | 다크 |
|---|---|---|
| `default` | 면 연하게 · 선·글자 진하게 | 면 진하게 · 선·글자 연하게 |
| `inverse` | `default` 의 반대 | `default` 의 반대 |
| `fixed-deep` | 진하게 | 진하게 (모드와 무관) |
| `fixed-pale` | 연하게 | 연하게 (모드와 무관) |

| 역할 | 스케일 |
|---|---|
| `surface` `base`·`low`·`lower`·`lowest` | 불투명. 아래로 갈수록 물러난 면 — 모든 그룹·맥락·모드에서 어두워진다 |
| `surface` `high`·`higher`·`highest` | 반투명. `high` 가 가장 많이 비친다 |
| `stroke` `base`~`lowest` | 테두리 세기. `base` 만 불투명. **surface 단계와 짝이 아니다** |
| `inner` `base`~`lowest` | 강조 단계. `base` 만 불투명, `lowest` 는 장식·비활성 수준 |

어휘를 섞지 않는다 — `stroke`·`inner` 에 `high` 를, `surface` 에 `default` 상태를 찾지 않는다.

### `styles` 그룹: 레이어가 아니라 Style이 소비한다 (원문: `color-token-rule.md` §2-1)

`styles/shadow/{low|mid|high}` 와 `styles/gradient/{overlay|solid|transparent}` 는 **Effect Style·색상 Style이 참조하는 색**이다. 레이어에는 Style을 적용하고, Style이 이 토큰을 참조한다.

- **레이어별 색 선택 규칙(대비 판정, 상태 판정, QA 순회)의 대상이 아니다.** QA 중 `styles` 토큰을 만나면 위반이 아니라 "Style이 소비하는 토큰"으로 보고 넘어간다.
- 반대로 **레이어가 `styles` 토큰을 직접 물고 있으면 위반**이다 — Style을 적용해야 할 자리다.
- 존재 이유는 모드다. `effects` 컬렉션과 색상 스타일에는 모드 축이 없어서, 그림자·그라디언트 색을 primitive에 직접 걸면 다크모드에서 영원히 안 바뀐다. `color-semantic` 안으로 끌어오면 **이 컬렉션의 모드 하나만 전환해서 색·그림자·그라디언트가 함께 따라온다.**

### Interactive: surface/stroke/inner는 따로 논다

패턴: `interactive/{변이}/{surface|stroke|inner}/{상태}`. 변이: `primary` > `secondary` > `outline` > `ghost` (+ 각각 `-destructive`).

**핵심: 세 역할의 상태가 항상 같이 바뀌는 게 아니다.** disabled 에서 면은 `surface/default`를 유지한 채 `inner/disabled`만 바뀌는 경우가 있다 — 면의 상태를 보고 글자도 같은 상태일 거라 넘겨짚지 않는다. 판단 우선순위: ① `surface/` 변수 ② 컴포넌트 자체 property(`state` 등) ③ `stroke/` 변수(surface 없을 때만) ④ 그 외 변수.

원하는 상태의 토큰이 없으면 `default`로 대체한다 — 정상적인 폴백이다. `inner/subtle`(보조 텍스트/아이콘)이 이미 쓰여있는 자리는 `default`로 강제로 바꾸지 않는다 — 의도된 선택이다. 반투명 상태(`floating`·`overlay-*`) 위의 글자는 아래 「글자 고르기」를 따른다.

`interactive` 에는 `fixed-*` 맥락이 없다. 고정된 면 안에 버튼 같은 컴포넌트가 들어가면 토큰을 바꾸지 말고 그 영역에 모드를 지정한다 (아래 「모드(테마)와 서브트리 오버라이드」).

`state/pressed/{on-light|on-dark|on-brand}`는 베이스 색이 아니라 **이미 칠해진 면 위에 겹치는 덧칠 레이어**다 — 변이/상태 판단 대상에서 제외한다. **대상 이름은 그 아래 면을 가리킨다**: 앱 기본 면(`default`) 위에는 `on-light`, 반대 톤 면(`inverse`) 위에는 `on-dark`, 브랜드 대표색 면 위에는 `on-brand`. light/dark 는 라이트 모드 기준이라 다크에서는 덧칠 방향이 면과 함께 바뀐다. 비활성은 `state/disabled/global`(불투명도 40%)을 레이어 opacity 에 건다 — 색 상태 토큰이 없는 그릇 전체를 흐릴 때, 가장 바깥 레이어 하나에만.

### 최상위 선택: 색이 상태를 표현하는가 (원문: `color-token-rule.md` §3)

누를 수 있는지가 아니라 **색이 상태에 따라 바뀌는가**로 정한다. pressed 는 어느 쪽이든 `state/pressed/*` 라 판단에서 뺀다.

- **권장 `interactive`** — 버튼·칩·토글·입력·탭처럼 상태가 색으로 정의되는 컨트롤.
- **권장 `surface`·`stroke`·`inner`** — 카드·리스트 행·배너처럼 누를 수 있지만 색 상태가 pressed 뿐인 그릇. 비활성은 `state/disabled/global`.
- **괜찮음** — 그 그릇에 selected 같은 색 상태가 있으면, 상태 레이어(면·테두리)만 `interactive` 상태 토큰, 안쪽 콘텐츠는 non-interactive. 각 상태 배경에서 대비를 다시 잰다.
- **비권장** — 상태 색을 non-interactive 단계로 직접 만들기(브랜드별 상태 색에서 벗어남), 정적 요소에 `interactive`.
- 그릇 안의 컴포넌트 인스턴스(카드 안 버튼 등)는 그 컴포넌트의 기준을 따른다.
- `interactive` 컨트롤 안에서는 ① knob·트랙처럼 어느 역할에도 안 맞는 그래픽 요소, ② interactive 토큰으로는 대비가 부족/과한 경우에만 **그 레이어만** `surface`·`stroke`·`inner` 를 빌린다. 빌린 레이어부터 새 컨텍스트, 상태별 색은 variant마다 스케일로 지정, pressed는 계속 `state/pressed/*`.

### 면 고르기: 맥락과 단계로 (원문: `color-token-rule.md` §5)

- **맥락** — 앱과 같이 뒤집혀야 하면 `default`, 기준 면과 반대 톤이면 `inverse`, 모드와 무관하게 늘 진하거나 연해야 하면 `fixed-deep`·`fixed-pale`.
- **단계** — 아래가 비치지 않는 면은 불투명(`base`~`lowest`), 아래에 있는 것 위에 떠 있거나 덧칠하는 면(스낵바·GNB·다이얼로그·플로팅 버튼·구분 블록)은 반투명(`high`~`highest`). blur·liquid-glass 는 추정 근거일 뿐 조건이 아니다.
- 반투명 세 단계 중에서는 **그 위 텍스트의 가독성**을 보고 고른다. 떠 있는 요소는 필요하면 그림자나 `stroke` 를 보탠다. 기준면보다 올라온 불투명 단계는 없다.
- `stroke` 도 실제 배경 위에서 보이는 맥락을 고른다. 권장 대비 수치는 없고, 묻히지 않는지만 본다.

### 글자 고르기: 실제 배경과의 대비로 (원문: `color-token-rule.md` §5)

**누가 고르든 기준은 하나 — 그 글자·아이콘이 얹힌 배경과의 대비.**

1. **실제 배경을 정한다.** 반투명 면(`high`~`highest`, interactive 의 `floating`·`overlay-*`)이면 그 뒤에 비치는 것까지 합성한 색이다. 같은 면이라도 밝은 면 위와 어두운 사진 위에서는 맞는 글자가 다르다.
2. **모든 모드에서 잰다.**
3. **맥락을 고른다.** 배경이 모드를 따라가면 `default`/`inverse`, 모드와 무관하게 진하거나 연하면 `fixed-deep`/`fixed-pale`.
4. **그룹을 고른다.** 본문은 `inner/neutral/*`. 색 그룹 잉크는 아이콘·그래픽에 쓴다. 면이 `brand` 라고 글자가 `brand` 일 필요는 없다.
5. 권장 기준: 본문 4.5, 큰 글자·아이콘 3.0 (`base` 기준). 위반선이 아니다 — 최종 판단은 화면을 보고 한다. 수치는 반올림하지 않는다(4.47 은 미달). `low`~`lowest` 는 의도적으로 약한 단계.

하나의 토큰으로 모든 배경을 덮지 않는다. 네 맥락 모두 읽기 어려우면 그 서브트리를 한쪽 모드로 고정하는 것을 검토한다. **검증에서 대비 미달은 위반이 아니라 "권장 미달"이다** — 그룹이 다른 것도 위반이 아니다. 수치만 맞추려고 같은 자리를 반복해서 고치지 않는다.

### icon-frame의 positive/negative

| 서브레이어 | 규칙 |
|---|---|
| `positive` | 텍스트와 동일 — `inner`, 실제 배경과의 대비로 고름 |
| `negative` | `inner`를 절대 안 씀 — 부모의 `surface`를 그대로 따라감 (배경을 오려내는 넉아웃) |

`negative`는 부모가 불투명이면 부모와 완전히 같은 `surface`, 반투명이면 같은 그룹의 불투명 면(`interactive/{변이}/surface/default` 또는 `surface/{그룹}/{맥락}/base`), 그것도 없으면 `surface/neutral/default/base`로 폴백. 근사가 합성 배경과 맞지 않는 자리는 위반이 아니라 확인 대상이다. **판단은 항상 부모 기준**이지 자기 자신의 바인딩을 거꾸로 근거로 쓰지 않는다. 평소 숨김 상태(`visible: false`)로 있어도 값은 항상 맞아야 한다.

### 모드(테마)와 서브트리 오버라이드

`color-semantic`은 여러 모드(명도 × 브랜드)를 갖는다. **모드는 화면 전체 단위가 아니라 노드/서브트리 단위로 지역 오버라이드될 수 있다** — 화면 전체가 `light/sky-blue`여도 특정 버튼 인스턴스만 `light/rikaride`으로 개별 지정돼 있으면 그 버튼(과 자손)만 다른 색으로 보인다. 명시적 지정이 없으면 가장 가까운 상위 노드의 모드를 물려받는다.

영역을 모드와 무관하게 고정할 때 기준은 **그 안에 컴포넌트 인스턴스가 있는가** 하나다.

| 고정할 대상 | 방법 |
|---|---|
| 레이어 하나 (사진 위 글자, 아이콘, 선, 컴포넌트가 없는 면) | `fixed-deep`·`fixed-pale` 토큰 |
| 컴포넌트 인스턴스가 들어 있는 영역 | 그 영역(고정된 면 자체)에 모드 지정. 브랜드도 같이 고정되니 지금 화면과 같은 브랜드의 모드를 고른다 |

다크 모드의 `surface`·`stroke`·`inner` 는 맥락을 맞바꾸는 것에서 출발한다 — 다크 `default` 는 라이트 `inverse` 와, 다크 `inverse` 는 라이트 `default` 와 **같은 톤**이다. 단계 값은 조정할 수 있지만 톤이 갈라지면 안 된다. `fixed-*` 는 라이트 값에서 출발하고, 조정하더라도 톤(진함·연함)은 라이트와 같아야 한다.

### 색상 치트시트

| 만들려는 것 | 토큰 |
|---|---|
| CTA/폼 제출 버튼 | `interactive/primary/*` |
| 보조/테두리 버튼 | `interactive/secondary/*`, `interactive/outline/*` |
| 배경 없는 텍스트 버튼 | `interactive/ghost/*` |
| 삭제/위험 액션 | `interactive/*-destructive/*` |
| 버튼 눌림 효과 | `state/pressed/{on-light|on-dark}` — 앱 기본 면이면 `on-light`, 반대 톤 면이면 `on-dark` |
| 브랜드 대표색 면 위 눌림 효과 | `state/pressed/on-brand` |
| 누를 수 있는 카드·리스트 행 (색 상태 없음) | `surface`·`stroke`·`inner`, 눌림은 `state/pressed/*` |
| non-interactive 그릇 전체의 비활성 | 가장 바깥 레이어 opacity 에 `state/disabled/global` |
| 상호작용 컴포넌트 안 보조 텍스트 | `interactive/{변이}/inner/subtle` |
| 화면 배경, 시트·카드 | `surface/neutral/default/*` |
| 명도가 반전된 면 | `surface/neutral/inverse/*` |
| 브랜드·피드백 톤 정적 면 | `surface/{brand|success|error|warning|info}/{맥락}/*` |
| 떠 있거나 덧칠하는 반투명 면 (스낵바, GNB, 다이얼로그, 구분 블록) | `surface/{그룹}/{맥락}/{high|higher|highest}` |
| 모드와 무관하게 늘 진하거나 연한 면 | `surface/{그룹}/fixed-deep|fixed-pale/*` |
| 테두리·구분선 | `stroke/{그룹}/{맥락}/*` |
| 본문 텍스트 | `inner/neutral/{맥락}/{스케일}` — 실제 배경과의 대비로 |
| 아이콘·그래픽 | `inner/{그룹}/{맥락}/{스케일}` |
| 모드와 무관한 배경(사진·지도) 위 텍스트·아이콘 | `inner/{그룹}/fixed-deep|fixed-pale/*` |
| 고정된 영역 안의 컴포넌트(버튼 등) | 그 영역에 모드 지정 |
| 정적 컴포넌트의 색 | `surface`·`stroke`·`inner` |
| 상호작용 컴포넌트 안 그래픽 요소(knob 등) / 대비 부적절 | 그 레이어만 `surface`·`stroke`·`inner` 차용 |
| 색 배경 위 아이콘 "구멍" | `icon-frame`의 `negative` |

---

## 6. 간격·radius·아이콘 크기

*(원문: `shape-token-rule.md`)*

```
shape-primitive  ← spacing/radius/size 숫자 스케일
shape-semantic   ← 의미 있는 이름으로 재포장. shape-primitive를 참조
```

**컴포넌트에는 `shape-semantic`을 쓴다.**

### 숫자 스텝보다 의미 기반 토큰을 먼저 확인

| 패턴 | 의미 |
|---|---|
| `spacing/surface-margin/base` | 다이얼로그·카드 등 부모 컨테이너의 기본 패딩 |
| `spacing/viewport-margin/side/base` | 화면 좌우 끝 ~ 콘텐츠 사이 안전 여백 |
| `spacing/viewport-margin/top·bottom/base` | 화면 상단/하단 ~ 콘텐츠 사이 안전 여백 |
| `radius/surface-radius/base` | 부모 컨테이너의 기본 모서리 |
| `radius/surface-radius/low` | 부모 컨테이너 내부 하위 요소의 모서리 |

새 다이얼로그/카드/바텀시트처럼 "컨테이너 안에 컨테이너"가 있는 구조를 만들 땐 숫자 스텝을 바로 고르지 말고 이 의미 기반 토큰부터 확인한다.

용도가 명시 안 된 나머지는 그냥 숫자 눈금 — 필요한 크기에 가장 가까운 스텝을 쓴다. `radius-full`은 완전한 pill/원형 전용.

### 아이콘 크기는 별도 컬렉션 (`icon-frame`)

`shape-*`가 아니라 별도 `icon-frame` 컬렉션으로 관리한다. `icon-size/{text-pair}`(아이콘 자체 크기)와 `icon-line-height/{text-pair}`(감싸는 프레임 높이) 두 계열이 있고, `size-1`, `size-2`... 모드를 갖는다. **소비는 항상 `icon-frame-*` 컴포넌트를 통해서만** 한다 — 자세한 건 [§7](#7-아이콘-배치하기).

---

## 7. 아이콘 배치하기

*(원문: `icon-frame-rule.md`)*

**아이콘을 그냥 넣지 않는다. 항상 `icon-frame-*` 5개 중 하나를 놓고, 아이콘은 그 인스턴스의 instance swap 속성으로 바꾼다.** 버튼 같은 복합 컴포넌트의 아이콘 자리도 마찬가지로 `icon-frame-*` 인스턴스를 담는다.

### 2층 구조

```
icon-frame-body (예)
├─ height: icon-line-height/body 적용        ← body 텍스트 line-height와 같은 높이
└─ icon-wrap
    └─ width/height: icon-size/body 적용      ← 아이콘 자체의 시각 크기
```

`icon-line-height/{display|headline|body|magazine}` 은 `typeface-semantic`의 `line-height/{카테고리}/{스텝}` 을 참조한다. 그래서 프레임 높이가 짝지어진 텍스트의 line-height와 항상 같다. (`standalone` 은 짝지어진 텍스트가 없어서 size 스케일을 참조한다)

### 컴포넌트 선택 (텍스트 카테고리 매칭)

| 컴포넌트 | 쓰는 상황 |
|---|---|
| `icon-frame-display` | `display` 텍스트 옆 |
| `icon-frame-headline` | `headline` 텍스트 옆 |
| `icon-frame-body` | `body` 텍스트 옆 |
| `icon-frame-magazine` | `magazine` 텍스트 옆 |
| `icon-frame-standalone` | 텍스트 없이 단독(아이콘 버튼 등) |

굵기는 상관없다 — `body/regular/b3` 옆이든 `body/bold/b3` 옆이든 `icon-frame-body`.

### 모드 선택 (텍스트 스텝 매칭)

인스턴스에 `icon-frame` 컬렉션의 모드 `size-N` 을 적용한다. **N = 짝지어진 텍스트의 스텝 번호.** `body/regular/b3` 옆이면 `size-3`, `headline/bold/h3` 옆이면 `size-3`. 그래야 프레임 높이가 그 텍스트의 line-height와 같아진다.

**그 카테고리에 없는 스텝의 모드는 쓰지 않는다.** body는 b6까지만 있으므로 `icon-frame-body`에 `size-7`~`size-9`를 적용할 수 없다 (값이 0). 코드에서는 `[data-icon-scale="size-N"]`로 건다.

### 자주 하는 실수

| 실수 | 올바른 처리 |
|---|---|
| SVG를 `icon-frame` 없이 직접 배치 | 항상 `icon-frame-*`를 통과 |
| body 텍스트 옆에 `icon-frame-headline` | 텍스트 카테고리와 동일한 icon-frame |
| 텍스트 없는 아이콘에 `icon-frame-body` | `icon-frame-standalone` |
| 모드가 텍스트 스텝과 다름 (b6 옆에 size-3) | 스텝 번호 일치 |
| 카테고리에 없는 스텝의 모드 (`icon-frame-body`에 size-9) | 존재하는 스텝 범위 안에서만 |
| Button 슬롯에 raw SVG 삽입 | 슬롯엔 `icon-frame-*` 인스턴스 |

---

## 8. 텍스트 스타일 적용하기

*(원문: `typography-token-rule.md`, `text-style-rule.md`)*

```
typeface-primitive  ← 폰트 크기 원자 스케일
typeface-semantic   ← font-family / font-weight / font-size / line-height
Text Style (레거시)  ← 디자이너가 실제로 레이어에 적용하는 완성 프리셋
```

**레이어에는 typeface-semantic 변수를 직접 걸지 말고, Text Style을 통째로 적용한다.**

### 이름 규칙: `{카테고리}/{굵기}/{스텝}`

굵기가 **가운데** 세그먼트로 들어간다 — `display/bold/d1`, `body/medium/b3`. 카테고리는 `display` > `headline` > `body` > `magazine`(에디토리얼 느낌 세리프체). 스텝은 숫자가 작을수록 큼(1이 가장 큼).

### 카테고리마다 지원하는 굵기가 다르다 (비대칭)

| 카테고리 | 실제 존재하는 굵기 |
|---|---|
| `display` | `bold`만 |
| `headline` | `bold`만 |
| `body` | `regular` / `medium` / `bold` |
| `magazine` | `regular` / `bold` |

**"헤드라인에 medium이 있겠지"처럼 가정하지 않는다.** 필요한 굵기가 없는 카테고리면 디자이너에게 추가가 필요한지 먼저 확인 — 임의로 다른 카테고리 값을 가져다 쓰지 않는다.

### letter-spacing도 빠짐없이 적용

`letter-spacing`은 변수가 아니라 Text Style 안의 리터럴이다. 기본값(커스텀 자간 없음)이더라도 **5개 속성(family/weight/size/line-height/letter-spacing) 전부를 빠짐없이 개별 적용**한다 — 생략하면 자간이 지정된 스타일에서 그 값을 놓친다.

### 브랜드 × 언어 모드

`typeface-semantic`의 모드는 색상처럼 "브랜드 무드"가 아니라 **"어느 브랜드 앱 + 어느 언어권"** 조합이다. **`language` 컬렉션([§10](#10-다국어-문자열))과 동기 전환** 해야 한다 — 앱 언어가 바뀌면 문자열(`language`)과 폰트(`typeface-semantic`) 모드를 동시에 바꾼다. 하나만 바뀌면 텍스트 내용과 폰트가 어긋난다.

### 텍스트 치트시트

| 하고 싶은 것 | 참고 |
|---|---|
| 기존 화면과 같은 텍스트 | 역할에 맞는 `{카테고리}/{굵기}/{스텝}` Text Style을 통째로 적용 |
| 본문 강조 | `body`는 세 굵기 다 있으니 그중 선택 |
| 헤드라인을 더 얇게/굵게 | 안 됨 — `headline`은 `bold` 하나뿐, 디자이너 확인 필요 |
| 에디토리얼/잡지 느낌 | `magazine/{regular|bold}/m{1-3}` |
| 아이콘과 나란히 쓰는 텍스트 | [§7](#7-아이콘-배치하기) — 같은 카테고리의 `icon-frame-*` |

---

## 9. 그림자·블러·리퀴드 글라스

*(원문: `effect-token-rule.md`)*

그림자·블러는 Figma Style이 아니라 **`effects` Variable 컬렉션**으로 관리된다.

### 그림자 — 5필드를 각각 개별 적용

패턴: `shadow/{low|mid|high}/drop-shadow/{position-x|position-y|blur|spread|color}`. 강도가 높을수록 더 "떠 있는" 느낌(모달, 플로팅 버튼 등)에 쓴다. 5개 필드를 각각 개별 값으로 적용 — 나중에 하나만 바뀌어도 대응할 수 있게 분리 유지.

`color` 필드는 **`color-semantic`의 `styles/shadow/*`를 참조**한다 (`color-token-rule.md` §2-1). primitive를 직접 참조하지 않는다 — `effects` 컬렉션엔 모드 축이 없어서 직접 걸면 다크모드에서 그림자 색이 안 바뀐다. 코드로 옮길 때 **모드 축이 다른 컬렉션으로 넘어가는 alias는 리터럴로 펼치지 말고 참조(`var()`)로 유지**한다. 다크모드 그림자는 색을 뒤집지 않고 **어두운 색 그대로 알파만 올린다** — 뒤집으면 글로우가 된다.

### 블러 — uniform vs progressive

- **uniform**: 영역 전체에 똑같은 세기 (`background-blur/uniform/{강도}/blur`).
- **progressive**: 시작(`start`)에서 끝(`end`)으로 점점 변하는 그라디언트 블러. 고정 헤더/바텀바 아래로 스크롤되며 서서히 흐려지는 효과 전용일 가능성이 높다. 단일 `blur()`로는 재현 안 됨 — 웹은 `mask-image` 그라디언트 조합, iOS/Android는 네이티브 variable blur API나 커스텀 쉐이더 필요.

### 리퀴드 글라스 — 표준 CSS로 재현 불가

`effects/liquid-glass/*`의 7개 속성(`light-angle`, `light-intensity`, `refraction`, `depth`, `dispersion`, `frost`, `splay`)은 **표준 CSS `backdrop-filter: blur()`로 재현 불가능**하다. Web은 SVG 필터/WebGL, iOS는 Metal 쉐이더(또는 iOS 26+ 네이티브 Liquid Glass API), Android는 `RenderEffect`/AGSL이 필요하다. 정확한 재현이 부담되면 `frost`만 blur로 근사하고 나머지는 디자인팀과 폴백 범위를 협의한다.

### 그라디언트 — 이것만 Variable이 아니라 색상 Style (원문: `effect-token-rule.md` §5)

`gradient/{overlay|solid}-{up|down|left|right}` 색상 스타일. 그라디언트는 각도·스톱 위치를 포함한 페인트 전체라 변수 하나에 담을 수 없어서, 스타일로 두고 **스톱의 색만 변수를 참조**한다.

- `overlay` = 반투명 → 투명(아래가 비쳐 보임), `solid` = 불투명 서피스 색 → 투명(아래를 완전히 덮다가 풀림). 방향은 **불투명한 쪽이 붙는 곳**이다.
- 용도: 스크롤 콘텐츠가 고정 헤더·바텀바 밑으로 들어갈 때 잘린 느낌 없이 서피스로 녹인다. `background-blur/progressive`와 같은 자리에 함께 쓰인다 — 그쪽은 흐림, 이쪽은 색.
- 스톱 색은 `styles/gradient/{overlay|solid|transparent}`를 참조한다.
- **투명 끝점을 아무 투명색으로 두지 않는다.** 알파가 0이어도 RGB는 보간에 영향을 준다 — 흰색에서 "투명한 검정"으로 가면 중간이 회색으로 탁해진다. 사라지는 쪽은 진한 쪽과 같은 색조의 투명값이어야 한다.
- **이름에 명도(`light`/`dark`)를 넣지 않는다.** 모드에 따라 색이 바뀌는 하나의 세트다.

---

## 10. 다국어 문자열

*(원문: `language-rule.md`)*

`language` 컬렉션은 엄밀히는 "디자인 토큰"이 아니라 i18n(국제화) 문자열 컬렉션이다. **텍스트 노드 / text prop에만** 적용한다 — 색상, 크기 등 다른 속성엔 못 쓴다.

**변수 하나 = 번역 항목 하나.** 변수 이름은 i18n 플러그인이 `{섹션 경로}/{레이어}/{6자 ID}` 로 붙인다 (예: `section-section-2/layer-frame-3/jpb5aj` → Korean "텍스트 노드", English "text node"). 이름을 직접 짓거나 바꾸지 않는다. 앞의 경로는 섹션을 정리하면 바뀔 수 있고, **끝의 6자 ID 는 바뀌지 않아 코드의 번역 키로 쓰인다.**

텍스트 노드에 문자열을 하드코딩하지 않고 이 변수를 참조로 바인딩하면, 모드(=언어)를 바꿀 때 표시 문자열이 자동으로 바뀐다 — 섹션이나 페이지 단위로 모드를 바꿔 언어별 레이아웃(문자 길이 차이)을 Figma 안에서 바로 검토할 수 있다.

**새 UI 문자열을 추가할 때 — i18n 플러그인으로:**
1. 텍스트 레이어 선택 → "토큰 생성하기"
2. 기본 모드 값은 레이어 텍스트로 채워져 있다. **나머지 언어 모드에도 값을 채운다** — 비우면 `--`(미번역)로 남는다
3. "생성 및 적용" → 변수 생성과 텍스트 노드 연결이 한 번에 된다

변수 생성·연결은 플러그인으로 하거나 Claude 에게 맡긴다. Claude 는 `language-rule.md` §9 데이터 계약대로 플러그인과 같은 기록(key 레이어 등)을 남긴다. 이름 변경·삭제는 플러그인으로 한다. 이미 있는 변수의 **값**은 변수 패널이나 Claude 로 고쳐도 된다.

**번역 테이블** — 화면 옆에 붙이는 `i18n-table` 은 원본과 같은 변수에 바인딩된 복사본이다. 하드코딩 검사(`/figma-audit`)에서 빠지고, 헤더 텍스트는 바인딩하지 않아도 된다.

**앱 언어를 전환하는 로직을 만들 때는 `typeface-semantic`([§8](#8-텍스트-스타일-적용하기))과 항상 동시에 전환한다** — 문자열만 바뀌고 폰트가 안 바뀌면(또는 반대) 어긋난다.

값은 CSS 변수로 방출하지 않는다 — 언어별 i18n 파일(키 = 6자 ID)로 추출해서 i18n 라이브러리로 소비한다. `--` 인 값은 누락으로 보고된다.

---

## 11. 자주 하는 실수 모음

이 중 이름·섹션·3계층·변수 바인딩·하드코딩 텍스트에 관한 실수는 `/figma-audit` 이 노드 단위로 찾아준다. 색상 역할 선택이나 아이콘 스텝 매칭처럼 의도를 판단해야 하는 것은 사람이 확인한다.

| 영역 | 실수 | 올바른 처리 |
|---|---|---|
| 컴포넌트 구조 | 단독 사용 불가하다고 스켈레톤이라 추론 | 빌딩블록 여부와 레이어는 별개 질문 ([§1](#1-컴포넌트-만들기--3계층-구조)) |
| 컴포넌트 구조 | 재사용 빈도가 높다고 Foundations로 이동 | 정체성 있으면(버튼 등) 자기 페이지 유지 |
| 섹션 | 컴포넌트 이름을 바꾸고 섹션 이름은 그대로 둠 | 섹션 이름 = 컴포넌트 이름 ([§4](#4-섹션-정리하기)) |
| 섹션 | 잘 안 보이는 컴포넌트 밑에 배경용 섹션을 깖 | 섹션 대신 배경 frame — 이름 없는 섹션은 sub-group 으로 읽힘 |
| 섹션 | 공유하지 않는 템플릿·패턴을 한 sub-group 에 모음 / 빌딩블록 섹션에 컴포넌트 이름을 붙임 | sub-group 은 빌딩블록 공유 묶음, 빌딩블록 섹션 이름은 항상 `building-block` |
| 재선언 | 재선언된 속성인데 중첩 스켈레톤 그룹을 직접 수정 | 항상 템플릿 자체(최상단) 값만 조작 ([§3](#3-스켈레톤-속성을-템플릿이-다시-써야-할-때)) |
| 색상 | 면의 상태를 보고 글자도 같을 거라 가정 | 세 역할(surface/stroke/inner)을 독립적으로 판단 |
| 색상 | `surface`·`stroke` 에서 `default` 를 스케일 이름으로 찾음 | `surface`·`stroke` 의 기본값 이름은 `base` (`default` 는 그룹 이름) |
| 색상 | 면이 `brand` 라서 글자도 `brand` 로 맞춤 / 반투명 면 위 글자를 면 색만 보고 고름 | 글자는 뒤 배경까지 합성한 실제 배경과의 대비로, 모든 모드에서 |
| 색상 | `icon-frame`의 `negative`에 `inner/*`를 바인딩 | `negative`는 부모의 `surface`를 따라감 |
| 간격 | 숫자 스텝부터 고름 | `surface-margin`/`viewport-margin` 같은 의미 기반 토큰부터 확인 |
| 아이콘 | SVG를 `icon-frame` 없이 직접 배치 | 모든 아이콘은 `icon-frame-*`를 통과 |
| 아이콘 | `icon-frame` 모드가 텍스트 스텝과 다름 | 스텝 번호 일치 |
| 텍스트 | 없는 굵기를 있다고 가정 (헤드라인에 medium 등) | 카테고리별 실제 지원 굵기부터 확인 |
| 텍스트 | letter-spacing이 기본값이라 생략 | 5속성 전부 명시적으로 적용 |
| 효과 | `backdrop-filter: blur()`만으로 리퀴드 글라스 재현 시도 | 7개 속성은 표준 CSS로 불가 — 플랫폼별 대안 필요 |
| 다국어 | 텍스트 노드에 문자열 하드코딩 | i18n 플러그인 또는 Claude(`language-rule.md` §9)로 `language` 변수 생성·연결 |
| 다국어 | 변수를 변수 패널에서 직접 만들거나 이름을 바꿈 | 생성·연결은 플러그인으로, 이름은 플러그인이 관리 |
| 다국어 | 새 언어 추가 시 일부 변수에 값을 안 채움 (`--` 로 남김) | 모든 변수 × 모든 언어 모드에 값 채우기 |
| 다국어 | language 모드만 바꾸고 typeface-semantic은 안 바꿈 | 두 컬렉션 동시 전환 |

---

## 12. 부록 — 룰북 원문 대응표

이 문서의 각 섹션이 실제로 근거하는 룰북 파일. 내용이 궁금하거나 이 문서와 어긋나 보이면 원문을 확인한다.

| 이 문서 섹션 | 룰북 원문 |
|---|---|
| 1. 컴포넌트 만들기 | `docs/design-system-rule/component-structure-rule.md` |
| 2. 이름 붙이기 | `docs/design-system-rule/component-structure-rule.md` §3, `docs/design-system-rule/design-to-dev-rule.md` §1~4 |
| 3. 스켈레톤 속성 재선언 | `docs/design-system-rule/design-to-dev-rule.md` §5 |
| 4. 섹션 정리하기 | `docs/design-system-rule/section-layout-rule.md`, 주석 달기는 `docs/design-system-rule/annotation-rule.md` |
| 5. 색상 | `docs/design-system-rule/color-token-rule.md` |
| 6. 간격·radius·아이콘 크기 | `docs/design-system-rule/shape-token-rule.md` |
| 7. 아이콘 배치 | `docs/design-system-rule/icon-frame-rule.md` |
| 8. 텍스트 스타일 | `docs/design-system-rule/typography-token-rule.md`, `docs/design-system-rule/text-style-rule.md` |
| 9. 그림자·블러·리퀴드 글라스 | `docs/design-system-rule/effect-token-rule.md` |
| 10. 다국어 문자열 | `docs/design-system-rule/language-rule.md` |

값(토큰의 실제 hex/숫자)은 `tokens/design-tokens.json` 또는 Figma 변수 패널에서 조회한다 — 이 문서에도 룰북에도 없다.
