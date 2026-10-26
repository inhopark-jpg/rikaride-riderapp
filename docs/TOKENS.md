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

> 토큰 이름 자체가 다르면(예: `interactive/primary/bg/default` 대신 `button/main/background/base-color`) 이 룰북을 적용하지 마세요.

그러므로 값을 뽑기 전에 컬렉션 이름과 토큰 경로가 룰북 전제와 맞는지 먼저 대조한다.

```
step1_listCollections 실행 → raw/collections.json 저장
npm run tokens:verify
```

`tokens/extract/collections.json` 의 `expected` 와 대조해서, 다르면 스크립트가 **추출을 중단한다.** 중단되면 그대로 사용자에게 보고한다 — 비슷한 이름으로 억지 매핑하지 않는다.

### 2. 컬렉션 단위로 덤프한다

Figma MCP 응답에는 크기 제한이 있다. 한 번에 다 받으면 큰 컬렉션은 **조용히 잘려서** 일부만 들어온다. 컬렉션마다 따로 받고, 변수가 많으면 `SLICE` 로 더 나눈다.

`to-dtcg.mjs` 가 step1이 보고한 `variableCount` 와 실제 받은 개수를 대조해서 다르면 중단한다.

### 3. 변환하고 빌드한다

```
npm run tokens:extract    # raw/*.json → design-tokens.json
npm run tokens:build      # → src/styles/theme.css
```

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

예: `interactive/primary/bg/default` 대신 `button/main/background/base-color`

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

## 자주 틀리는 것

| 증상 | 원인 |
|---|---|
| theme.css 가 비어 있음 | `design-tokens.json` 이 없거나 컬렉션이 0개. 빌드가 경고를 낸다 |
| 유틸 클래스가 안 먹음 | 그 토큰이 primitive 컬렉션 소속이라 방출되지 않음. semantic 을 써야 한다 |
| 변수명 충돌로 빌드 실패 | 서로 다른 두 토큰 경로가 같은 CSS 변수명으로 떨어짐. 덮어쓰지 않고 중단한다 |
| alias 가 안 풀림 | 참조 대상 컬렉션을 덤프하지 않음. **모든 컬렉션을 다 덤프한 뒤** 변환해야 한다 |
| 모드 전환이 서브트리에 안 먹음 | `@theme inline` 을 쓰면 값이 인라인되어 오버라이드가 깨진다. `@theme static` 이어야 한다 |
