---
name: gen-stories
description: "컴포넌트 Props를 분석해서 Storybook CSF3 story를 자동 생성. rikaride 4파일 구조 준수."
---

# Storybook Story 자동 생성

## 사용 시점

- `/gen-story`, `/gen-all-stories` 커맨드에서 호출
- 컴포넌트 구현 후 스토리 생성 시

## rikaride 4파일 구조

컴포넌트 폴더에 다음 4개 파일이 모두 있어야 완결:

- `{Name}.tsx` — 구현
- `{Name}.stories.tsx` — 이 스킬이 만듬
- `types.ts` — props 타입 (**`.test.tsx` 아님** — rikaride 는 테스트 파일이 아닌 타입 파일이 4번째)
- `index.ts` — 공개 export

## 절차

1. `{Name}.tsx` 의 props 인터페이스 분석 (`types.ts` 도 함께 확인)
2. Union type → variant 별 story, Boolean → 상태별 story 자동 감지
3. CSF3 + TypeScript + `satisfies Meta<typeof {Name}>` 사용
4. **개별 스토리에 `tags: ['autodocs']` 를 붙이지 않음** — `.storybook/preview.ts` 에서 전역 활성화되어 있음
5. `argTypes` 에 public props 매핑
6. `play` function 최소 1개 포함 (`@storybook/test` 에서 `expect`, `userEvent` 등 import)
7. `parameters.design.url` 에 Figma 프레임 URL 이 있으면 연결

## title 규칙

- `src/components/{Name}/` → `Components/{Name}`

## 하지 말 것

- `autodocs` 를 개별 스토리에 태그로 붙이지 마세요 (중복 활성화)
- 4파일 중 `types.ts`, `index.ts` 가 없으면 스토리만 생성하고 나머지 누락 사실을 보고하세요 (이 스킬은 스토리만 만듬 — 다른 파일은 스코프 밖)
- 하드코딩된 색상·치수 리터럴을 스토리에 넣지 마세요 (visual regression 용 예외 스토리는 별도 승인)
