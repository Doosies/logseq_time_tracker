---
name: plan-todo-format
description: 플랜/TODO 작성 시 서브에이전트 할당, 실행 순서(직렬/병렬), 선행 조건 형식 가이드
---

# 플랜 TODO 형식

플랜 모드에서 TODO 또는 플랜 파일을 작성할 때 **반드시** 다음 정보를 포함합니다.

## 필수 형식

### content 형식

```
[병렬-N|직렬-N] 작업 설명 (담당: agent-name, 선행: task-id)
```

- **실행 순서**: `[병렬-N]` 또는 `[직렬-N]` (N: 1, 2, 3...)
  - 동일 N → 병렬 실행 가능
  - 다른 N → 직렬 실행 (낮은 N 우선)
- **담당 서브에이전트**: `담당: agent-name` (필수)
- **선행 조건**: `선행: task-id` (의존 관계 있을 때만, 여러 개는 쉼표 구분)

### YAML frontmatter 예시

```yaml
todos:
  - id: impl-api
    content: "[직렬-1] 회원가입 API 구현 (담당: developer)"
    status: pending
  - id: test-api
    content: "[직렬-2] API 테스트 작성 (담당: qa, 선행: impl-api)"
    status: pending
  - id: doc-api
    content: "[병렬-1] API 문서 업데이트 (담당: docs, 선행: impl-api)"
    status: pending
```

---

## 서브에이전트 목록 및 역할

| agent | 역할 | 할당 기준 |
|-------|------|-----------|
| **planner** | 요구사항 분석, 아키텍처 설계, 작업 분해 | 설계/계획 필요 시 |
| **developer** | 코드 구현, 리팩토링, 설정 변경 | 코드/설정 수정 |
| **qa** | 테스트 작성, 품질 검증, ReadLints/type-check | 테스트, 검증 |
| **docs** | CHANGELOG, README, API 문서 | 문서 업데이트 |
| **security** | 보안 검증, 취약점 스캔 | Feature/Refactor 배포 전 |
| **git-workflow** | 커밋 메시지, PR 설명, 커밋 분할 | 코드 변경 완료 후 |

---

## 직렬/병렬 결정 기준

### 직렬 실행 (의존성 있음)

- 선행 작업의 **출력(파일, API)** 이 후행 작업의 **입력**으로 필요
- 같은 파일을 수정 (충돌 방지)
- 워크플로우 단계상 순서가 있음 (구현 → QA → docs → git-workflow)

**예시**:
```markdown
[직렬-1] User 모델 정의 (담당: developer)
[직렬-2] 회원가입 API 구현 (담당: developer, 선행: user-model)
[직렬-3] API 테스트 작성 (담당: qa, 선행: impl-register)
```

### 병렬 실행 (독립적)

- 서로 **다른 파일** 수정
- 데이터/코드 **의존성 없음**
- 리소스 충돌 없음

**예시**:
```markdown
[병렬-1] CheckboxList DnD 마이그레이션 (담당: developer)
[병렬-2] QuickLoginSection DnD 마이그레이션 (담당: developer)
```

### 혼합 패턴

```markdown
[직렬-1] uikit Dnd 프리미티브 교체 (담당: developer)
[병렬-1] App.svelte DnD 업데이트 (담당: developer, 선행: primitives)
[병렬-2] QuickLoginSection DnD 업데이트 (담당: developer, 선행: primitives)
[직렬-2] 테스트/스토리 수정 (담당: qa, 선행: app-update, quick-update)
```

---

## 워크플로우 단계별 서브에이전트

일반적 순서 (태스크 유형에 따라 일부 생략):

1. **planner** — 요구사항 분석, 플랜/TODO 생성 (직렬-1)
2. **developer** — 코드 구현 (직렬-2 또는 병렬)
3. **qa** — 테스트, 검증 (developer 이후)
4. **security** — 보안 검증 (Feature/Refactor 시)
5. **docs** — 문서 업데이트 (구현 완료 후)
6. **git-workflow** — 커밋/PR (QA+docs 통과 후)

---

## 체크리스트

플랜 작성 완료 전 확인:

- [ ] 모든 TODO에 `[병렬-N]` 또는 `[직렬-N]` 포함
- [ ] 모든 TODO에 `담당: agent-name` 포함
- [ ] 의존 관계 있는 TODO에 `선행: task-id` 포함
- [ ] 병렬 TODO는 서로 다른 파일 수정 (충돌 없음)
- [ ] 직렬 TODO는 의존성 순서가 맞음
- [ ] 실행 흐름도 또는 표로 전체 순서 명시 (복잡한 플랜 시)

---

## 완료 기준

- [ ] plan-todo-format.md 참조하여 TODO 작성
- [ ] 각 TODO가 실행 가능한 수준으로 구체적
- [ ] 메인 에이전트가 추가 해석 없이 실행 순서 파악 가능
