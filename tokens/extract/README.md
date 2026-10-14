# tokens/extract — Figma 토큰 추출

**이 디렉터리의 코드는 매번 새로 짜지 말고 여기 것을 고쳐서 쓰세요.** 추출은 한 번 하고 끝나는 작업이 아니라 Figma가 바뀔 때마다 반복되는데, 매번 새로 짜면 같은 실수(응답 잘림을 못 알아챔, alias를 id인 채로 두기, 모드 누락)를 반복하게 됩니다.

## 파일

| 파일 | 역할 |
|---|---|
| `figma-dump.js` | Figma Plugin API 스니펫. node로 실행하지 않고 `use_figma` MCP로 실행합니다 |
| `to-dtcg.mjs` | `raw/*.json` → `tokens/design-tokens.json` 변환 + 검증 |
| `collections.json` | 룰북이 전제하는 컬렉션/경로 이름. 대조 기준입니다 |
| `raw/` | 덤프 원본 (생성물, git에 올리지 않음) |

## 절차

전체 맥락과 보고 형식은 `docs/TOKENS.md`에 있습니다. 여기는 명령만 적습니다.

```
1. figma-dump.js 의 step1_listCollections 를 use_figma 로 실행
   → raw/collections.json 에 저장

2. node tokens/extract/to-dtcg.mjs --verify
   → 컬렉션 이름이 룰북 전제와 맞는지만 확인하고 끝난다.
     여기서 멈추면 그 다음으로 진행하지 말고 사용자에게 보고할 것.

3. 컬렉션마다 step2_dumpCollection 실행 (COLLECTION_ID 교체)
   → raw/vars.{컬렉션명}.json 에 저장
   → 변수가 많으면 SLICE 로 나눠 받고 raw/vars.{컬렉션명}.part1.json 식으로 저장

4. step3_dumpTextStyles → raw/text-styles.json
   step4_dumpEffectStyles → raw/effect-styles.json (있으면)

5. node tokens/extract/to-dtcg.mjs
   → tokens/design-tokens.json 생성. 컬렉션별 개수와 총 leaf 수를 출력한다.

6. npm run tokens:build
   → src/styles/theme.css 생성
```

## 이 스크립트가 잡아주는 실수

- **응답 잘림**: step1이 보고한 `variableCount`와 실제로 받은 변수 개수를 대조합니다. 다르면 변환을 중단합니다. Figma MCP 응답에는 크기 제한이 있어서, 큰 컬렉션은 조용히 일부만 돌아옵니다.
- **이름 체계 불일치**: `collections.json`의 `expected`와 대조합니다. 룰북들이 "토큰 이름 자체가 다르면 이 룰북을 적용하지 마세요"라고 명시하고 있어서, 다른 이름을 억지로 매핑하면 안 됩니다.
- **풀리지 않은 alias**: `VARIABLE_ALIAS`는 변수 id만 들고 있습니다. 모든 컬렉션을 다 덤프한 뒤에야 id→경로를 풀 수 있으므로, 컬렉션 하나만 덤프하고 변환하면 실패합니다.
- **모드 누락**: `valuesByMode`를 모드 이름으로 바꿔 전부 기록합니다. color-token-rule.md §9가 경고하는 "새 모드에 일부 토큰만 값이 비어있는" 상황은 생성된 json에서 해당 토큰의 `modeValues`에 그 모드 키가 없는 것으로 드러납니다.

## 주의

`raw/`는 덤프 원본이라 커밋하지 않습니다. 다만 추출 직후 문제가 생기면 원인 추적에 필요하니, 보고가 끝날 때까지는 지우지 마세요.
