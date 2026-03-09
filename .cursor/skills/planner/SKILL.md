---
name: planner
description: "요구사항 분석 및 시스템 아키텍처 설계 스킬. 새 기능 요구사항 분석, RESTful API 설계, 기술 스택 선정, 데이터 모델 설계 시 사용합니다."
---

# 기획 스킬

요구사항 분석과 아키텍처 설계를 위한 전문 스킬입니다.

## 사용 시점

- 새 기능 요구사항을 분석할 때
- 시스템 아키텍처를 설계할 때
- RESTful API를 설계할 때
- 기술 스택을 선정하고 근거를 정리할 때
- 데이터 모델을 설계할 때

## 핵심 원칙

- 리소스 중심 URL 설계(동사보다 명사)
- 기존 시스템과 일관된 아키텍처 유지
- 제약사항과 트레이드오프 문서화
- 테스트 가능한 구조로 설계

## 상세 레퍼런스

필요 시 아래 레퍼런스를 참조합니다.

- `references/requirement-analysis.md` - 요구사항 분석 방법론
- `references/architecture-design.md` - 아키텍처 설계 패턴
- `references/api-design.md` - RESTful API 설계 가이드
- `references/plan-todo-format.md` - **플랜/TODO 작성 형식** (서브에이전트 할당, 직렬/병렬 순서, 선행 조건)

## 플랜/TODO 작성 시 (필수)

플랜 모드에서 TODO 또는 플랜 파일을 작성할 때 **반드시** `references/plan-todo-format.md`를 참조합니다.

- 각 TODO에 `[병렬-N]` 또는 `[직렬-N]` 포함
- 각 TODO에 `담당: agent-name` 포함
- 의존 관계가 있으면 `선행: task-id` 포함
