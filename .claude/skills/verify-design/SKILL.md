---
name: verify-design
description: "생성된 UI 코드가 디자인 토큰을 올바르게 사용하는지 검증. rikaride 룰북 기준. Figma MCP 안 씀."
---

# 디자인 토큰 준수 검증

## 사용 시점

- Figma 컴포넌트 구현 직후
- `/design-audit` 커맨드에서 호출

## 검사 항목

### 1. 하드코딩된 리터럴

```bash
grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(|oklch\(|hsla?\(' src --include='*.tsx' --include='*.ts'
grep -rnE '\[[0-9.]+(px|rem|em)\]' src --include='*.tsx'
grep -rnE '\b(bg|text|border|fill|stroke|shadow)-\[[^\]]+\]' src --include='*.tsx'
```

### 2. 존재하지 않는 CSS 변수 참조 (조용히 깨지는 스타일)

**이게 가장 잡기 어려운 부류다.** 토큰이 삭제되거나 이름이 바뀌면 유틸/`var()` 참조가 그대로 남지만 스타일만 안 먹는다. 빌드는 통과한다.

```bash
grep -oE '^\s+--[a-z0-9-]+' src/styles/theme.css | tr -d ' ' | sort -u   # 존재하는 변수
grep -rnoE 'var\(--[a-z0-9-]+\)' src --include='*.tsx' --include='*.ts'  # 코드가 쓰는 변수
```

두 목록을 대조해서 theme.css 에 없는 참조를 잡는다.

### 3. Primitive 토큰 참조

```bash
grep -rn 'primitive' src --include='*.tsx' --include='*.ts' --include='*.css'
```

primitive 는 CSS 로 방출되지 않는다 (rikaride 정책). 참조하면 반드시 깨져 있다.

### 4. 그룹 불일치 (색상)

`color-token-rule.md` §5 — 배경과 텍스트가 다른 그룹을 쓰고 있으면 위반. 같은 그룹 안에서 스케일이 다른 건 정상. 이 검사는 룰북을 Read 한 뒤에만 정확히 판단 가능.

## 제외 대상

- `src/styles/theme.css` (자동 생성물, 리터럴이 있는 게 정상)
- `src/styles/` 폴더 전체
- `tokens/`, `node_modules/`, `*.svg`, `*.test.*`, `*.css` (설정 파일)
- `.storybook/`

## theme.css 가 비어 있으면

부트스트랩 전이므로 하드코딩 검사(1번)를 건너뛰고 "토큰이 아직 추출되지 않았습니다 — 부트스트랩 절차는 `docs/TOKENS.md`" 만 보고한다. 나머지 검사(2·3번)는 정상 진행 가능.

## 보고 형식

심각도 순으로 정렬:

```
❌ 깨진 참조 (스타일이 안 먹는 중)
   src/components/Card/Card.tsx:18  var(--color-brand-bg-old)  → theme.css 에 없음

❌ 하드코딩
   src/components/Card/Card.tsx:14  #f5f5f5  → 토큰으로 교체 필요
   src/components/Card/Card.tsx:22  p-[13px] → shape 토큰 필요

⚠️  primitive 참조
   src/components/Foo/Foo.tsx:8    var(--color-primitive-blue-500)

⚠️  그룹 불일치 (color-token-rule.md §5)
   src/components/Card/Card.tsx:22  bg-white-* 위에 text-black-*
```

## 하지 말 것

- 파일을 수정하지 않는다. 보고만 한다.
- 확신 있는 대체 토큰만 제안한다. 확신이 없으면 "토큰 선택 필요" 라고만 적는다. **근사값 제안 금지.**
