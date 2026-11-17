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

## 2026-11-17
- **color-token-rule.md** 전면 개정 (§0~§10, 번호 유지) — **Figma `color-semantic` 을 새 구조로 교체한 것을 반영.** 역할 `on-surface` → `inner`(interactive 안 포함). 그룹(`neutral`·`brand`·`success`·`error`·`warning`·`info`)과 맥락(`default`·`inverse`·`fixed-deep`·`fixed-pale`)을 세 역할이 공유하고, 면의 맥락 `elevation`·`floating`·`overlay` 는 폐기 — 면은 불투명 `base`~`lowest`(아래로 갈수록 물러남, 모든 그룹·맥락·모드에서 어두워짐)와 반투명 `high`~`highest` 로 나뉜다. `deep`·`pale` 은 밝기가 아니라 진하기라서(색 그룹의 진한 쪽은 밝을 수 있음) 맥락 이름으로 짝을 정하지 않고 대비를 잰다(§1). 다크 값은 세 역할 모두 맥락 맞바꿈(다크 `default` = 라이트 `inverse`)으로 정하고 미러링은 `interactive`·`state-overlay`·`styles` 에만 쓴다(§9, Figma 에서 불일치 0 확인). 신규 규칙: 본문 텍스트는 `inner/neutral` 우선·색 그룹 잉크는 아이콘·그래픽(§0·§5·§8), 대비 수치는 반올림하지 않음(4.47 은 미달, §5), 기준면보다 올라온 불투명 단계는 없고 floating UI 는 반투명 단계 + 그림자·stroke, 반투명 단계는 그 위 텍스트의 가독성으로 고름(§5·§9), 고정할 영역 안에 컴포넌트가 있으면 `fixed-*` 대신 그 영역에 모드 지정(§3·§10) — interactive 토큰에는 `fixed-*` 가 없어 고정된 다이얼로그 안 버튼이 다크에서 묻히는 예시가 계기 (사용자 승인 — 섹션별 승인)
- **effect-token-rule.md** §1 — 다크모드 그림자 색 "어두운 색을 유지하고 알파를 올립니다" → "두 모드 모두 같은 어두운 색을 그대로" 로 정정. 2026-11-03 에 color-token-rule.md §9 를 바꿀 때 이 문장이 남아 두 룰북이 어긋나 있었고, Figma `styles/shadow/*` 도 두 모드 같은 값임을 확인 (사용자 승인)
- **FIGMA-GUIDEBOOK.md** §5·§11 실수 표, **README.md** 라우터 설명, **TOKENS.md** 감사 절 — 위 개정을 요약·용어 교체 (사용자 승인)
- **color-token-rule.md** §2 「맥락 4종」·§9 「다크모드 값을 산출하는 방법」, **FIGMA-GUIDEBOOK.md** §5 — 맥락 맞바꿈을 "같은 값"에서 "같은 톤, 값은 출발점이고 조정 가능"으로 완화. `fixed-*` 가 라이트의 같은 톤 맥락과 같은 값이라는 문장도 삭제. 값을 다듬다 보면 단계 단위 조정이 필요하다는 사용자 판단 (사용자 승인)
- **color-token-rule.md** §1 최상위 표·§3 「최상위 선택」·§4 전체·§7·§8 3-2·5-1·§9 예외표, **FIGMA-GUIDEBOOK.md** §5 — (1) interactive 와 non-interactive 를 "누를 수 있는가"가 아니라 "색이 상태를 표현하는가"로 가르는 권장/괜찮음/비권장 판정표 신설 — 카드처럼 누를 수 있지만 색 조합이 복잡한 그릇은 non-interactive 권장, 색 상태가 있으면 상태 레이어만 interactive, 그릇 안 인스턴스는 각자 기준. (2) Figma `state-overlay` 를 `state-overlay/{상태}/{대상}` 으로 개편: `{on-light|on-dark|on-brand}/pressed` → `pressed/{on-light|on-dark|on-brand}`(이름만 변경, 바인딩 유지), 불투명도 변수 `state-overlay/disabled/global`(40%, scope OPACITY) 신설 — non-interactive 그릇 전체의 비활성 표현용. (3) `on-light`·`on-dark` 를 "모드와 무관한 배경 밝기"에서 "앱 기본 면·반대 톤 면 위(라이트 기준 이름, 다크에서 덧칠 방향이 면과 함께 바뀜)"로, `on-brand` 를 "브랜드 대표색 면 위"로 정정 — Figma 값이 원래 그렇게 되어 있었고 룰북이 어긋나 있었음 (사용자 승인)
- **color-token-rule.md** 머리말·§1 최상위 표·§3 「최상위 선택」·§4 전체·§7·§8 5-1·§9, **FIGMA-GUIDEBOOK.md** §5, **README.md** 라우터 설명 — 최상위 그룹 이름 `state-overlay` → `state` (`state/pressed/{on-light|on-dark|on-brand}`·`state/disabled/global`). Figma 에서 이름만 바꾼 것을 반영, 값·의미는 그대로. §4 끝 인용은 ghost `overlay-*` 와 이름이 겹친다는 주의 대신 interactive 의 `{상태}` 세그먼트와 구분하는 문장으로 교체 (사용자 승인)
- **FIGMA-GUIDEBOOK.md** §1 L48, **color-token-rule.md** §9 「기본 서피스를 가장 먼저 못 박는다」 — 기준이 정해진 경위("폐기됐다")와 작업 경위("기존 램프"·"추가해")를 쓴 문장을 현재 규칙만 말하는 문장으로 교체. 룰북·가이드북에는 작성 시점의 규칙만 두고 이전과의 비교·변경 경위는 CHANGELOG 에만 둔다는 사용자 기준 (사용자 승인)

## 2026-11-10
- **color-token-rule.md** §5 5번·모드 고정 조건·마지막 문단, §8 3·6·7번 — 글자·아이콘 대비를 **위반 기준에서 권장 기준으로** 낮춤. 대비 미달은 "권장 미달"로 보고하고 최종 판단은 화면을 보고 사람이 한다 — 수치와 시각 판단이 어긋나는 경우가 있고, 엄격한 위반 정의는 무한 수정 루프를 만든다는 사용자 판단 (사용자 승인 — 섹션별 개별 승인). FIGMA-GUIDEBOOK §5, GUIDEBOOK, design-reviewer·verify-design 도 같이 갱신
- **color-token-rule.md** 전면 개정 (§0~§10, 번호 유지) — **이름 구조를 `{그룹}/{역할}/{상태|스케일}` 에서 `{역할}/{그룹}/{맥락}/{스케일}` 로 바꾼 Figma 재구성을 반영.** 역할은 `surface`·`stroke`·`on-surface`, 면의 맥락은 `elevation`·`floating`·`overlay`, 글자 유형은 `default`·`inverse`·`fixed-dark`·`fixed-light`. 별도 최상위 `interactive/{변이}/{surface|stroke|on-surface}/{상태}`·`state-overlay/{on-light|on-dark|on-brand}/pressed`·`styles`. 가장 큰 변화는 **"한 레이어 = 한 그룹" 원칙 폐기** — 글자·아이콘은 면의 그룹을 따라가지 않고 **뒤 배경까지 합성한 실제 배경과의 대비**로 모든 모드에서 고르며(§5), QA 위반도 "그룹 불일치"가 아니라 "대비 미달"이다(§8). 같은 `overlay/strong` 이라도 밝은 면 위와 어두운 사진 위에서 맞는 글자가 다르다는 사용자 예시가 근거. 그 밖에: floating 은 "아래에 있는 것 위에 떠 있는 반투명 면"이고 blur·glass 는 추정 근거일 뿐 조건이 아님, `stroke/*/elevation` 은 surface 단계와 짝이 아닌 4단계, interactive 상태 `tint`·`tint-brand` → `overlay-default`·`overlay-brand`("tint 는 밝아진다는 뜻이라 거짓"), `negative` 근사가 합성 배경과 맞지 않는 자리는 위반이 아니라 확인 대상, `neutral/main-alpha`(기준 `neutral/default/600`) 램프 명시, §9 예외표의 `white/*-tint`(잠금화면·OS 위젯) 행 삭제 (사용자 승인 — 섹션별 개별 승인)
- **FIGMA-GUIDEBOOK.md** §5·실수 표, **GUIDEBOOK.md**, **README.md**, **TOKENS.md** — 위 개정의 요약·예시를 새 이름으로 갱신 (사용자 승인)
- **text-style-rule.md**·**typography-token-rule.md**·**shape-token-rule.md**·**effect-token-rule.md** 「적용 범위 / 전제」 — 예시 토큰 이름 `interactive/primary/bg/default` → `interactive/primary/surface/default`. 규칙 변경 없음 (사용자 승인)

## 2026-11-03
- **color-token-rule.md** §9 예외표 「그림자 색」과 「기본 서피스」 절 — **"어두운 색을 유지하고 알파를 올린다"를 "두 모드 모두 그대로 둔다"로 정정.** 이전 문구는 다크의 대비 수치(1.03~1.10)가 라이트(1.12~1.61)보다 낮다는 **숫자만 보고** 쓴 것이었는데, 실제로 알파를 올려보니 눈으로는 부자연스럽게 밝아졌다. 어두운 배경에서 그림자가 약한 것은 정상이고 수치로 보정할 대상이 아니다. 같은 이유로 「기본 서피스」 절의 "더 깊은 구분은 테두리나 그림자로" 를 **"테두리로"** 로 좁혔다 — 다크에서 그림자는 깊이를 벌리는 수단이 못 된다. 그림자 3개는 두 모드 모두 `neutral/dark-alpha/50·100·200` (사용자 판단, 눈으로 확인 후 직접 수정)
- **color-token-rule.md** §1 역할·§2 역할 세그먼트·§5·§9 — **반투명 역할의 접미사를 모드 동작 하나로 정리.** 이전에는 `-ghost` 가 두 가지(흰색은 모드 따라감, 색 패밀리는 고정)를 뜻하고 `-floating` 이 위치(떠 있음)를 뜻해 축이 섞여 있었다. 이제 **`-ghost` 는 모드가 바뀌어도 그대로, `-tint` 는 모드를 따라 뒤집힌다** 한 줄로 정리됐다. 변수는 이름만 바꿔(35개) 바인딩은 전부 유지 — 기존 `white/*-floating`·`black/*-floating` → `*-ghost`, 기존 `white/*-ghost` → `white/*-tint`, 색 패밀리 `*-ghost` 67개는 이미 고정이라 이름 그대로. `-floating` 이라는 이름이 실제 쓰임보다 좁았던 것이 계기 — progress-segment 트랙처럼 떠 있지 않은 자리에도 "모드와 무관하게 밝게 덮는" 성질 때문에 쓰이고 있었다. 변수 description 102개와 `tokens/audit-rules.json` 의 검사 대상도 같이 갱신 (사용자 지시)
- **color-semantic** `brand/inner/darkest` 를 전 라이트 모드 `neutral/default/950` 으로, 피드백 4계열(`error`·`info`·`success`·`warning`)의 `inner/lightest` 를 전 라이트 모드 `neutral/default/0` 으로 통일 — `light/rikaride` 만 수정되고 브랜드 6모드가 옛 값을 들고 있어 오버라이드가 모드당 4~5개씩 늘어 있었음. 통일 후 브랜드 오버라이드 수가 70/41/68/68/71/68 로 복귀 (사용자 지시)
- **color-token-rule.md** §5 — "유리 위의 텍스트·아이콘 색" 절을 정정. 이전 문구는 "`white/*-floating` 면 위의 잉크는 `white/inner/*` 가 아니다 — 이 면은 모드와 무관하게 밝으므로" 였는데 **틀렸다.** 조건은 유리가 아니라 **그 뒤 바탕**이다: 바탕이 모드를 따라가면(앱 서피스) `{그룹}/inner/*` 가 맞고(측정 3.06~21.00 전부 통과, 스낵바·다이얼로그가 실제로 이 조합), 바탕이 모드를 안 따라가면(사진·지도) 글자 색 하나로 사다리 전체를 덮을 수 없어 §10 서브트리 모드 고정으로 풀어야 한다 — `npm run tokens:audit` 의 유리×바탕 검사가 라이트에서는 투명한 끝이, 다크에서는 불투명한 끝이 깨지는 것을 15건 잡아내면서 드러남 (사용자 승인)
- **text-style-rule.md** §3 — `letter-spacing` 설명에서 시점 의존 서술("지금까지는 전부 기본값", "현재 자간을 조정해서 쓰지 않습니다")을 걷어내고, 기본값이든 아니든 5속성을 전부 명시 적용한다는 규칙만 남김. **FIGMA-GUIDEBOOK.md**·**TOKENS.md** 의 같은 문구도 함께 정리 — 룰북은 작성 시점의 상태가 아니라 언제 읽어도 성립하는 규칙이어야 하는데, "지금은 ~이다" 류는 파일이 바뀌는 순간 거짓이 되고 그걸 아무도 모른다 (사용자 지시)
- **color-semantic** `black/border-floating/*` 7개 삭제 — 전 페이지(33개, 노드 22,408개) 전수 확인 결과 사용처 0. 유리 토큰 102개의 Figma description 앞에 `[ghost]`/`[floating]` 역할 문장을 붙이고(단계별 기존 설명은 보존), description 안에 남아 있던 옛 토큰 이름 참조 3건을 현재 이름으로 정정 (사용자 지시)
- **color-token-rule.md** §1 역할·§2 역할 세그먼트·§5 `-ghost` 절·§9 예외표 — **반투명 유리를 역할 접미사로 구분.** `white` 그룹은 `bg`·`border`·`inner` 가 전부 모드를 따라가는데 `*-ghost` 만 고정이라 그룹 안에서 성질이 어긋나 있었다. 접미사는 **쓰임**을 가른다 — `-floating` 은 앱 위에 떠 있는 요소의 유리, `-ghost` 는 그 외 자리의 유리다. **모드 동작은 접미사가 아니라 그룹이 정하며**(`white/*-ghost` 만 모드를 따라가고 `white/*-floating`·`black/*-floating`·색 패밀리 `*-ghost` 는 고정), §5 에 그룹별 동작 표를 넣어 추측하지 않게 했다. non-interactive 역할이 5개에서 7개로 늘었다(`bg-floating`·`border-floating` 추가). 기존 `white/*-ghost`(밝은 유리 고정) 는 `white/*-floating` 으로, 모드를 따라가는 유리가 `white/*-ghost` 자리에 들어갔다. 쓰임은 바탕으로 갈린다 — `white/*-ghost` 배경화면·OS 표면 / `white/*-floating` 앱 콘텐츠 위에 떠 있는 것(스낵바·GNB·다이얼로그) / `black/*-ghost` 밝은 사진·지도. §5 에 유리 표와 "`-floating` 면 위의 잉크는 `white/inner/*` 가 아니다"는 단서를, §9 예외표에 "바탕은 모드와 무관한데 면은 시스템 외관을 따라가야 할 때" 행을 추가 — 잠금화면 Live Activity 가 배경화면 위에 있으면서 카드 자체는 시스템 라이트/다크를 따라가야 하는데 기존 토큰으로는 다크에서 흰 유리가 되어 맞지 않았고, 뒤집으면 스낵바·GNB 가 다크에서 사라져 둘을 한 토큰으로 못 푸는 것이 측정으로 확인됨. 변수는 **이름만 바꿔 기존 바인딩(스낵바 10 · GNB 44 · 다이얼로그 3곳)은 하나도 건드리지 않았다.** 측정상 `white/bg-ghost/lighter`(알파 800)가 iOS 실제 렌더와 일치. `black/*-ghost` 14개도 `black/*-floating` 으로 rename(사용처 29곳, 대부분 지도 마커 — 바인딩 유지). 전수 점검 결과 `-ghost` 81개 중 67개(색 패밀리)는 §9 때문에 고정이 맞아, "접미사가 모드 동작을 정한다"는 최초 문구를 사실에 맞게 정정함 (사용자 승인)
- **color-token-rule.md** §5 — "같은 그룹이면 어떤 스케일이든 정상" 뒤에 단서 추가: 그룹 일치는 대비를 보장하지 않으며, 면과 잉크를 **같은 스케일로 짝지으면 거의 항상 실패**하므로 잉크는 반대쪽 끝에서 고른다. 다크에서 `inner/lightest` 가 거의 검정, `inner/darkest` 가 거의 흰색이 되어 이름과 실제 밝기가 반대라는 점도 명시 — `npm run tokens:audit` 측정 결과 한 그룹 안 bg×inner 176조합 중 110개가 양쪽 모드 모두 본문 대비 4.5 미달이었고, 이 세션에서 사람·에이전트가 다섯 번 같은 함정에 빠졌는데 §5 기준으로는 전부 "정상"이었음 (사용자 승인)
- **color-token-rule.md** §9 — "기본 서피스" 절의 방향 보장이 **`white/bg/*` 에만** 해당함을 명시. 색 그룹의 `bg` 사다리 6개는 미러링 결과라 다크에서 방향이 뒤집히고, 그래서 그 그룹에서는 "한 단계 더 진하게"가 다크에서 반대로 작동한다. 깊이 표현은 `white/bg/*` 로 한다 — 감사의 '사다리 방향' 검사가 `brand`·`black`·`success`·`error`·`warning`·`info` 6개를 모두 뒤집힘으로 보고 (사용자 승인)
- **color-token-rule.md** §9·§10, **FIGMA-GUIDEBOOK.md**, **DESIGN.md** — `color-semantic` 모드 이름 변경을 반영: `light/black` → `light/rikaride`, `dark/black` → `dark/rikaride`. 브랜드 축의 이름이 색(`black`)이 아니라 브랜드명(`rikaride`)으로 바뀐 것이고, 모드 이름이 `{명도}/{브랜드}` 2단 구조라는 규칙 자체는 그대로다. 예시 문구만 갱신했고 규칙은 바뀌지 않았다. 과거 항목의 `dark/black` 표기는 그 시점의 기록이므로 고치지 않았다 (사용자 지시)

## 2026-11-02

- **color-token-rule.md** 헤더·§0 체크리스트·§1·§2(§2-1 신설)·§7, **FIGMA-GUIDEBOOK.md** §5 — 그룹을 2종에서 **3종**(interactive / non-interactive / `styles`)으로, 역할을 3가지에서 **5가지**(`bg`·`border`·`inner` + `styles` 전용 `shadow`·`gradient`)로 확장. `styles` 는 레이어에 바인딩하지 않고 Effect/Paint Style 이 소비하므로 §3~§8 의 레이어별 판정 절차 대상이 아니며, 레이어가 직접 물고 있으면 위반임을 명시 — `effects` 컬렉션과 색상 스타일에 모드 축이 없어서 그림자·그라디언트 색을 primitive 에 직접 걸면 다크모드에서 영원히 안 바뀌는 문제. `color-semantic` 을 모드 전환의 단일 창구로 만들기 위함 (사용자 승인)
- **color-token-rule.md** §9 전면 개정, **FIGMA-GUIDEBOOK.md** §5 — "아직 다크모드가 존재하지 않습니다" 삭제(`dark/black` 추가됨), 제목을 "명도 × 브랜드"로 정정. 다크모드 값 산출법 신설: primitive 참조 미러링을 1차 초안으로 쓰되 **미러링만으로는 완전한 다크모드가 되지 않으므로 스크린샷·명도 대비 검증이 필수**임과 미러링이 틀리는 5가지 경우(방향 고정 토큰 / 밝기가 뒤집히는 자리의 오버레이 / 그림자 색 / 램프 양 끝점 / 유리·지도 위 UI)의 처리를 표로 명시 — 단순 미러링으로 다크모드를 끝내려다 생기는 오류 방지 (사용자 승인)
- **effect-token-rule.md** 헤더·§0·§0-1·§1, **FIGMA-GUIDEBOOK.md** §9 — shadow `color` 필드의 출처를 `color-primitive` 알파 색상에서 **`color-semantic` 의 `styles/shadow/*`** 로 정정. Effect Style 이 레거시가 아니라 실제 바인딩 대상임을 명시, 모드 축이 다른 컬렉션으로 넘어가는 alias 는 리터럴로 펼치지 말고 참조로 내보낼 것, 다크모드 그림자는 뒤집지 않고 알파를 올릴 것 추가 (사용자 승인)
- **effect-token-rule.md** §5 신설(기존 치트시트 §5 → §6), **FIGMA-GUIDEBOOK.md** §9, **docs/README.md**·**docs/GUIDEBOOK.md** 한 줄 설명 — `gradient/{overlay|solid}-{up|down|left|right}` 색상 스타일 규칙 신설. 그라디언트는 이 프로젝트에서 유일하게 Variable 이 아닌 토큰 리소스이고 스톱 색만 `styles/gradient/*` 를 참조한다는 점, 투명 끝점의 RGB 가 보간에 영향을 주므로 진한 쪽과 같은 색조여야 한다는 점, 이름에 명도를 넣지 않는다는 점 — 그라디언트 규칙이 룰북에 아예 없었고, 실제 스타일 8개가 primitive 를 직접 참조하고 있었음 (사용자 승인)

- **color-token-rule.md** §9 예외 표 — "의미 신호 색" 행 추가: 파괴적 액션·경고색은 서피스 색이 아니라 신호라 모드가 바뀜어도 색을 유지하고 `inner` 만 대비에 맞춰 뒤집는다, 그 색의 반투명판도 같은 색조를 따른다 — dark/black 검증 중 순수 미러가 `interactive/primary-destructive/bg/default` 을 #ed3c3f → #fba7a8(파스텔 핑크)로 바꿔 '삭제' 버튼이 경고로 안 읽히는 문제가 드러남. 결과로 bg 는 warning-red/600 으로 유지하고 inner 만 흰색→검정으로 뒤집어 글자 대비가 3.95 → 5.32 로 오히려 개선됨 (사용자 승인)

- **color-token-rule.md** §9 예외 표 — 3행 추가: ① 색 패밀리의 `dark-alpha`/`light-alpha` 는 명암 쌍이 아니라 아이덴티티 색 vs 옅은 틴트이므로 램프를 바꾸면 색 자체를 잃는다, ② `*-ghost` 유리 재질은 램프 방향을 유지하고 알파 대역만 낮춘다, ③ 모드와 무관한 배경(사진·지도) 위의 컴포넌트는 토큰이 아니라 §10 지역 오버라이드로 해결한다 — dark/black 검수에서 순수 미러가 outline/ghost-destructive 의 경고 빨강을 따뜻한 회색(#b2a3a3)으로 바꾸고, `white/*-ghost` 유리를 서피스보다 어둡게 만들어 스낵바가 통째로 사라지는 문제가 확인됨 (사용자 지적)

- **color-token-rule.md** §9 — "기본 서피스를 가장 먼저 못 박는다" 절 신설: `white/bg/base` 가 기본 서피스이고 `dark`/`darker`/`darkest` 는 올라온 요소 뒤를 누르는 물러난 배경이며, 이름이 가리키는 방향(물러난다=어두워진다)은 모드와 무관하게 유지된다는 점, 이 네 값이 나머지 전부의 기준이라 가장 먼저 확정해야 한다는 점, 검정 근처에서 대비가 압축되어 다크에서는 가장 깊은 두 단계가 구분되지 않으므로 좁은 총 폭 안에서 단계 간격은 균등해야 '한 단계 더'가 작동하므로 중간 단계를 primitive 에 추가한다는 점, 총 폭이 모자라면 면이 아니라 테두리·그림자로 표현해야 한다는 점을 명시 — 다크 작업 중 서피스 값을 두 번 바꾸었고 그때마다 테두리·텍스트·disabled 가 연쇄로 틀어졌음. 또 `dark` 가 `base` 보다 밝아진 시점에 바텀시트가 뒤 배경보다 어두워져 깊이가 뒤집히는 문제가 발생 (사용자 결정)

- **color-primitive** `neutral/default/850`(#191f21)·`925`(#0f1315) 2개 추가 — 다크 서피스 사다리의 단계 간격이 기존 램프(800/900/950/1000)로는 1.23/1.08/1.07 로 기울어져 첫 단계가 전부 담당하고 나머지 두 단계는 구분되지 않았음. 두 단계를 넣어 1.12/1.12/1.12 로 균등화 (`white/bg/dark`→850, `darker`→925). 라이트 모드에는 사용처가 없어 영향 없음 (사용자 승인)

- **component-structure-rule.md** §1 2단계 테스트 앞 「사전 확인」·복합 템플릿 설명, §7 오류 행, **FIGMA-GUIDEBOOK.md** 2단계 요약 — 템플릿·패턴 인스턴스를 담은 컴포넌트는 1단계(색 소유)를 건너뛰고 2단계로 판정 — 자기 색 없이 템플릿을 배치만 하는 `btn-layout` 이 1단계에서 스켈레톤으로 오판됨 (사용자 승인)
- **shape-token-rule.md** §0 체크리스트 4번, §5 신설 — 인스턴스 크기는 메인이 그 치수를 정의(토큰·FILL·HUG)했으면 바꾸지 않고, 리터럴이면 사용처가 자유롭게 정한다 — 디자이너 의도를 기준으로 하는 사용자 규칙을 룰북으로 옮김 (사용자 승인)
- **component-structure-rule.md** §1 사전 확인 재작성·중첩 규칙·스켈레톤 색 글머리, §7 오류 행, **FIGMA-GUIDEBOOK.md** 판별 0번·중첩 요약 — 스켈레톤 안에 부품인 빌딩블록 패턴(`.` 접두사)을 허용. 사전 확인은 템플릿·퍼블리시 패턴을 담거나 자신이 빌딩블록이 아니면서 패턴을 담은 경우로 좁힘 — 로딩 lottie·공용 placeholder 이미지 같은 부품을 예외 목록 없이 스켈레톤에 넣기 위함 (사용자 승인)

## 2026-11-01

- **component-structure-rule.md** §1 패턴 설명·2단계 테스트, **FIGMA-GUIDEBOOK.md** 2단계 요약 — 고정된 콘텐츠를 켜고 끄기만 하는 표시 boolean 은 "수정 가능한 콘텐츠"가 아님을 명시 — `.gnb-layout`(show-* 만 노출) 레이어 판정 공백. 결과로 `.gnb-layout` → `.pattern-gnb-layout` (사용자 승인)
- **component-structure-rule.md** §3 핵심 스키마·슬래시 규칙·추가 규칙 6, §7 — 패턴의 슬래시는 특정 템플릿을 활용한 패턴(`{template}/pattern-{name}`)에만 쓰고, 템플릿 없이 만든 패턴은 `pattern-{family}-{name}` 으로 명시 — `.gnb-item-bg` 를 패턴으로 바꿀 때 슬래시 사용 기준이 문서에 없었음 (사용자 승인)
- **component-structure-rule.md** §3 — "활용한 템플릿" 정의 추가: 패턴의 바깥 틀이 되는 템플릿, 중첩된 템플릿은 해당 없음 — 템플릿을 여럿 담은 패턴의 슬래시 앞 판단 기준 (사용자 승인)
- **design-to-dev-rule.md** §2·§3, **section-layout-rule.md** §3, **FIGMA-GUIDEBOOK.md** 이름 규칙 — 위 변경에 맞춰 표 행 이름·슬래시 설명·pattern 줄 배치 문구 갱신 (사용자 승인)
- **annotation-rule.md 신설** — Figma 캔버스 주석 규칙: variant 브래킷(위·왼쪽만, `{속성}:` 두 줄 라벨, 바깥 = 덜 자주 바뀌는 속성, 기본 간격은 참고값이고 겹침 방지가 우선), `address-platter` 4 variant 와 `.address-anchor`(UI 이름과 같은 텍스트, 인스턴스로 가리킴), 레이어 주석 = annotation(카테고리 없음), 컴포넌트 전체 = spec(주제 옆 같은 섹션), 예시 = 주석 섹션(fill 없음 + dashed stroke `#000000` 2 / 8·8 / OUTSIDE) — 주석 관례가 어디에도 없어 GNB 작업 중 anchor 누락·브래킷 아래 배치·platter 가림이 생김 (사용자 승인)
- **section-layout-rule.md** 헤더·§1·§2·§3·§5·§7 — "메모 섹션"을 "주석 섹션"으로, 판별 기준을 "배경 투명" → "fill 없음 + dashed stroke", 주석 정의를 `annotation-rule.md` 참조로. §7 에서 붙어 깨져 있던 두 행 분리 — 위와 같음 (사용자 승인)
- **docs/README.md, GUIDEBOOK.md, FIGMA-GUIDEBOOK.md §4·§12, 루트 CLAUDE.md, qa-reporter.md #14** — 룰북 10개 → 11개, 라우터·목록·요약·검사 근거에 `annotation-rule.md` 추가

## 2026-10-31

- **liquid-glass-rule.md 삭제** — 최상위 `liquid-glass` 컬렉션(supported/unsupported 스위치)은 디자인 토큰이 아님. 유리 효과 값(`effects/liquid-glass/*`, effect-token-rule.md §3)은 유지
- **effect-token-rule.md** 헤더·§0-1·§3·§5 — 스위치 컬렉션과 `liquid-glass-rule.md` 참조 삭제 — 위와 같음
- **color-token-rule.md** 헤더 — 관련 룰북에서 `liquid-glass-rule.md` 삭제 — 위와 같음
- **collections.json / to-dtcg.mjs** — `expected` 를 추출 대상 전체 목록(allowlist)으로 정의. 그 밖의 Figma 컬렉션은 추출을 멈추지 않고 건너뜀. `liquid-glass` 항목 삭제, `language` 는 `nonTokenPipelines` 로 이동 — 토큰이 아닌 컬렉션을 Figma 에 추가해도 추출이 멈추지 않게
- **design-tokens.json / build-theme.mjs** — 최상위 `liquid-glass` 노드와 `data-liquid-glass` 매핑 삭제
- **docs/README.md, GUIDEBOOK.md, FIGMA-GUIDEBOOK.md, 루트 CLAUDE.md, TOKENS.md** — 룰북 11개 → 10개, liquid-glass 스위치 관련 행·문단 삭제, 추출 대상 정책 반영

## 2026-10-30

- **language-rule.md** 헤더·§0·§2·§4·§5·§6·§7, §8 신설 — 제목 "토큰" → "변수", 이름 형식 `{섹션 경로}/{레이어}/{6자 ID}` 와 코드 번역 키 = 6자 ID, 추출 원본 = `figma-dump.js` 덤프, `--` = 미번역, 변수 생성·연결은 사람이 전용 도구로 하고 Claude 는 찾기·번역 제안·기존 값 수정만, 번역 테이블(`i18n-table`) 검사 제외. `action/next` 식 예시 삭제 — 실제 Figma 작업 방식(도구가 이름을 자동 생성, 테이블로 번역 검토)과 달랐음. 특정 도구 이름은 룰북에 넣지 않고 GUIDEBOOK 에 둠
- **룰북 8개 제목** — "(공통 룰북)" 삭제 — 뜻이 정의된 곳이 없어 판단 근거로 쓸 수 없었음
- **language-rule.md §4·§7** — "파일 경로·라이브러리 미정" 을 실제 구성으로 교체: `to-i18n.mjs` 추출, `src/i18n/locales/{언어}.json` + `index.json`, 외부 라이브러리 없이 `src/i18n` 의 `t()` 로 소비 — i18n 추출 파이프라인이 만들어졌음
- **color-token-rule.md §2 표·§5** — 스케일 어휘 `low/lower/high/higher` 를 실제 이름 `lightest/lighter/light/base/dark/darker/darkest` 로 교체, 그룹 불일치 예시를 `black/inner/lower` → `black/inner/base` 로 교체 (FIGMA-GUIDEBOOK §5 요약 동반 수정) — design-tokens.json 부트스트랩 후 rulebook:verify 에서 실재하지 않는 이름으로 드러남

## 2026-10-26

- **style-rule.md → text-style-rule.md 이름 변경** — 파일명이 Text Style 이 아닌 Figma 스타일 전반(Effect Style 등)을 다루는 것처럼 읽혔음. 참조하는 룰북(typography-token-rule·icon-frame-rule·component-structure-rule), docs/README.md·GUIDEBOOK.md·FIGMA-GUIDEBOOK.md, figma-implementer 에이전트, tokens/extract·build-theme 주석과 collections.json 갱신
- **text-style-rule.md §4** — "body/regular·medium 이 display 쪽 font-weight 변수를 재사용한다" 사례 삭제, "바인딩 변수의 카테고리·굵기는 스타일 이름과 일치하며 어긋나면 Figma 오류로 보고" 규칙으로 교체. §1 체크리스트 3·§6 치트시트 동반 수정 — 해당 바인딩은 Figma 파일 오류였고 수정됨. Rider-App 의 Text Style 42개 전부 자기 카테고리·굵기 변수에 바인딩된 것을 use_figma 로 확인
- **text-style-rule.md §0** — letter-spacing 참조 §4 → §5 — 원래 잘못된 번호였음
- **typography-token-rule.md §2** — font-weight 비대칭 예시를 실제 구조로 교정 (`display`·`headline` = bold, `body` = regular/medium/bold, `magazine` = regular/bold) — 기존 예시가 §4 의 착오와 같은 전제로 반대로 적혀 있었음

## 2026-10-17

- **icon-prop-rule.md → icon-frame-rule.md (이름 변경·전면 재작성)** — 존재하지 않는 `icon-prop`·`icon-size` 컬렉션 전제를 실제 `icon-frame` 컬렉션 하나로 교체. 아이콘은 `icon-frame-*` 5개 중 하나를 놓고 instance swap 으로 교체(§1), `icon-line-height/{카테고리}` 가 `typeface-semantic` `line-height/*` 를 참조해 프레임 높이 = 짝 텍스트 line-height(§2, standalone 은 size 스케일 참조), 카테고리 매칭에 굵기 무관(§4), 모드 `size-N` = 텍스트 스텝이며 카테고리에 없는 스텝의 모드(값 0, 예: body 의 size-7~9)는 쓰지 않음(§5) — 룰북이 Figma 실제 구조와 달라 버튼 패밀리 설계 테스트에서 적용 여부를 판단할 수 없었음 (사용자 설명·승인)
- **shape-token-rule.md 헤더·§0·§3·§4** — 아이콘 크기 서술을 `icon-frame` 컬렉션 + `icon-frame-rule.md` 위임으로 축약 — 컬렉션 이름 오류, 중복 제거 (사용자 승인)
- **typography-token-rule.md 헤더·§0·§1·§4** — 참조를 `icon-frame-rule.md` 로, `line-height/*` 가 `icon-line-height` 의 참조 원본임을 §1 에 명시 — line-height 변경이 아이콘 프레임 높이로 전파됨을 알리기 위해 (사용자 승인)
- **color-token-rule.md·component-structure-rule.md·section-layout-rule.md·language-rule.md·effect-token-rule.md** — `icon-prop-rule.md`·`icon-prop`·`icon-size` 참조를 `icon-frame-rule.md`·`icon-frame` 으로 갱신 (사용자 승인)
- **docs/README.md, GUIDEBOOK.md, FIGMA-GUIDEBOOK.md §6·§7·§11·§12, TOKENS.md** — 위 변경 반영(파일명, 컬렉션명, 스텝 범위·굵기 무관 규칙) (사용자 승인)
- **tokens/extract/collections.json, tokens/build-theme.mjs, to-dtcg.mjs 주석, 루트 CLAUDE.md** — `icon-size`·`icon-prop` 기대값을 `icon-frame` 하나로 교체(modeNamePattern `^size-[0-9]+$`), 삭제된 `icon-weight` 매핑·예시 제거 — 그대로면 `tokens:verify` 가 추출을 막음 (사용자 승인)

- **section-layout-rule.md §1·§2·§3·§5·§7** — 구조 판정에 쓰는 노드를 고정 목록(주석 "인스턴스" 열거)이 아니라 섹션의 **주제**를 맥락으로 골라 판단하도록 변경(§1), 주제 개수 세기·섹션 종류 판별을 이에 맞춤(§2·§5-2), "주석 인스턴스" → "주석"(§3), `.` 접두사 주석 컴포넌트 오독 행 추가(§7) — Button 페이지 검수에서 `.address-anchor` 가 인스턴스가 아니라 섹션마다 컴포넌트 정의로 있어 글자 그대로 읽으면 빌딩블록 배치 대상이 됐음. 판정 노드 규정이 지나치게 처방적이라는 사용자 판단 (사용자 승인)
- **section-layout-rule.md §1·§2·§3·§5, FIGMA-GUIDEBOOK.md 섹션 정리** — 빌딩블록은 플래그이고 섹션 구성은 주제의 레이어를 따른다고 명시(§1). 빌딩블록 템플릿도 pattern 줄을 갖는 3띠 구조(§3 building-block 섹션), 패턴은 빌딩블록이어도 자기 템플릿 섹션에 두고 템플릿의 사용처에서 자기 패턴은 뺀다(§2 빌딩블록 배치), 패턴 앞부분 비교 시 `.` 무시(§3), 해석 절차 항목 추가(§5-4) — General Nav Bar 의 `.gnb-bar-item` + 패턴 구조를 글자 그대로 읽으면 템플릿을 자기 패턴 섹션 안에 넣으라는 역전된 결론이 났음. `component-structure-rule.md` 와 충돌 없음 확인 (사용자 승인)
- **section-layout-rule.md §2·§3, FIGMA-GUIDEBOOK.md** — 「예외 — 아이콘 글리프」 신설: 개별 아이콘은 building-block 줄 안 분류별 섹션으로 묶고 주제 하나·이름 규칙 미적용 — Icons 페이지 아이콘 약 200개에 섹션 하나씩은 비현실적 (사용자 결정)
- **component-structure-rule.md 헤더·§1·§6, FIGMA-GUIDEBOOK.md 레이어 표·판별** — 스켈레톤에 칠한 색은 자리표시이고 소유가 아님(템플릿이 덮어쓰거나 같은 색을 확정), `black`·`white` 그룹 권장, 레이어 판별 1단계는 색이 칠해졌는지가 아니라 그 색을 정하는지로 본다 — 디자이너가 형태를 알아보려면 스켈레톤에도 색이 필요한데 "색상을 가질 수 없음"을 글자 그대로 읽으면 색 있는 스켈레톤을 패턴으로 오판함(`.skeleton/stop-direction-arrow` 사례) (사용자 승인)
- **component-structure-rule.md §1 중첩 규칙, FIGMA-GUIDEBOOK.md** — `icon-frame-*` 은 스켈레톤에 중첩 가능한 예외로 명시(아이콘 자리의 크기·line-height 를 정하는 형태 요소, 색은 템플릿이 정함) — `.skeleton/btn`·`.skeleton/marker-general`·`.skeleton/contained-icon` 이 이미 icon-frame 을 담고 있어 글자 그대로는 중첩 규칙 위반으로 읽혔음 (사용자 승인)
- **section-layout-rule.md §1·§5·§7 다듬기** — §1 주제 판단 문구를 단서 열거 없이 2줄로 축약, §5 2·3단계에서 §1·`component-structure-rule.md` 와 겹치는 설명 제거, §7 `.` 주석 오독 행 삭제(§1 과 중복) — 룰북이 길어지고 처방적이 되어 맥락 판단을 막지 않도록 (사용자 승인)

## 2026-10-16

- **section-layout-rule.md 신규** — Figma 페이지 안의 섹션 구성 규칙. 컴포넌트 레이아웃(패밀리 → 이름 없는 sub-group → template/pattern/building-block 섹션, 띠 간격 200)과 페이지 레이아웃(흐름 → 세로 sub-group → page/sub page, 띠 간격 1000), 빌딩블록 배치 3단계(빌딩블록이 쓰면 중첩 → 사용처를 모두 포함하는 가장 안쪽 섹션 아래 → 페이지 안에 사용처 없으면 독립 sub-group), 섹션 이름 규칙(template·pattern = 컴포넌트 이름, 빌딩블록 = `building-block`), 배경색·간격 캔버스 고정값, 기존 섹션 읽기 절차, 오류 패턴 — 섹션 배치로 레이어·공유 범위를 판별하는 규칙이 어디에도 없었고, Organize Sections 플러그인이 암묵적으로만 구현하고 있었음. Rider-App Feature 페이지의 이상 예시 3개와 Button·Map Overlay·Dialog·Top and Bottom Bar·Foundation 실측(인스턴스 사용 관계)으로 도출
- **component-structure-rule.md 헤더·§4** — 관련 룰북에 `section-layout-rule.md` 추가. "빌딩블록은 페이지 상단에 `.` 접두사 섹션으로 모음"·"`local-components` 섹션" 두 문장을 "Figma 페이지 안의 섹션 구성은 `section-layout-rule.md` 를 따른다"로 위임 — 두 문장이 실제 정리 방식(사용 범위마다 아래쪽에 분산 배치)과 충돌했음 (사용자 승인)
- **docs/README.md** — 분기표 "Figma → 코드"·"코드 → Figma" 행에 `section-layout-rule.md` 추가, "Figma 섹션 정리·읽기" 행 신설, 룰북 요약표에 1행 추가
- **FIGMA-GUIDEBOOK.md** — `## 4. 섹션 정리하기` 신설, 기존 §4~§11 → §5~§12 번호 이동(목차·앵커·부록 대응표 동기화), 실수 모음에 섹션 3행 추가. 서두의 "값은 어떤 룰북에도 없다"를 "디자인 토큰의 값"으로 좁히고 섹션 캔버스 고정값을 예외로 명시 — 섹션 간격·배경색은 토큰이 아니라 룰북 외에 둘 곳이 없음 (사용자 결정). 이 날짜 이전 기록의 "FIGMA-GUIDEBOOK.md §N" 표기는 당시 번호 기준
- **docs/GUIDEBOOK.md, 루트 CLAUDE.md, .claude/agents/figma-implementer.md** — "룰북 10개" → "11개"(GUIDEBOOK 용어표의 낡은 "7개" 도 함께 정정), 트리·룰북 표·figma-implementer 읽기 순서에 `section-layout-rule.md` 반영 (스테일 방지)

## 2026-10-15

- **design-to-dev-rule.md §5.1, FIGMA-GUIDEBOOK.md §3** — 스켈레톤 분리 예시의 이름 `.skeleton-badge-pill` / `.skeleton-badge-ghost` 를 `.skeleton/badge-pill` / `.skeleton/badge-ghost` 로 수정 — `component-structure-rule.md` §3 스키마(`.skeleton/{family}-{subgroup}`)와 §2 변환 표(`.skeleton/btn-ghost`)는 슬래시를 쓰는데 예시만 하이픈이라 오타였음. 실제 Figma 분리 작업(badge)이 스키마 표기를 따랐음

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
