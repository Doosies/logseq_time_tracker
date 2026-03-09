# 플랜 실행 워크플로우 (Plan Execution Workflow)

이 문서는 사용자 요청 → 플랜 수립 → 실행 → 검증 → 커밋 → 개선까지의 전체 워크플로우를 정의합니다.
다음에 같은 방식으로 작업할 때 사용할 수 있는 템플릿입니다.

---

## 0. 사이클 메트릭 초기화

**실행 주체**: 메인 에이전트 직접
**호출 시점**: 사용자 요청 수신 직후, 플랜 모드 시작 전
**적용 기준**: main-orchestrator.mdc의 메트릭 수집 > 적용 기준 참조

| 태스크 유형 | 수집 수준 |
|---|---|
| Feature / Bugfix / Refactor | 전체 수집 (필수) |
| Chore | 최소 수집 (cycle_id + 시간 + 성공 여부) |
| Docs / Hotfix | 스킵 가능 |

**절차**:
1. `.cursor/metrics/cycles/` 내 오늘 날짜(`YYYY-MM-DD-*`) 파일 수로 시퀀스 번호(NNN) 결정
2. `cycle-template.json` 기반으로 `.cursor/metrics/cycles/YYYY-MM-DD-NNN.json` 생성
3. `cycle_id`, `task_type`, `task_description`, `started_at` 기록

**업데이트 포인트** (이후 단계에서 메인 에이전트가 사이클 파일에 누적 기록):
- 에이전트 호출 후: `workflow[]`, `agents.{name}` 업데이트
- 품질 게이트 후: `quality_gates` 업데이트
- 이슈/결정 발생 시: `issues_encountered[]`, `decisions[]` 추가
- 사이클 완료 (10단계): `completed_at`, `success`, `files_changed` 기록

---

## 1. 사용자 요청 수신

사용자가 할 일을 받습니다.

---

## 2. 플랜 모드 시작 (Planner 개입)

**참조**: [`.cursor/agents/planner.md`](../agents/planner.md), [`.cursor/skills/planner/references/plan-todo-format.md`](../skills/planner/references/plan-todo-format.md)

1. 요구사항 분석 및 목표 정의
2. 작업을 잘게 쪼개서 **TODO** 또는 **플랜 파일**로 생성
3. **각 TODO에 반드시 포함** (plan-todo-format.md 참조):
   - **실행 순서**: `[병렬-N]` 또는 `[직렬-N]` (동일 N = 병렬, 다른 N = 직렬-낮은 N 우선)
   - **담당 서브에이전트**: developer, qa, docs, security, planner, git-workflow
   - **선행 조건**: 의존 관계 있을 시 `선행: task-id` 명시
4. 직렬/병렬 결정 기준:
   - 의존성이 있는 작업 → 직렬
   - 독립적인 작업(서로 다른 파일) → 병렬
5. 사용자에게 플랜 확인 요청 후 승인 시 진행
6. **설계 결정사항 기록**: planner가 보고한 주요 의사결정(결정 + 근거 + 대안)을 사이클 메트릭의 `decisions[]`에 수집

**TODO 형식 예시**:
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

## 3. 실행

플랜에 따라 서브에이전트를 호출합니다.

**주요 서브에이전트**:
- `developer`: 코드 구현, 리팩토링
- `planner`: 설계/계획 (필요 시)
- `explore`: 코드베이스 탐색 (필요 시)

**결정/이슈 수집**:
- 각 서브에이전트 완료 시 보고된 결정사항(decisions)과 이슈(issues)를 사이클 메트릭에 누적
- 방향 전환/재시도 발생 시 해당 내용도 `issues_encountered[]`에 기록

---

## 4. 품질 보증 (QA) 단계

**참조**: [`.cursor/agents/qa.md`](../agents/qa.md)

모든 구현 작업 완료 후:

1. **검증 명령 실행**
   - ReadLints (변경된 파일 경로 지정)
   - `pnpm format`
   - `pnpm test`
   - `pnpm lint`
   - `pnpm type-check`
   - `pnpm build`
2. 실패 시 해당 서브에이전트가 **원인 분석 + 수정 + 재검증**
3. 검증 통과 후 다음 단계로 진행
4. QA에서 발견된 이슈를 사이클 메트릭의 `issues_encountered[]`에 수집

---

## 5. 보안 검증 (Security) 단계

**참조**: [`.cursor/agents/security.md`](../agents/security.md)

**호출 시점**: Feature, Refactor 워크플로우의 설계 후 / 구현 후 / 배포 전

- 코드 보안 취약점 스캔
- 민감 정보 탐지
- 입력 검증 누락 체크
- 외부 API 호출 및 사용자 입력 검증

---

## 6. 문서화 (Docs) 단계

**참조**: [`.cursor/agents/docs.md`](../agents/docs.md)

**스킵 가능**: Chore 단순 작업(스크립트 1줄 수정, 설정 변경 등) 시 스킵.

모든 작업 완료 후:

1. **CHANGELOG** 업데이트
   - `packages/*/CHANGELOG.md`: 변경된 패키지별
2. **API 문서** 업데이트 (필요 시)
3. **설계 토큰** 문서 업데이트 (디자인 관련 변경 시)
4. **README** 업데이트 (필요 시)

---

## 7. 커밋 (Git-Workflow) 단계

**참조**: [`.cursor/agents/git-workflow.md`](../agents/git-workflow.md)

**호출 시점**: QA + Docs + Security 검증 통과 후

1. 변경 사항 분석
2. **Conventional Commits** 형식으로 커밋 메시지 생성
3. 논리적 단위로 **커밋 분할** (필요 시)
4. `git add` + `git commit` 실행
5. **주의**: `git push`는 사용자에게 요청하도록 함

---

## 8. 시스템 개선 (System-Improvement) 단계

**참조**: [`.cursor/agents/system-improvement.md`](../agents/system-improvement.md)

**호출 시점**: 커밋 완료 후. **스킵 가능**: Chore 단순 작업 시 스킵.

1. 이번 세션에서 발생한 **패턴/이슈** 분석
2. 서브에이전트 정의 파일에 **개선이 필요한지** 판단
3. 개선 필요 시: `developer.md`, `qa.md`, `security.md`, `docs.md` 등에 규칙 추가/수정
4. 개선 결과를 `.cursor/metrics/improvements/` 에 리포트 저장

---

## 9. 개선 후 커밋 (선택)

**조건**: 8단계에서 에이전트 정의 파일을 수정한 경우

1. **git-workflow** 서브에이전트 재호출
2. `git add .cursor/agents/* .cursor/skills/*` 등
3. 커밋 메시지: `chore(agents): improve subagent rules based on session analysis`

---

## 10. 최종 보고서 제출

1. **사이클 메트릭 완료 기록**: `.cursor/metrics/cycles/YYYY-MM-DD-NNN.json`에 `completed_at`, `success`, `files_changed` 기록
2. 사이클 메트릭의 `decisions[]`와 `issues_encountered[]`를 보고서에 반영
3. `.cursor/workflows/final-report-template.md` 형식으로 보고서 작성
4. **파일 저장**: `.cursor/metrics/reports/YYYY-MM-DD-NNN-description.md`로 저장
   - NNN: 동일 날짜 내 3자리 제로패딩 시퀀스
   - description: 작업 내용 요약 (한글 가능)
5. 사용자에게 보고서 출력

---

## 흐름도 요약

```
사용자 요청
    ↓
사이클 메트릭 초기화 (메인 에이전트) [0단계]
    ↓
플랜 모드 (planner)
    ↓
실행 (developer / planner / explore)
    ↓
QA 검증 (qa) — ReadLints + pnpm format/test/lint/type-check/build
    ↓
보안 검증 (security) [선택]
    ↓
문서화 (docs)
    ↓
커밋 (git-workflow)
    ↓
시스템 개선 (system-improvement)
    ↓
개선 시 → 커밋 (git-workflow)
    ↓
최종 보고서 제출 + 파일 저장 (metrics/reports/)
```

---

## 사용자 트리거 방법

### 1. Cursor 명령어 (권장)

에이전트 입력창에 `/` 입력 후 `plan-execution` 선택:

```
/plan-execution [할 일]
```

예: `/plan-execution CSS 공통화`, `/plan-execution DnD 마이그레이션`

**위치**: `.cursor/commands/plan-execution.md`

### 2. 프롬프트로 요청

```
[할 일]을 진행해줘. 플랜 실행 워크플로우(@.cursor/workflows/plan-execution-workflow.md)대로 진행해줘.
```
