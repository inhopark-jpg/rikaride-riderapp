`src/components/` 아래 `.stories.tsx` 가 없는 컴포넌트에 스토리를 일괄 생성합니다.

`gen-stories` 스킬을 일괄 모드로 호출합니다. 완료 후 총 컴포넌트 수, 신규 생성 수, 기존 존재 수를 보고합니다.

4파일 중 스토리 외에 다른 파일(`types.ts`, `index.ts`) 도 누락돼 있으면 함께 보고합니다 (생성은 하지 않음 — 스코프 밖).

$ARGUMENTS
