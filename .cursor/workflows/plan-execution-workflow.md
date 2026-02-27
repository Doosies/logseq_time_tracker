# 플랜 실행 워크플로우 (Plan Execution Workflow)

이 문서는 사용자 요청 → 플랜 수립 → 실행 → 검증 → 커밋 → 개선까지의 전체 워크플로우를 정의합니다.  
다음에 같은 방식으로 작업할 때 사용할 수 있는 템플릿입니다.

---

## 1. 사용자 요청 수신

사용자가 할 일을 받습니다.

---

## 2. 플랜 모드 시작 (Planner 개입)

**참조**: [`.cursor/agents/planner.md`](../agents/planner.md)

1. 요구사항 분석 및 목표 정의
2. 작업을 잘게 쪼개서 **TODO** 또는 **플랜 파일**로 생성
3. 각 작업에 **서브에이전트 할당** 명시
4. **직렬/병렬** 실행 순서 정의
   - 의존성이 있는 작업 → 직렬
   - 독립적인 작업 → 병렬
5. 사용자에게 플랜 확인 요청 후 승인 시 진행

---

## 3. 실행

플랜에 따라 서브에이전트를 호출합니다.

**주요 서브에이전트**:
- `developer`: 코드 구현, 리팩토링
- `planner`: 설계/계획 (필요 시)
- `explore`: 코드베이스 탐색 (필요 시)

---

## 4. 품질 보증 (QA) 단계

**참조**: [`.cursor/agents/qa.md`](../agents/qa.md)

모든 구현 작업 완료 후:

1. **검증 명령 실행**
   - `pnpm format`
   - `pnpm test`
   - `pnpm lint`
   - `pnpm type-check`
   - `pnpm build`
2. 실패 시 해당 서브에이전트가 **원인 분석 + 수정 + 재검증**
3. 검증 통과 후 다음 단계로 진행

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

모든 작업 완료 후:

1. **CHANGELOG** 업데이트
   - `packages/*/CHANGELOG.md`: 변경된 패키지별
2. **API 문서** 업데이트 (필요 시)
   - `packages/docs/api/*.md`
3. **설계 토큰** 문서 업데이트 (디자인 관련 변경 시)
   - `packages/docs/api/design-tokens.md`
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

**호출 시점**: 커밋 완료 후

1. 이번 세션에서 발생한 **패턴/이슈** 분석
2. 서브에이전트 정의 파일에 **개선이 필요한지** 판단
3. 개선 필요 시: `developer.md`, `qa.md`, `security.md`, `docs.md` 등에 규칙 추가/수정
4. 개선 결과를 `.cursor/metrics/improvements/` 에 리포트 저장

---

## 9. 개선 후 커밋 (선택)

**조건**: 8단계에서 에이전트 정의 파일을 수정한 경우

1. **git-workflow** 서브에이전트 재호출
2. `git add .cursor/agents/* .agents/skills/* .cursor/skills/*` 등
3. 커밋 메시지: `chore(agents): improve subagent rules based on session analysis`

---

## 10. 최종 보고서 제출

사용자에게 보고서를 제출합니다.  
템플릿은 [`.cursor/workflows/final-report-template.md`](final-report-template.md) 참조.

---

## 흐름도 요약

```
사용자 요청
    ↓
플랜 모드 (planner)
    ↓
실행 (developer / planner / explore)
    ↓
QA 검증 (qa)
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
최종 보고서 제출
```

---

## 사용자 트리거 방법

### 1. Cursor 명령어 (권장)

에이전트 입력창에 `/` 입력 후 `plan-execution` 선택:

```
/plan-execution [할 일]
```

예: `/plan-execution CSS 공통화`, `/plan-execution DnD 마이그레이션`

**위치**: `.cursor/commands/plan-execution/COMMAND.md`

### 2. 프롬프트로 요청

```
[할 일]을 진행해줘. 플랜 실행 워크플로우(@.cursor/workflows/plan-execution-workflow.md)대로 진행해줘.
```
