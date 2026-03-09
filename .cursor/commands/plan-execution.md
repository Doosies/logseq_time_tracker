# 플랜 실행 워크플로우

아래 내용들을 꼼꼼하게 읽은후, 사용자가 입력한 할 일을 플랜 모드로 시작해, 서브에이전트에게 작업을 위임한다. 그 후 최종 결과를 사용자에게 보고한다.

**원칙**:

- 진입 시점부터 9단계까지 순차 실행. 단계 생략 금지.
- **Chore 단순 작업** (스크립트 1줄 수정, 설정 변경 등): 5(문서화), 7(시스템 개선) 단계 스킵 가능. 9단계(최종 보고서)는 필수.
- **진입 가능 단계**: 0, 1, 3, 5, 6, 7 (해당 단계부터 진행)
- **진입 ≠ 종료**: 진입 단계는 시작점일 뿐. 해당 단계 완료 후 반드시 다음 단계부터 9단계(최종 보고서)까지 이어서 진행. 예: "커밋 진행해줘" → 6단계 수행 후 7→8→9 필수 진행. "6만 하고 끝"은 금지.
- **메인 에이전트 역할**: 방향결정, 판단, 작업 분배만. 실제 작업은 서브에이전트에 위임.
- **0~8단계**: 각 단계별 서브에이전트 활용. 9단계(최종 보고서)만 메인 에이전트가 직접 제출.
- **메인 에이전트 금지**: 0~8단계의 실제 작업(코드 작성, 커밋, 테스트 실행 등) 직접 수행 금지. 반드시 해당 서브에이전트 호출.

---

## 실행 순서

0. **사이클 메트릭 초기화** ← 메인 에이전트 직접
    - Feature/Bugfix/Refactor: `.cursor/metrics/cycles/YYYY-MM-DD-NNN.json` 생성 (필수)
    - Chore: 최소 수집 (cycle_id + 시간 + 성공 여부만)
    - Docs/Hotfix: 스킵 가능
    - 상세: `.cursor/workflows/plan-execution-workflow.md` 0단계

1. **플랜 모드 (planner)** ← planner 서브에이전트
    - 요구사항 분석, 작업 분해, TODO/플랜 파일 생성
    - **각 TODO에 필수 포함**: `[병렬-N]`/`[직렬-N]` + `담당: agent-name` + `선행: task-id` (의존 시)
    - 참조: `.cursor/skills/planner/references/plan-todo-format.md`
    - 예시:
      ```yaml
      - id: impl-api
        content: "[직렬-1] 회원가입 API 구현 (담당: developer)"
      - id: test-api
        content: "[직렬-2] API 테스트 작성 (담당: qa, 선행: impl-api)"
      - id: doc-api
        content: "[병렬-1] API 문서 업데이트 (담당: docs, 선행: impl-api)"
      ```
    - 사용자 승인 후 진행

2. **실행** ← 위에서 할당된 서브에이전트들을 통해 작업 진행

3. **QA 검증** ← qa 서브에이전트
    - ReadLints (변경 파일) → `pnpm format` → `pnpm test` → `pnpm lint` → `pnpm type-check` → `pnpm build`
    - 실패 시 원인 분석·수정·재검증

4. **보안 검증** (Feature/Refactor 시) ← security 서브에이전트

5. **문서화** ← docs 서브에이전트
    - CHANGELOG, API 문서, design-tokens 등 업데이트

6. **커밋** ← git-workflow 서브에이전트
    - Conventional Commits 형식, 논리적 단위로 분할
    - `git push`는 사용자에게 요청

7. **시스템 개선** ← system-improvement 서브에이전트
    - 패턴/이슈 분석, 에이전트 규칙 개선 여부 판단
    - 개선 시 `.cursor/metrics/improvements/` 에 리포트 저장

8. **개선 후 커밋** (선택) ← git-workflow 서브에이전트
    - 에이전트 정의 파일 수정 시 git-workflow로 추가 커밋

9. **최종 보고서** (메인 에이전트 직접 제출)
    - 사이클 메트릭 완료 기록 (`.cursor/metrics/cycles/` JSON 파일에 `completed_at`, `success` 기록)
    - `.cursor/workflows/final-report-template.md` 형식으로 사용자에게 제출
    - `.cursor/metrics/reports/YYYY-MM-DD-NNN-description.md`로 저장

---

## 참고

- 상세 워크플로우: `.cursor/workflows/plan-execution-workflow.md`
- 메인 에이전트 규칙: `.cursor/rules/main-orchestrator.mdc`
