`tokens/design-tokens.json` 을 CSS 로 빌드합니다.

## 절차

1. `npm run tokens:build` 실행 (내부적으로 `node tokens/build-theme.mjs`)
2. 결과 확인: `src/styles/theme.css` — 자동 생성물
3. `design-tokens.json` 이 비어 있거나 없으면 경고와 함께 빈 `@theme` 이 출력됨. 부트스트랩 절차는 `docs/TOKENS.md` 참고

## 토큰 수정 시 흐름

`tokens/design-tokens.json` 수정 → `npm run tokens:build` → `src/styles/theme.css` 자동 재생성

⚠️ `src/styles/theme.css` 는 직접 수정하지 마세요. `protect-files` 훅이 차단하며, 다음 빌드에 덮어써집니다.

$ARGUMENTS
