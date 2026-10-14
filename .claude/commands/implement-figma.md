Figma 디자인을 rikaride 컴포넌트로 구현합니다.

`figma-implementer` 에이전트에 위임합니다. 이 에이전트는 새 컨텍스트에서 시작하며, 5단계 절차(Clarify → Context Gather → Plan → Generate → Evaluate) 를 따릅니다:

- **Context Gather 단계**에서 `docs/README.md` 를 Read 하고 해당 룰북(`component-structure-rule.md`, `design-to-dev-rule.md`, 토큰 룰) 을 전부 Read 합니다.
- **Plan 단계**에서 읽은 룰북 목록·쓸 토큰 이름·모드까지 사용자에게 보고하고 **승인**을 받은 뒤에만 파일을 만듭니다.
- 토큰이 `tokens/design-tokens.json` 에 없으면 근사값을 지어내지 않고 멈춥니다.

$ARGUMENTS
