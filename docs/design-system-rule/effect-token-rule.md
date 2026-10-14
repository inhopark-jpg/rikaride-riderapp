# Effect Token 적용 규칙 (공통 룰북)

> **다루는 것** — shadow (5필드 분리) / background-blur (uniform vs progressive) / `effects/liquid-glass/*` (유리 효과 시각적 정의).
> **관련 룰북** — `liquid-glass-rule.md` (별도 스위치 컬렉션)
> **소비 제약** — 없음. 다만 `effects/liquid-glass/*` 는 표준 CSS 로 재현 불가, 플랫폼별 대안 필요.

**값이 아니라 의미와 사용 규칙만 다룹니다.** 실제 blur/offset 수치는 하드코딩하지 않습니다 — 프로젝트의 `design-tokens.json`이 항상 유일한 진실의 원천입니다.

> **적용 범위 / 전제**: 새 Figma 파일이 이 문서에 설명된 **컬렉션 구조와 토큰 이름(경로)까지 동일**한 토큰 라이브러리를 쓸 때 유효합니다. 파일이 바뀌면 같은 토큰 이름의 **값**(색상, 수치 등)은 달라질 수 있고 그건 정상입니다 — 값은 항상 그 프로젝트에서 새로 추출한 `design-tokens.json`을 따릅니다. 하지만 **토큰 이름 자체가 다르면**(예: `interactive/primary/bg/default` 대신 `button/main/background/base-color`) 이 룰북을 적용하지 마세요.

## 0. 그림자·블러는 Style이 아니라 Variable로 관리된다

이 프로젝트는 그림자·블러 효과가 Figma Style 리소스가 아니라 **`effects`라는 Variable 컬렉션**으로 관리됩니다. 각 그림자/블러의 offset, blur, spread, color가 전부 개별 **변수**로 쪼개져 있습니다. (참고: 같은 값을 감싸는 레거시 Effect Style 리소스도 Figma에 별도로 존재할 수 있습니다 — 디자이너가 레이어에 실제로 적용하는 건 그쪽일 수 있으니, 실제 컴포넌트 작업 시 둘 다 확인하세요.)

## 0-1. 체크리스트

1. `effects` 컬렉션이 있는지 확인한다.
2. 그림자 계열(`shadow/*`)과 블러 계열(`background-blur/*`), 그리고 유리 재질 계열(`effects/liquid-glass/*`)이 각각 존재하는지 확인한다 — 셋은 완전히 다른 구현 방법이 필요하다 (§3). 참고로 `effects/liquid-glass/*` 는 유리 효과의 **시각적 정의** 이고, 플랫폼별 지원 여부 **스위치** 는 별도 최상위 `liquid-glass` 컬렉션에 있다 (`liquid-glass-rule.md` 참조).

## 1. `shadow/{low|mid|high}/drop-shadow/{position-x|position-y|blur|spread|color}` — 단계별 그림자

패턴: `shadow/{강도}/drop-shadow/{필드}` — 강도는 낮음/중간/높음 3단계.

- **강도가 높을수록** 더 "떠 있는" 느낌을 주는 요소(모달, 플로팅 버튼 등)에 사용합니다.
- 5개 필드(`position-x`, `position-y`, `blur`, `spread`, `color`)를 **각각 개별 값으로 적용**합니다 — CSS `box-shadow` 한 줄로 조합하는 건 최종 렌더링 단계에서는 괜찮지만, 토큰을 코드에 옮길 때는 이 5개를 분리된 변수/상수로 유지해야 나중에 하나만 바뀌어도 대응할 수 있습니다.
- `color` 필드는 보통 `color-primitive`의 알파(투명도) 색상을 참조하는 alias입니다 — 색상 룰북(`color-token-rule.md`)의 원칙과 동일하게, 이 참조 관계를 그대로 유지합니다.

## 2. `background-blur/uniform/{강도}/blur` vs `background-blur/progressive/{강도}-{방향}/{start|end}`

두 가지 서로 다른 블러 축이 있습니다:

- **`uniform`**: 영역 전체에 **똑같은 세기**로 블러를 까는 단순한 방식. 필드 하나(`blur`)만 있습니다.
- **`progressive`**: 블러 세기가 **시작 지점(`start`)에서 끝 지점(`end`)으로 점점 변하는** 그라디언트 블러입니다. `-downward`/`-upward` 같은 방향 접미사가 붙어 있으면, **콘텐츠가 고정 헤더/하단바 아래로 스크롤되며 서서히 흐려지는 효과** 전용일 가능성이 높습니다.
  - `start`/`end` 값 중 하나가 0에 가깝다면 "그 지점에서는 블러가 거의 없다(선명)"는 뜻이고, 값이 클수록 그 지점에서 강하게 흐려진다는 뜻입니다 — 두 값을 비교해서 방향(위로 갈수록 흐려지는지, 아래로 갈수록 흐려지는지)을 판단하세요.
  - 구현 시 단일 `blur()` 함수 하나로는 재현이 안 됩니다. 웹은 `mask-image` 그라디언트와 `backdrop-filter`를 조합하거나 여러 겹의 blur 레이어를 쌓아야 하고, iOS/Android는 네이티브 progressive/variable blur API(또는 커스텀 쉐이더)가 필요합니다.

## 3. `effects/liquid-glass/{강도}/glass/{property}` — 표준 CSS로 재현 불가능한 유리 재질 속성

이 그룹은 유리 효과의 **시각적 정의** (7개 물리 속성) 를 담습니다. **이 효과를 플랫폼별로 켜고 끄는 지원 여부 스위치는 별도 최상위 `liquid-glass` 컬렉션에 있습니다** — `liquid-glass-rule.md` 참조. 두 컬렉션은 서로 alias 참조 없이 별개로 관리됩니다.

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

- **`icon-size`**: `shape-token-rule.md`에서 다룹니다(텍스트-아이콘 짝 시스템).

## 5. 치트시트

| 하고 싶은 것 | 참고할 곳 |
|---|---|
| 카드/모달이 떠 있는 느낌 | `shadow/{low|mid|high}/drop-shadow/*`, 5개 필드 개별 적용 |
| 배경 전체를 균일하게 흐리게 | `background-blur/uniform/*/blur` |
| 헤더/바텀바 아래로 콘텐츠가 서서히 흐려지는 효과 | `background-blur/progressive/*-{upward|downward}`, start/end 비교해서 방향 판단 |
| "리퀴드 글라스" 유리 재질 표현 (시각적 정의) | `effects/liquid-glass/*/glass/*` — 표준 CSS로 안 됨, §3의 플랫폼별 구현 방법 참고 |
| liquid-glass 효과를 플랫폼별로 켜고 끄기 | `liquid-glass-rule.md` (별도 스위치 컬렉션) |
