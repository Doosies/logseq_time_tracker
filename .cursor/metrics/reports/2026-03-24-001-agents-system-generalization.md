# 에이전트 시스템 일반화 개선

- **사이클**: 2026-03-24-001
- **유형**: Refactor
- **결과**: 성공

## 변경 요약

에이전트 정의, 도메인 스킬, 워크플로우 파일들에서 프로젝트 특정 참조(패키지명, 함수명, URL 등)를 플레이스홀더로 치환하고, pnpm 하드코딩을 패키지 매니저 중립 표현으로 일반화하고, 스킬 참조 경로를 상대경로로 통일했습니다.

### 변경 파일 (28개)

**에이전트 정의 (3개)**
- `.cursor/agents/planner.md` — ecount-dev-tool 하드링크 + cycle ID 제거
- `.cursor/agents/developer.md` — 경로 통일 + 스택 종속 완화
- `.cursor/agents/qa.md` — 경로 통일 + 스택 종속 완화

**도메인 스킬 (16개)**
- `.cursor/skills/developer/references/svelte-conventions.md`
- `.cursor/skills/developer/references/config-optimization.md`
- `.cursor/skills/developer/references/headless-components.md`
- `.cursor/skills/developer/references/file-status-guide.md`
- `.cursor/skills/developer/references/refactoring-patterns.md`
- `.cursor/skills/qa/references/storybook-strategy.md`
- `.cursor/skills/qa/references/chrome-extension-testing.md`
- `.cursor/skills/docs-agent/references/staleness-detection.md`
- `.cursor/skills/cli-usage/SKILL.md`
- `.cursor/skills/planner/references/plan-todo-format.md`
- `.cursor/skills/project-conventions/SKILL.md`
- `.cursor/skills/stack/svelte/SKILL.md`
- `.cursor/skills/stack/svelte/conventions.md`
- `.cursor/skills/stack/svelte/testing.md`
- `.cursor/skills/stack/svelte/workflows.md`
- `.cursor/skills/stack/chrome-extension/conventions.md`

**스택 스킬 (2개)**
- `.cursor/skills/stack/react/SKILL.md`
- `.cursor/skills/stack/react/conventions.md`

**프로젝트 지식 (1개)**
- `.cursor/skills/project-knowledge/references/ecount-dev-tool.md` — MV3 일반/전용 라벨링

**워크플로우 (3개)**
- `.cursor/workflows/final-report-template.md`
- `.cursor/workflows/domain-specific/add-api-endpoint.md`
- `.cursor/workflows/domain-specific/add-svelte-component.md`

**커맨드 (2개)**
- `.cursor/commands/plan-execution.md`
- `.cursor/commands/test-when-needed.md`

**메트릭 (1개)**
- `.cursor/metrics/cycles/2026-03-24-001.json`

## 품질 지표

- Linter 오류: 0개
- 잔여 프로젝트 참조: 0개 (허용 예외 3개: project-knowledge 2개, monorepo-patterns 1개)
- 마크다운 구조: 정상

## 주요 결정사항

| 결정 | 근거 |
|------|------|
| 플레이스홀더 `{ui-lib}`, `{extension-pkg}` 등 중괄호 스타일 | 사용자 선택, 마크다운 가독성 우수 |
| 본문 스킬 참조를 `../skills/` 상대경로로 통일 | 에이전트 파일 위치 기준 자연스러운 상대경로 |
| pnpm 명령을 "프로젝트 스크립트" 표현으로 일반화 | 패키지 매니저 중립성 확보, `development-tools.mdc`에 pnpm 정의 이미 존재 |
| `add-svelte-component.md`의 `{ComponentName}` 유지 | 워크플로우 템플릿 패턴으로 프로젝트 참조가 아닌 생성 지시 |

## 발견된 이슈

| 이슈 | 해결 |
|------|------|
| QA 1차 검증에서 `buildEc5Url`, `ZeusEnvironment`, `CheckboxList` 4건 잔존 | 즉시 수정 후 재검증 통과 |
| `refactoring-patterns.md`가 원래 플랜에 없었으나 `QuickLoginSection` 발견 | QA 검증 단계에서 발견하여 추가 수정 |
| `stack/svelte/` 4개 파일에 잔여 참조 발견 | QA 전수 검색에서 발견하여 추가 수정 |
