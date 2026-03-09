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

### Changed

- **planner 에이전트**: TODO 작성 규칙 섹션 추가
- **planner SKILL**: plan-todo-format 참조 추가
- **plan-execution-workflow**: 2단계 상세화, TODO 형식 예시 추가
- **plan-execution 커맨드**: TODO 형식 예시 추가

### Technical

- 서브에이전트 목록: developer, qa, docs, security, planner, git-workflow, system-improvement
- 직렬/병렬 결정 기준: 의존성, 파일 충돌, 워크플로우 단계
- 체크리스트: 모든 TODO에 순서/담당/선행 포함 검증

### Impact

- 플랜 작성 프로세스 명확화로 실행 효율성 향상
- 병렬 실행 가능 작업의 자동 식별
- 메인 에이전트가 추가 해석 없이 실행 순서 파악 가능
