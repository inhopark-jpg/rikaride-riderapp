# Liquid Glass 지원 여부 관리 규칙 (공통 룰북)

> **다루는 것** — 최상위 `liquid-glass` 컬렉션 (supported / unsupported 모드). 플랫폼별 유리 효과 지원 여부 스위치.
> **관련 룰북** — `effect-token-rule.md` §3 (유리 효과의 시각적 정의, 별개 컬렉션), `color-token-rule.md` §10 (서브트리 오버라이드)
> **소비 제약** — 컴포넌트의 `liquid-glass` 속성값에 바인딩. 앱/화면 루트에 `[data-liquid-glass]` 로 서브트리 오버라이드.

**값이 아니라 의미와 사용 규칙만 다룹니다.** 유리 효과의 실제 시각적 정의(light-angle, refraction, frost 등 7개 속성) 는 `effect-token-rule.md` §3 에 있습니다. 이 룰북은 그 효과를 **플랫폼별로 켜고 끄는 스위치 컬렉션** 에 대한 규칙입니다.

> **적용 범위 / 전제**: 새 Figma 파일에 최상위 `liquid-glass` 컬렉션(effects 컬렉션 안의 `liquid-glass/*` 와 별개)이 있고, `supported` / `unsupported` 두 모드를 가질 때 유효합니다. 이름이 다르면 이 룰북을 적용하지 마세요.

## 0. 이 컬렉션은 `effects/liquid-glass/*` 와 **별개** 다

혼동 주의:

- **`effects/liquid-glass/*`** — 유리 효과의 시각적 정의 (light-angle, light-intensity, refraction, depth, dispersion, frost, splay 등 7개 물리 속성). `effect-token-rule.md` §3 에서 다룸.
- **`liquid-glass` (최상위 별도 컬렉션)** — 그 효과를 이 플랫폼/화면에서 켤지 말지 결정하는 **지원 여부 스위치**. 이 룰북에서 다룸.

두 컬렉션은 서로 alias 참조하지 않는 별개 층입니다. 개념적으로는 관련되지만 구조적으로 독립적이라, 각각의 사용 규칙도 다릅니다.

## 1. 체크리스트

1. 최상위 `liquid-glass` 컬렉션이 존재하는지 확인한다.
2. 모드가 `supported` / `unsupported` 두 개인지 확인한다.
3. liquid-glass 효과를 쓰는 컴포넌트에 `liquid-glass` 속성이 있고, 그 속성값에 이 컬렉션의 토큰이 참조로 바인딩되어 있는지 확인한다.

## 2. 모드의 의미

| 모드 | 언제 쓰나 |
|---|---|
| `supported` | liquid-glass 효과가 하드웨어·OS 레벨에서 지원되는 플랫폼용 (예: iOS 26+) — 실제 유리 효과 렌더링 |
| `unsupported` | 지원되지 않는 플랫폼용 (예: 대다수 Android, 낮은 iOS 버전, 기본 웹 브라우저) — 대체 스타일로 폴백 |

## 3. 소비 방식 — 컴포넌트 속성값 바인딩

이 컬렉션의 토큰들은 **liquid-glass 를 쓰는 컴포넌트의 `liquid-glass` 속성값에 바인딩** 됩니다. 컴포넌트가 유리 효과를 실제로 그릴지 폴백을 그릴지가 이 속성값에 의해 결정되고, 그 속성값은 이 컬렉션의 현재 모드에서 옵니다.

Figma 상에서의 흐름:
1. 컴포넌트에 `liquid-glass` 라는 속성 슬롯이 있다 (variant 결정용 boolean-ish)
2. 그 슬롯에 이 컬렉션의 토큰이 참조로 걸린다
3. 사용자가 이 컬렉션의 모드를 `supported` ↔ `unsupported` 로 바꾸면
4. 참조하던 속성값이 바뀌고 → 컴포넌트가 자기 variant (효과 적용 / 폴백) 를 자동 선택

즉 사용자가 컴포넌트 인스턴스마다 `liquid-glass` 를 켜고 끄는 게 아니라, **화면 단위로 이 컬렉션의 모드를 지정하면 하위 컴포넌트가 일관되게 반응** 합니다.

## 4. 코드에서의 적용

앱/화면 루트에서 플랫폼 감지 후 서브트리 오버라이드로 모드를 설정합니다:

```
<div data-liquid-glass="supported"> ... </div>   // iOS 등
<div data-liquid-glass="unsupported"> ... </div> // Android/웹 등
```

`color-token-rule.md` §10 의 서브트리 지역 오버라이드 원칙과 같은 방식입니다. 하위 컴포넌트가 이 서브트리 안에서 자기 variant 를 자동 선택합니다.

**플랫폼 감지 예시:**
- iOS 앱: iOS 26+ 이면 supported, 아니면 unsupported
- Android 앱: 대체로 unsupported (RenderEffect 로 부분 구현 가능하다면 supported 고려)
- 웹: `CSS.supports('backdrop-filter: ...')` 등 특성 감지 후 판단. 대체로 unsupported

정확한 지원 조건은 프로젝트별로 결정합니다.

## 5. 오류 패턴

| 오류 | 올바른 처리 |
|---|---|
| Android 앱인데 `supported` 모드 강제 적용 | 플랫폼 감지 로직대로 `unsupported` |
| 컴포넌트에 `liquid-glass` 속성만 만들고 `unsupported` variant 를 안 만듬 | 두 variant 모두 제공 |
| liquid-glass 효과와 무관한 컴포넌트에 이 컬렉션 참조 추가 | 이 컬렉션은 유리 효과를 쓰는 컴포넌트만 참조 |
| `[data-liquid-glass]` 를 어디에도 설정하지 않고 컴포넌트 배치 | 앱/화면 루트에서 반드시 설정 |
| `effects/liquid-glass/*` 토큰을 이 컬렉션의 대체품으로 사용 | 두 컬렉션은 별개다. `effects/liquid-glass/*` 는 시각 정의, 이 컬렉션은 스위치 |

## 6. 치트시트

| 하고 싶은 것 | 참고할 곳 |
|---|---|
| 앱이 어느 플랫폼인지에 따라 liquid-glass 켜고 끄기 | 앱 루트에 `[data-liquid-glass="supported\|unsupported"]` |
| liquid-glass 를 쓰는 새 컴포넌트 만들기 | 두 variant (supported/unsupported) 모두 제공 |
| 유리 효과의 실제 시각적 정의 | `effect-token-rule.md` §3 (별개 컬렉션) |
| 특정 화면만 다른 모드 적용 | 그 화면 루트에 서브트리 오버라이드 |
