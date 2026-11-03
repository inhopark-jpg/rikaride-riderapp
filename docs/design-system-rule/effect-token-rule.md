# Effect Token 적용 규칙

> **다루는 것** — shadow (5필드 분리) / background-blur (uniform vs progressive) / `effects/liquid-glass/*` (유리 효과 시각적 정의) / `gradient/*` 색상 스타일.
> **관련 룰북** — `color-token-rule.md` §2-1 (그림자·그라디언트 색의 출처인 `styles` 그룹), §9 (모드)
> **소비 제약** — 없음. 다만 `effects/liquid-glass/*` 는 표준 CSS 로 재현 불가, 플랫폼별 대안 필요.

**값이 아니라 의미와 사용 규칙만 다룹니다.** 실제 blur/offset 수치는 하드코딩하지 않습니다 — 프로젝트의 `design-tokens.json`이 항상 유일한 진실의 원천입니다.

> **적용 범위 / 전제**: 새 Figma 파일이 이 문서에 설명된 **컬렉션 구조와 토큰 이름(경로)까지 동일**한 토큰 라이브러리를 쓸 때 유효합니다. 파일이 바뀌면 같은 토큰 이름의 **값**(색상, 수치 등)은 달라질 수 있고 그건 정상입니다 — 값은 항상 그 프로젝트에서 새로 추출한 `design-tokens.json`을 따릅니다. 하지만 **토큰 이름 자체가 다르면**(예: `interactive/primary/bg/default` 대신 `button/main/background/base-color`) 이 룰북을 적용하지 마세요.

## 0. 그림자·블러는 Style이 아니라 Variable로 관리된다

이 프로젝트는 그림자·블러 효과의 **수치**가 Figma Style 리소스가 아니라 **`effects`라는 Variable 컬렉션**으로 관리됩니다. 각 그림자/블러의 offset, blur, spread, color가 전부 개별 **변수**로 쪼개져 있습니다.

그 변수들을 감싼 **Effect Style 리소스도 함께 존재하고, 디자이너가 레이어에 실제로 적용하는 건 그쪽입니다** (`shadow/{low|mid|high}`, `background-blur/*`, `liquid-glass/mid`). 즉 레이어 → Effect Style → `effects` 변수 → (색은) `color-semantic` 의 `styles` 그룹 순으로 참조가 이어집니다. 실제 컴포넌트 작업 시 둘 다 확인하세요.

**그라디언트는 예외적으로 Variable 이 아니라 색상(Paint) Style 로 관리됩니다** — 그라디언트는 각도·스톱 위치까지 포함한 페인트 자체라 변수 하나로 담을 수 없기 때문입니다. 색만 변수를 참조합니다 (§5).

## 0-1. 체크리스트

1. `effects` 컬렉션이 있는지 확인한다.
2. 그림자 계열(`shadow/*`)과 블러 계열(`background-blur/*`), 그리고 유리 재질 계열(`effects/liquid-glass/*`)이 각각 존재하는지 확인한다 — 셋은 완전히 다른 구현 방법이 필요하다 (§3).
3. `gradient/*` 색상 스타일이 있는지 확인한다 (§5). 이건 `effects` 컬렉션이 아니라 색상 스타일이다.
4. 그림자 색과 그라디언트 색이 `color-semantic` 의 `styles` 그룹을 참조하는지 확인한다 — `color-primitive` 를 직접 참조하면 모드 전환이 깨진다 (`color-token-rule.md` §2-1).

## 1. `shadow/{low|mid|high}/drop-shadow/{position-x|position-y|blur|spread|color}` — 단계별 그림자

패턴: `shadow/{강도}/drop-shadow/{필드}` — 강도는 낮음/중간/높음 3단계.

- **강도가 높을수록** 더 "떠 있는" 느낌을 주는 요소(모달, 플로팅 버튼 등)에 사용합니다.
- 5개 필드(`position-x`, `position-y`, `blur`, `spread`, `color`)를 **각각 개별 값으로 적용**합니다 — CSS `box-shadow` 한 줄로 조합하는 건 최종 렌더링 단계에서는 괜찮지만, 토큰을 코드에 옮길 때는 이 5개를 분리된 변수/상수로 유지해야 나중에 하나만 바뀌어도 대응할 수 있습니다.
- `color` 필드는 **`color-semantic` 의 `styles/shadow/{low|mid|high}` 를 참조하는 alias**입니다 (`color-token-rule.md` §2-1). `color-primitive` 를 직접 참조하지 않습니다 — primitive 에는 모드 축이 없어서 직접 걸면 라이트/다크 모드에서 그림자 색이 바뀌지 않습니다. 이 참조 관계를 그대로 유지하세요.
- **`effects` 컬렉션 자체에는 모드 축이 없습니다.** 그림자 색이 모드를 따라가는 것은 전적으로 `color-semantic` 쪽 모드 덕분입니다. 코드로 옮길 때 이 alias 를 리터럴 값으로 펼쳐버리면 모드 전환이 깨집니다 — **모드 축이 다른 컬렉션으로 넘어가는 alias 는 값이 아니라 참조로 내보내세요** (CSS 라면 `var()`).
- 다크모드에서 그림자 색은 라이트 값을 뒤집는 게 아니라 **어두운 색을 유지하고 알파를 올립니다** (`color-token-rule.md` §9). 뒤집으면 그림자가 아니라 글로우가 됩니다.

## 2. `background-blur/uniform/{강도}/blur` vs `background-blur/progressive/{강도}-{방향}/{start|end}`

두 가지 서로 다른 블러 축이 있습니다:

- **`uniform`**: 영역 전체에 **똑같은 세기**로 블러를 까는 단순한 방식. 필드 하나(`blur`)만 있습니다.
- **`progressive`**: 블러 세기가 **시작 지점(`start`)에서 끝 지점(`end`)으로 점점 변하는** 그라디언트 블러입니다. `-downward`/`-upward` 같은 방향 접미사가 붙어 있으면, **콘텐츠가 고정 헤더/하단바 아래로 스크롤되며 서서히 흐려지는 효과** 전용일 가능성이 높습니다.
  - `start`/`end` 값 중 하나가 0에 가깝다면 "그 지점에서는 블러가 거의 없다(선명)"는 뜻이고, 값이 클수록 그 지점에서 강하게 흐려진다는 뜻입니다 — 두 값을 비교해서 방향(위로 갈수록 흐려지는지, 아래로 갈수록 흐려지는지)을 판단하세요.
  - 구현 시 단일 `blur()` 함수 하나로는 재현이 안 됩니다. 웹은 `mask-image` 그라디언트와 `backdrop-filter`를 조합하거나 여러 겹의 blur 레이어를 쌓아야 하고, iOS/Android는 네이티브 progressive/variable blur API(또는 커스텀 쉐이더)가 필요합니다.

## 3. `effects/liquid-glass/{강도}/glass/{property}` — 표준 CSS로 재현 불가능한 유리 재질 속성

이 그룹은 **단순 blur가 아니라, 실제 유리 재질의 물리적 특성을 흉내 내는 다중 속성 세트**입니다:

| 필드 | 의미(일반적인 유리 재질 파라미터) |
|---|---|
| `light-angle` | 유리 표면에 비치는 하이라이트의 방향(각도) |
| `light-intensity` | 그 하이라이트의 밝기 |
| `refraction` | 유리 뒤 콘텐츠가 굴절되어 보이는 정도 |
| `depth` | 유리의 "두께감" |
| `dispersion` | 빛이 분산되는(색이 갈라져 보이는) 정도 |
| `frost` | 서리 낀 것처럼 불투명해지는 정도 |
| `splay` | 굴절/왜곡이 퍼지는 범위 |

**이 7개 속성은 CSS `backdrop-filter: blur()`나 표준 `box-shadow`로 재현할 수 없습니다.** 실제로 구현하려면:
- **Web**: SVG 필터(`feDisplacementMap`, `feSpecularLighting` 등)를 조합한 커스텀 필터 스택, 또는 WebGL/Shader 기반 구현이 필요합니다. `backdrop-filter: blur()`만으로는 `frost`(뿌옇게) 정도만 근사 가능하고, `refraction`/`dispersion`/`light-angle` 등은 구현되지 않습니다.
- **iOS**: Metal 쉐이더 또는 `UIVisualEffectView` 커스터마이징으로 근사. iOS 26+ 네이티브 Liquid Glass API가 있다면 그쪽을 우선 검토합니다.
- **Android**: `RenderEffect`/커스텀 `Shader`(AGSL) 기반 구현이 필요합니다.

**단순 근사만 필요하다면 `frost` 값만 blur 세기로 변환해서 쓰고, 나머지 속성은 디자인팀과 "폴백을 어디까지 허용할지" 먼저 협의**하는 걸 권장합니다 — 정확한 재현을 시도하다 개발 리소스를 과도하게 쓰지 않도록 주의하세요.

## 4. 기타 컬렉션 (이 룰북 범위 밖, 참고용)

- **`icon-frame`**: `icon-frame-rule.md`에서 다룹니다(텍스트-아이콘 짝 시스템).

## 5. `gradient/{overlay|solid}-{up|down|left|right}` — 콘텐츠를 서피스로 녹이는 그라디언트

**이것만 Variable 이 아니라 색상(Paint) Style 입니다.** 그라디언트는 각도와 스톱 위치를 포함한 페인트 전체라 변수 하나에 담을 수 없어서, 스타일로 두고 **스톱의 색만 변수를 참조**합니다.

이름은 `{종류}-{방향}` 2부분입니다.

| 세그먼트 | 값 | 뜻 |
|---|---|---|
| 종류 | `overlay` | 반투명에서 투명으로. 아래 콘텐츠가 비쳐 보입니다 |
| | `solid` | 불투명한 서피스 색에서 투명으로. 아래 콘텐츠를 완전히 덮다가 풀립니다 |
| 방향 | `up` / `down` / `left` / `right` | 불투명한 쪽이 **어디에 붙는가**. `down` 은 위가 진하고 아래로 사라집니다 |

- **용도**: 스크롤되는 콘텐츠가 고정 헤더·바텀바·측면 경계 밑으로 들어갈 때 잘린 느낌 없이 서피스로 녹여 없애는 것. `background-blur/progressive`(§2)와 같은 자리에 함께 쓰이는 경우가 많습니다 — 그쪽은 흐림, 이쪽은 색입니다.
- **스톱 색은 `color-semantic` 의 `styles/gradient/*` 를 참조합니다** (`color-token-rule.md` §2-1):

| 토큰 | 쓰이는 자리 |
|---|---|
| `styles/gradient/overlay` | `overlay-*` 의 진한 쪽 끝 |
| `styles/gradient/solid` | `solid-*` 의 불투명한 쪽 끝 |
| `styles/gradient/transparent` | 양쪽 공통, 사라지는 쪽 끝 |

- **투명 끝점을 아무 투명색으로 두지 마세요.** 투명도가 0이어도 RGB 값은 보간에 영향을 줍니다 — 흰색에서 "투명한 검정"으로 가면 중간이 회색으로 탁해집니다. 사라지는 쪽은 **진한 쪽과 같은 색조의 투명값**이어야 합니다. `styles/gradient/transparent` 가 모드마다 색조를 맞춰주는 이유입니다.
- **이름에 명도(`light`/`dark`)를 넣지 않습니다.** 이 스타일들은 모드에 따라 색이 바뀌는 하나의 세트입니다. 모드와 무관하게 항상 같은 색이어야 하는 그라디언트가 생기면 그때 별도 이름으로 구분합니다.
- 코드로 옮길 때는 스톱 색을 리터럴로 펼치지 말고 참조로 유지하세요 (§1 의 마지막 항목과 같은 이유).

## 6. 치트시트

| 하고 싶은 것 | 참고할 곳 |
|---|---|
| 카드/모달이 떠 있는 느낌 | `shadow/{low|mid|high}/drop-shadow/*`, 5개 필드 개별 적용 |
| 배경 전체를 균일하게 흐리게 | `background-blur/uniform/*/blur` |
| 헤더/바텀바 아래로 콘텐츠가 서서히 흐려지는 효과 | `background-blur/progressive/*-{upward|downward}`, start/end 비교해서 방향 판단 |
| 헤더/바텀바 아래로 콘텐츠를 색으로 녹여 없애기 | `gradient/{overlay|solid}-{up|down|left|right}` 색상 스타일 (§5) |
| "리퀴드 글라스" 유리 재질 표현 | `effects/liquid-glass/*/glass/*` — 표준 CSS로 안 됨, §3의 플랫폼별 구현 방법 참고 |
| 그림자·그라디언트 색이 다크모드에서 안 바뀜 | `color-token-rule.md` §2-1 — `styles` 그룹을 거치는지 확인 |
