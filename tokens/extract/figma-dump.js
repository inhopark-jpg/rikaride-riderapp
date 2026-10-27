/**
 * figma-dump.js — Figma Plugin API 스니펫 모음 (use_figma MCP 로 실행)
 *
 * 이 파일은 node 로 직접 실행하지 않습니다. 아래 각 함수의 본문을
 * `use_figma` 툴에 넘겨 Figma 파일 컨텍스트에서 실행하고, 결과 JSON 을
 * tokens/extract/raw/ 아래에 저장한 뒤 to-dtcg.mjs 로 변환합니다.
 *
 * ⚠️ 왜 컬렉션 단위로 쪼개는가
 *   Figma MCP 응답에는 크기 제한이 있습니다. 변수를 한 번에 전부 덤프하면
 *   큰 파일에서 응답이 잘려 조용히 일부만 들어옵니다. 잘린 걸 모르고 빌드하면
 *   토큰 일부가 사라진 theme.css 가 나오므로, 반드시 컬렉션 하나씩 받고
 *   step 1 이 보고한 variableCount 와 실제 받은 개수를 대조하세요.
 *
 * 실행 순서: step1 → (컬렉션마다) step2 → step3 → step4
 * 자세한 절차와 검증 항목은 docs/TOKENS.md 를 보세요.
 */

/* ---------------------------------------------------------------------------
 * step 1 — 컬렉션 목록과 모드만 먼저 받는다 (작음)
 *
 * 이 결과를 tokens/extract/collections.json 의 expected 와 먼저 대조합니다.
 * 이름이 다르면 여기서 멈추고 사용자에게 보고합니다.
 * ------------------------------------------------------------------------ */
export const step1_listCollections = async () => {
  const cols = await figma.variables.getLocalVariableCollectionsAsync()
  return cols.map((c) => ({
    id: c.id,
    name: c.name,
    defaultModeId: c.defaultModeId,
    modes: c.modes.map((m) => ({ modeId: m.modeId, name: m.name })),
    variableCount: c.variableIds.length,
  }))
}

/* ---------------------------------------------------------------------------
 * step 2 — 컬렉션 하나의 변수를 전부 받는다. 컬렉션마다 한 번씩 호출.
 *
 * COLLECTION_ID 를 step1 결과의 id 로 바꿔서 실행하세요.
 * 변수가 많은 컬렉션(보통 color-primitive)은 SLICE 로 더 잘라 받습니다.
 * ------------------------------------------------------------------------ */
export const step2_dumpCollection = async () => {
  const COLLECTION_ID = '__REPLACE_WITH_COLLECTION_ID__'
  const SLICE = [0, 9999] // 응답이 잘리면 [0,200], [200,400] … 으로 나눠 받는다

  const col = await figma.variables.getVariableCollectionByIdAsync(COLLECTION_ID)
  if (!col) throw new Error('collection not found: ' + COLLECTION_ID)

  const ids = col.variableIds.slice(SLICE[0], SLICE[1])
  const vars = []
  for (const id of ids) {
    const v = await figma.variables.getVariableByIdAsync(id)
    if (!v) continue
    // valuesByMode 의 VARIABLE_ALIAS 는 id 만 들고 있어 그대로는 못 읽습니다.
    // to-dtcg.mjs 가 풀 수 있도록 id 를 그대로 보존해서 넘깁니다.
    vars.push({
      id: v.id,
      name: v.name,
      resolvedType: v.resolvedType,
      description: v.description || '',
      scopes: v.scopes,
      valuesByMode: v.valuesByMode,
    })
  }
  return {
    collection: { id: col.id, name: col.name, defaultModeId: col.defaultModeId },
    modes: col.modes.map((m) => ({ modeId: m.modeId, name: m.name })),
    slice: SLICE,
    returned: vars.length,
    totalInCollection: col.variableIds.length,
    variables: vars,
  }
}

/* ---------------------------------------------------------------------------
 * step 3 — Text Style (레거시 스타일 리소스)
 *
 * text-style-rule.md §0: 5속성 중 4개(family/weight/size/line-height)가 변수 바인딩,
 * letter-spacing 만 리터럴입니다. boundVariables 를 반드시 같이 받아야
 * alias 관계를 코드까지 이어갈 수 있습니다.
 * §4 의 "바인딩 변수가 스타일 이름과 일치하는가" 도 여기서만 확인됩니다 —
 * 이름으로 짐작하지 말고 이 결과를 근거로 쓰세요.
 * ------------------------------------------------------------------------ */
export const step3_dumpTextStyles = async () => {
  const styles = await figma.getLocalTextStylesAsync()
  return styles.map((s) => ({
    id: s.id,
    name: s.name,
    fontName: s.fontName,
    fontSize: s.fontSize,
    lineHeight: s.lineHeight,
    letterSpacing: s.letterSpacing,
    textCase: s.textCase,
    textDecoration: s.textDecoration,
    boundVariables: s.boundVariables ?? {},
  }))
}

/* ---------------------------------------------------------------------------
 * step 4 — Effect Style (있으면). effects 변수 컬렉션과 대조용.
 * ------------------------------------------------------------------------ */
export const step4_dumpEffectStyles = async () => {
  const styles = await figma.getLocalEffectStylesAsync()
  return styles.map((s) => ({
    id: s.id,
    name: s.name,
    effects: s.effects,
    boundVariables: s.boundVariables ?? {},
  }))
}
