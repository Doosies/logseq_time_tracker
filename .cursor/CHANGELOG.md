# Changelog

All notable changes to the Cursor 에이전트 시스템 will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **플랜 TODO 작성 형식 개선** (2026-03-09)
  - TODO 작성 시 서브에이전트 할당, 실행 순서(직렬/병렬), 선행 조건 명시 필수화
  - 새 레퍼런스 문서: `.cursor/skills/planner/references/plan-todo-format.md`
  - 필수 형식: `[병렬-N|직렬-N] 작업 설명 (담당: agent-name, 선행: task-id)`
- verification_checklist frontmatter를 quality-gate.md에 추가하여 품질 게이트 자동화
- LLM 특성 대응 체크리스트 추가 (다중 검증, 증거 기록, 추정 회피, 불확실성 표시)
- 금지사항 문서 (prohibited-practices.md) 추가: 코드/테스트/문서 작성 시 금지 패턴 정의
- 파일 상태 결정 가이드 (file-status-guide.md) 추가: NEW/UPDATE/DELETE/UNCHANGED 기준
- 도메인 특화 워크플로우 2개 추가:
  - add-svelte-component.md: Svelte 5 컴포넌트 추가 절차
  - add-api-endpoint.md: RESTful API 엔드포인트 추가 절차
- diagram-rule.mdc 추가: Mermaid 다이어그램 작성 규칙

### Changed

- **planner 에이전트**: TODO 작성 규칙 섹션 추가
- **planner SKILL**: plan-todo-format 참조 추가
- **plan-execution-workflow**: 2단계 상세화, TODO 형식 예시 추가
- **plan-execution 커맨드**: TODO 형식 예시 추가
- plan-execution-workflow.md에 단계별 skill/reference 로드 패턴 추가
- plan-execution-workflow.md에 user-ai MCP 도구 활용 예시 추가 (0단계, 10단계)
- main-orchestrator.mdc에 MCP 도구 자동화 안내 추가
- docs.md에 initialize_report_file 활용 예시 추가
- developer/SKILL.md에 prohibited-practices, file-status-guide 참조 추가
- qa/SKILL.md에 prohibited-practices 참조 추가

### Improved

- 컨텍스트 크기 최적화: 단계별 필요한 skill만 로드
- cycle/report 파일 생성 자동화: MCP 도구 활용 가능
- 품질 게이트 강화: verification_checklist frontmatter
- LLM 추측·과신 방지: 증거 기반 검증 체크리스트

### Technical

- 서브에이전트 목록: developer, qa, docs, security, planner, git-workflow, system-improvement
- 직렬/병렬 결정 기준: 의존성, 파일 충돌, 워크플로우 단계
- 체크리스트: 모든 TODO에 순서/담당/선행 포함 검증

### Impact

- 플랜 작성 프로세스 명확화로 실행 효율성 향상
- 병렬 실행 가능 작업의 자동 식별
- 메인 에이전트가 추가 해석 없이 실행 순서 파악 가능
