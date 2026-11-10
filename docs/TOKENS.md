# 토큰 부트스트랩 및 업데이트

`tokens/design-tokens.json` 은 **모든 값의 유일한 진실의 원천**이다. 룰북들이 이 파일을 이름으로 참조하므로 **경로와 이름을 바꾸지 않는다.**

파이프라인:

```
Figma Variables/Styles
  └→ tokens/extract/figma-dump.js   (use_figma 로 실행, 컬렉션 단위 분할)
      └→ tokens/extract/raw/*.json
          └→ tokens/extract/to-dtcg.mjs
              └→ tokens/design-tokens.json          ← 진실의 원천
                  └→ tokens/build-theme.mjs
                      └→ src/styles/theme.css       ← 자동 생성물, 수정 금지
```

명령 요약은 `tokens/extract/README.md`, 변수명 변환 규칙은 `tokens/build-theme.mjs` 상단 주석에 있다.

---

## 최초 1회 — 부트스트랩

### 1. 추출 전에 이름 체계부터 확인한다

**이게 가장 먼저다.** 룰북들은 전부 이렇게 명시하고 있다:

> 토큰 이름 자체가 다르면(예: `interactive/primary/surface/default` 대신 `button/main/background/base-color`) 이 룰북을 적용하지 마세요.

그러므로 값을 뽑기 전에 컬렉션 이름과 토큰 경로가 룰북 전제와 맞는지 먼저 대조한다.

```
step1_listCollections 실행 → raw/collections.json 저장
npm run tokens:verify
```

`tokens/extract/collections.json` 의 `expected` 와 대조해서, 다르면 스크립트가 **추출을 중단한다.** 중단되면 그대로 사용자에게 보고한다 — 비슷한 이름으로 억지 매핑하지 않는다.

`expected` 가 디자인 토큰 추출 대상의 **전체 목록**이다. Figma 에 그 밖의 컬렉션이 있어도 토큰이 아니므로 추출을 멈추지 않고 건너뛴다 (대조 결과에 "토큰 아님, 건너뜀" 으로 표시된다). 사용자가 새 토큰 컬렉션이라고 명시한 경우에만 `expected` 에 추가한다.

### 2. 컬렉션 단위로 덤프한다

Figma MCP 응답에는 크기 제한이 있다. 한 번에 다 받으면 큰 컬렉션은 **조용히 잘려서** 일부만 들어온다. 컬렉션마다 따로 받고, 변수가 많으면 `SLICE` 로 더 나눈다.

`to-dtcg.mjs` 가 step1이 보고한 `variableCount` 와 실제 받은 개수를 대조해서 다르면 중단한다.

### 2-1. 스타일 리소스도 함께 덤프한다

변수만 받으면 안 된다. 레이어에 실제로 적용되는 건 Style 쪽이고, 변수는 그 Style 이 참조하는 값이다.

```
step3_dumpTextStyles  → raw/text-styles.json
step4_dumpEffectStyles → raw/effect-styles.json
step5_dumpPaintStyles  → raw/paint-styles.json
```

`step5` 는 **그라디언트 색상 스타일**이다 (`effect-token-rule.md` §5). 이 프로젝트에서 유일하게 Variable 이 아닌 토큰 리소스라, 변수 덤프만 받으면 통째로 빠진다. 스톱의 `boundVariables` 를 반드시 같이 받아야 한다 — 색만 받으면 모드를 안 따라오는 리터럴이 되고, 다크모드에서 그라디언트만 라이트로 남는다.

### 3. 변환하고 빌드한다

```
npm run tokens:extract    # raw/*.json → design-tokens.json
npm run tokens:build      # → src/styles/theme.css
```

`tokens:build` 는 **컬렉션을 넘는 alias 를 리터럴로 펼치지 않고 `var()` 참조로 내보낸다.** 컬렉션마다 모드 축이 달라서(예: `effects` 는 `Mode 1` 하나, `color-semantic` 은 명도×브랜드) 펼쳐버리면 참조하는 쪽 모드에 맞는 값을 못 찾고 기본 모드 값으로 굳는다. 그림자 색(`color-semantic` 의 `styles/shadow/*` 참조)과 그라디언트 스톱이 여기에 해당한다 — `[data-theme]` 를 바꿔도 그것만 안 따라오면 이 변환을 의심한다.

### 4. 보고 형식

추출 결과를 보고할 때 **컬렉션별 변수 개수와 총 leaf 토큰 수를 함께 적는다.** `tokens:extract` 가 그대로 출력한다.

```
컬렉션별 변수 개수:
   color-primitive       128
   color-semantic         94
   shape-semantic         41
   icon-frame             10
   typeface-semantic      36
   effects                23

   총 leaf 토큰: 349
   Text Style:    18
   Paint Style:    8
```

---

## 이후 업데이트

### 값만 바뀐 경우

```
1. json 갱신 (재추출)
2. npm run tokens:build
3. 바뀐 토큰 목록을 diff 로 사용자에게 보고
```

보고는 "토큰 몇 개가 바뀜"이 아니라 **어떤 토큰이 무엇에서 무엇으로 바뀌었는지** 적는다.

```
git diff --stat tokens/design-tokens.json
git diff tokens/design-tokens.json | grep -E '^[+-].*\$value'
```

### json에 없던 토큰이 Figma에 새로 생긴 경우

**임의로 추가하지 않는다. 먼저 보고하고 승인받는다.** 새 토큰은 디자인 시스템에 새 개념이 들어왔다는 뜻이라, 코드에서 그걸 어디에 쓸지는 사람이 정할 일이다.

### Figma에는 있는데 이름 체계 자체가 다른 경우

예: `interactive/primary/surface/default` 대신 `button/main/background/base-color`

**작업을 멈추고 사용자에게 알린다.** 룰북이 전제하는 네이밍이 아니므로 그대로 적용하면 안 된다. 셋 중 하나를 사용자가 결정해야 한다:

- Figma 쪽 이름을 룰북에 맞게 고친다
- 룰북을 새 이름 체계에 맞게 고친다 (룰북 수정은 승인 필요)
- 이 프로젝트에는 그 룰북을 적용하지 않기로 한다

### 토큰이 바뀌면 코드도 재검증 대상이다

**이미 작성된 컴포넌트는 토큰 변경의 영향을 받는다.** 값만 바뀌었으면 보통 문제가 없지만, 아래 경우는 코드가 깨진다:

| 변경 | 영향 |
|---|---|
| 토큰이 **삭제**됨 | 그 토큰을 쓰던 유틸 클래스가 조용히 무효가 된다 — CSS 변수가 없어져 스타일이 안 먹는다 |
| 토큰 **이름**이 바뀜 | 위와 같다. 빌드는 통과하므로 더 위험하다 |
| 모드가 **추가**됨 | 기존 토큰 전부가 새 모드에도 값을 갖는지 확인해야 한다 (`color-token-rule.md` §9) |
| 스케일 이름이 바뀜 | 그 그룹에 그 스케일이 실제로 있는지 다시 확인해야 한다 |

토큰을 업데이트한 뒤에는 `design-reviewer` 로 코드 전체를 다시 스캔한다. 이름 변경·삭제가 있었다면 반드시 돌린다.

---

## 색상 토큰 감사 — `npm run tokens:audit`

값이 Figma와 일치하는지(`tokens:verify`)와, 그 값이 **실제로 쓸 수 있는 값인지**는 다른 문제다.
감사는 후자를 본다 — `light/{브랜드}` 와 `dark/{브랜드}` 를 짝으로 놓고, 라이트에서 성립하던 관계가
다크에서도 성립하는지 검사한다. 대비는 토큰 하나의 성질이 아니라 **토큰과 그 토큰이 놓이는 면 사이의 관계**라서,
각 토큰이 어떤 면 위에 놓이는지를 먼저 정해야 한다. 그 판정표가 `tokens/audit-rules.json` 의 `contextRules` 다.

모드 이름은 어디에도 하드코딩하지 않는다. `design-tokens.json` 의 `com.figma.modes` 에서
`light/X` 와 `dark/X` 가 짝으로 있는 브랜드를 찾아 그 쌍마다 돌리므로, 브랜드가 늘거나 모드 이름이 바뀌어도
이 스크립트는 고치지 않아도 된다. 다크 모드 짝이 없는 브랜드는 목록으로 알려준다.

| 구분 | 무엇을 보는가 | 종료 코드 |
|---|---|---|
| **결함** | 모드 값 누락, 요소가 자기 면에 묻힘(테두리·잉크가 면과 같은 색), interactive 의 두 상태가 같은 색 | 1 (실패) |
| **확인 필요** | 붕괴·방향 뒤집힘·대비 약화·과하게 세짐·색이 쨍해짐·사다리 방향·사다리 해상도·잉크 조합 | 0 |

- `--strict` — 확인 필요 항목이 있어도 실패시킨다
- `--quiet` — 종류마다 3건만 보여준다

**결함이 의도된 것이면** `tokens/audit-rules.json` 의 `accepted` 에 이유와 함께 추가한다.
지우지 말고 왜 괜찮은지를 남겨야, 다음에 같은 걸 또 조사하지 않는다.

> 색감(chroma) 검사가 따로 있는 이유: 색 패밀리의 램프는 명도 램프가 아니라 채도 램프다.
> 그래서 램프 위치를 미러링하면 라이트에서 옅던 경고색이 다크에서 쨍한 빨강이 된다.
> "절제돼 보이는가"는 대비가 아니라 색감으로 읽히므로 대비 검사로는 안 잡힌다.

## 자주 틀리는 것

| 증상 | 원인 |
|---|---|
| theme.css 가 비어 있음 | `design-tokens.json` 이 없거나 컬렉션이 0개. 빌드가 경고를 낸다 |
| 유틸 클래스가 안 먹음 | 그 토큰이 primitive 컬렉션 소속이라 방출되지 않음. semantic 을 써야 한다 |
| 변수명 충돌로 빌드 실패 | 서로 다른 두 토큰 경로가 같은 CSS 변수명으로 떨어짐. 덮어쓰지 않고 중단한다 |
| alias 가 안 풀림 | 참조 대상 컬렉션을 덤프하지 않음. **모든 컬렉션을 다 덤프한 뒤** 변환해야 한다 |
| 모드 전환이 서브트리에 안 먹음 | `@theme inline` 을 쓰면 값이 인라인되어 오버라이드가 깨진다. `@theme static` 이어야 한다 |
