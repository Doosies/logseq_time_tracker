---
name: orchestrator
description: 에이전트 오케스트레이션 및 워크플로우 관리 스킬. 태스크 분류, 품질 게이트 운영, 서브에이전트 조율, 병렬 실행, 진행률 모니터링에 사용합니다.
disable-model-invocation: true
---

# 오케스트레이터 스킬

메인 에이전트의 조율과 워크플로우 관리를 위한 메타 스킬입니다.

## 사용 시점

- 입력 태스크를 분류할 때(feature, bugfix, refactor, docs, hotfix, chore)
- 단계 간 품질 게이트를 관리할 때
- 서브에이전트 간 커뮤니케이션을 조율할 때
- 복잡한 작업을 하위 작업으로 분해할 때
- 하위 작업별 적절한 에이전트를 선택할 때
- 병렬 실행 전략을 설계할 때
- 워크플로우 진행 상황을 모니터링할 때

## 상세 레퍼런스

필요 시 아래 레퍼런스를 참조합니다.

### 태스크 관리
- `references/task-classifier.md` - 태스크 유형 분류 규칙
- `references/quality-gate.md` - 품질 게이트 기준 및 검증
- `references/workflow-manager.md` - 워크플로우 패턴 선택

### 서브에이전트 조율
- `references/subagent-communication.md` - 서브에이전트 커뮤니케이션 프로토콜
- `references/task-decomposition.md` - 태스크 분해 방법론

### 실행 관리
- `references/parallel-execution.md` - 병렬 실행 전략
- `references/workflow-orchestration.md` - 워크플로우 오케스트레이션 패턴
- `references/progress-monitoring.md` - 진행률 모니터링 및 보고
