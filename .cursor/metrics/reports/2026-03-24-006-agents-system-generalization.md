# 사이클 2026-03-24-006 — 에이전트 시스템 일반화 커밋

## 요약

에이전트 정의·도메인 스킬·워크플로우·커맨드 문서에서 프로젝트 특정 참조를 플레이스홀더로 치환하고, 패키지 매니저 표현을 중립화하며 스킬 참조 경로를 상대경로로 통일하는 변경을 단일 커밋으로 반영했다.

## 커밋

- 해시: `a0ca77f` (로컬 기준, 푸시 후 원격과 동기화)
- 메시지: `refactor(agents): 에이전트·스킬·워크플로우 프로젝트 특정 참조 일반화`

## 스테이징에서 제외한 항목

- `docs/`, `packages/`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` 등 에이전트 일반화와 무관한 변경
- `.cr-rag-data/`, `.cr-rag-data-e2e/`, `chroma/` (사용자 지시)
- `.cursor/metrics/improvements/2026-03-23-001-cr-rag-mcp-phase1a-system-improvement.md` 및 기타 미추적 사이클·리포트(타 작업 혼입 방지)
- `.cursor/skills/developer/SKILL.md`, `.cursor/skills/qa/SKILL.md`: `git diff`상 내용 변경 없음(CRLF 경고만)

## 통계

- 변경 파일: 28 (문서 27 + 사이클 JSON 1)
- +204 / -118 줄 (캐시된 커밋 기준)
