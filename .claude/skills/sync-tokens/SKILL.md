---
name: sync-tokens
description: "Figma 변수와 tokens/design-tokens.json (DTCG 포맷) 간 불일치를 감지하고 보고. 자동 수정 안 함."
---

# 디자인 토큰 동기화 확인

## 사용 시점

- `/check-tokens` 커맨드에서 호출
- 디자인 시스템 업데이트 후

## 절차

Figma 변수는 stable ID (`VariableID:xxx:yyy`) 를 가진다. `tokens/design-tokens.json` 은 이 ID 를 `$extensions."com.figma.variableId"` 에 보존하므로, **ID 로 매칭하면 rename 을 정확히 감지할 수 있다.** 이 순서로 진행한다:

1. **ID 목록 확보.** Figma MCP `get_variable_defs` 또는 `tokens/extract/figma-dump.js` 의 `step2_dumpCollection` 을 `use_figma` 로 실행해 현재 Figma 변수의 id + 경로를 받는다.
2. **json 인덱싱.** `tokens/design-tokens.json` 을 파싱하고 각 leaf 토큰의 `$extensions."com.figma.variableId"` 를 읽어 `id → 경로` 매핑을 만든다.
3. **ID 기반 대조:**
   - 같은 ID, **다른 경로** → 🔁 rename
   - Figma 에만 있는 ID → 🆕 신규
   - json 에만 있는 ID → 🗑️ 삭제
   - 같은 ID, 같은 경로 → 다음 단계(값 비교)로
4. **값 비교.** 같은 토큰에 대해 값이 다르면 ⚠️ 값 변경.
5. **이름 체계 확인.** 컬렉션 이름이나 최상위 head 가 룰북 전제(`tokens/extract/collections.json`) 와 다르면 🛑 이름 체계 불일치.
6. 결과를 아래 **5분류** 로 보고.

**fallback (구버전 json):** json 이 옛날 `to-dtcg.mjs` 로 만들어진 것이라 `com.figma.variableId` 필드가 없으면, 경로 기반 매칭으로 폴백한다. 이 경우 rename 은 "삭제 + 신규" 로 나눠 보고되므로 사용자가 눈으로 판단해야 한다. 다음 재추출 후에는 ID 가 채워져 자동 감지된다.

## 5분류 보고

| 분류 | 처리 |
|---|---|
| 🔁 **rename** — 같은 ID, 경로가 바뀜 | 승인받고 json 경로 갱신 + `npm run tokens:build` + `design-reviewer` 로 코드의 옛 경로 참조를 찾아 마이그레이션 |
| 🆕 **신규 토큰** — Figma에만 있음 | 임의로 추가하지 않는다. 보고하고 승인받는다 |
| 🗑️ **삭제된 토큰** — json에만 있음 | 보고한다. 코드에서 쓰이는 중이면 어디서 쓰는지 `grep` 으로 확인해 함께 적는다 |
| ⚠️ **값 변경** — 같은 토큰, 값만 다름 | 승인받고 수정. before → after 로 전부 적는다 |
| 🛑 **이름 체계 불일치** — 컬렉션·최상위 head 자체가 다름 | **작업을 멈추고 보고한다.** 억지 매핑 금지. `docs/TOKENS.md` 절차 참고 |

값 변경은 이렇게 적는다 (개수만 적지 않음):

```
color-semantic/interactive/primary/bg/default
  light/black:      #2563eb → #1d4ed8
  light/govt-navy:  변경 없음
```

## 자동 수정 금지

Figma 가 원본. 이 스킬은 보고만 한다. 수정이 필요하면 `token-checker` 에이전트에 위임하세요. `token-checker` 도 `tokens/design-tokens.json` 만 고치고 `npm run tokens:build` 를 재실행하는 방식을 씁니다 — `src/styles/theme.css` 는 절대 직접 편집하지 않습니다 (자동 생성물).

## 주의

- 모드가 새로 추가됐으면 기존 토큰 전부가 그 모드에도 값을 갖는지 확인 (`color-token-rule.md` §9 — Figma 는 모드 추가 시 값이 자동으로 채워지지 않을 수 있음)
- Figma MCP 응답 크기 제한 때문에 컬렉션 단위로 나눠 받아야 할 수 있음. `tokens/extract/figma-dump.js` 의 step1 을 참고
