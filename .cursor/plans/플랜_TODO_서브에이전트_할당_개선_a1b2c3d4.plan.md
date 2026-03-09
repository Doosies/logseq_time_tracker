---
name: 플랜 TODO 서브에이전트 할당 개선
overview: 플랜 작성 시 TODO에 서브에이전트 할당, 실행 순서(직렬/병렬), 선행 조건을 명시하도록 planner 에이전트 및 관련 문서를 개선합니다.
todos:
  - id: plan-doc-ref
    content: "[직렬-1] plan-todo-format.md 레퍼런스 문서 신규 작성 (담당: planner)"
    status: pending
  - id: update-planner-agent
    content: "[직렬-2] planner.md에 TODO 작성 규칙 및 형식 섹션 추가 (담당: planner, 선행: plan-doc-ref)"
    status: pending
  - id: update-planner-skill
    content: "[직렬-3] planner SKILL.md에 plan-todo-format 참조 및 체크리스트 추가 (담당: planner, 선행: plan-doc-ref)"
    status: pending
  - id: update-workflow-cmd
    content: "[병렬-1] plan-execution-workflow.md 2단계 상세화 + plan-execution.md TODO 형식 예시 추가 (담당: planner, 선행: plan-doc-ref)"
    status: pending
isProject: false
---

# 플랜 TODO 서브에이전트 할당 및 실행 순서 개선

## 현황 분석

### 현재 문제점

1. **서브에이전트 할당 누락**: 플랜 작성 시 TODO만 나열하고, 어떤 서브에이전트가 처리할지 명시하지 않음
2. **실행 순서 불명확**: 직렬/병렬 실행 순서가 플랜에 없어 비효율적인 순차 실행 가능성
3. **선행 조건 부재**: 의존 관계가 있는 작업 간 선행 조건이 명시되지 않음
4. **사용자 수동 요청 의존**: 이전 사이클(2026-03-09-008)에서 사용자가 직접 "병렬-1 (developer) → 직렬-2 (qa) → 직렬-3 (docs)"를 요청했으며, 이는 기본값이어야 함

### 기존 관련 내용

- `plan-execution-workflow.md` 2단계: "각 작업에 **서브에이전트 할당** 명시", "**직렬/병렬** 실행 순서 정의" — 이미 언급됐으나 구체적 형식/강제 없음
- `plan-execution.md`: "각 작업에 서브에이전트 할당 (developer, planner 등)", "직렬/병렬 실행 순서 정의" — 마찬가지
- `planner.md`: TODO 형식, 서브에이전트 할당, 실행 순서에 대한 명시적 규칙 없음
- `이슈_방향결정_기록_시스템`: TODOs에 agent/순서 없음
- `dnd-kit_전체_마이그레이션`: 본문에 실행 전략 있으나 YAML todos에는 agent/순서 없음

### 성공 사례 참조

- **2026-03-09-008** 리포트: `병렬-1 (developer) → 직렬-2 (qa) → 직렬-3 (docs)` 형식 사용
- **task-decomposition.md**: 서브태스크 템플릿에 `에이전트`, `의존성(선행/후행)`, `예상 시간` 포함
- **parallel-execution.md**: 병렬화 조건, 동기화 포인트

---

## 개선 요구사항

1. **담당 서브에이전트**: developer, qa, docs, security, planner, git-workflow, system-improvement
2. **실행 순서**: 병렬-N, 직렬-N (동일 N은 병렬, 다른 N은 직렬-낮은 N 우선)
3. **선행 조건**: 있는 경우 `선행: task-id` 명시

---

## 변경 파일 및 수정 내용

### 1. `.cursor/skills/planner/references/plan-todo-format.md` (신규)

**목적**: TODO 작성 시 준수할 형식 및 규칙 정의

**내용**:

- TODO content 형식: `[병렬-N|직렬-N] 작업 설명 (담당: agent-name, 선행: task-id)`
- 서브에이전트 목록 및 역할 매핑
- 직렬/병렬 결정 기준 (의존성, 파일 충돌, 워크플로우 단계)
- YAML frontmatter todos 예시
- 체크리스트: 각 TODO에 agent, order, prerequisites 포함 여부

### 2. `.cursor/agents/planner.md`

**추가 위치**: "작업 프로세스" 섹션 내 또는 "품질 게이트" 전

**추가 내용**:

```markdown
### TODO 작성 규칙 (필수)

플랜/TODO 작성 시 각 항목에 반드시 포함:
- **실행 순서**: [병렬-N] 또는 [직렬-N] (N: 1, 2, 3... 동일 N은 병렬)
- **담당 서브에이전트**: developer, qa, docs, security, planner, git-workflow
- **선행 조건**: 의존 관계 있을 시 `선행: task-id` 명시

참조: `.cursor/skills/planner/references/plan-todo-format.md`
```

### 3. `.cursor/skills/planner/SKILL.md`

**추가**:

- 상세 레퍼런스 목록에 `references/plan-todo-format.md` 추가
- "플랜/TODO 작성 시" 사용 시점에 plan-todo-format 참조 명시

### 4. `.cursor/workflows/plan-execution-workflow.md`

**2단계 "플랜 모드 시작" 강화**:

- TODO 형식 예시 블록 추가
- "각 TODO에 (담당, 순서, 선행) 포함" 체크 항목 추가

### 5. `.cursor/commands/plan-execution.md`

**1단계 "플랜 모드" 강화**:

- TODO 형식 예시 추가:

```
  - id: impl-api
    content: "[직렬-1] 회원가입 API 구현 (담당: developer)"
  - id: test-api
    content: "[직렬-2] API 테스트 작성 (담당: qa, 선행: impl-api)"
  - id: doc-api
    content: "[병렬-1] API 문서 업데이트 (담당: docs, 선행: impl-api)"
  

```

---

## 실행 순서 (이 플랜의 TODO)


| 순서   | TODO ID              | 담당      | 선행           | 비고                          |
| ---- | -------------------- | ------- | ------------ | --------------------------- |
| 직렬-1 | plan-doc-ref         | planner | -            | 레퍼런스 문서 먼저 작성               |
| 직렬-2 | update-planner-agent | planner | plan-doc-ref |                             |
| 직렬-3 | update-planner-skill | planner | plan-doc-ref |                             |
| 병렬-1 | update-workflow-cmd  | planner | plan-doc-ref | workflow + command 동시 수정 가능 |


---

## TODO 형식 템플릿 (출력 시 사용)

```yaml
todos:
  - id: task-id
    content: "[병렬-1|직렬-2] 작업 설명 (담당: agent-name, 선행: task-id)"
    status: pending
```

**예시 (Chore: 스크립트 실행 시점 기본값 설정)**:

```yaml
todos:
  - id: impl-ui
    content: "[병렬-1] ScriptEditor run_at UI 숨기기 + user_scripts 마이그레이션 (담당: developer)"
    status: pending
  - id: update-tests
    content: "[직렬-2] document_start 테스트 주석 처리 (담당: qa, 선행: impl-ui)"
    status: pending
  - id: update-docs
    content: "[직렬-3] README/CHANGELOG 업데이트 (담당: docs, 선행: impl-ui)"
    status: pending
```

**예시 (Feature: 사용자 인증)**:

```yaml
todos:
  - id: design
    content: "[직렬-1] 인증 API 설계 및 데이터 모델 (담당: planner)"
    status: pending
  - id: impl-register
    content: "[병렬-1] 회원가입 API 구현 (담당: developer, 선행: design)"
    status: pending
  - id: impl-login
    content: "[병렬-2] 로그인 API 구현 (담당: developer, 선행: design)"
    status: pending
  - id: test-auth
    content: "[직렬-2] 인증 통합 테스트 (담당: qa, 선행: impl-register, impl-login)"
    status: pending
  - id: doc-auth
    content: "[직렬-3] API 문서 업데이트 (담당: docs, 선행: test-auth)"
    status: pending
```

---

## 품질 기준

- plan-todo-format.md가 모든 서브에이전트와 직렬/병렬 기준을 명확히 정의
- planner.md에서 TODO 작성 규칙을 "필수"로 명시
- planner SKILL에서 plan-todo-format을 참조
- plan-execution-workflow와 plan-execution 커맨드에 예시 포함
- 이 플랜의 TODOs 자체가 새 형식을 따른다

