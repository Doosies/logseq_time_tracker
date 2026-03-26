# 플랜 실행 워크플로우

아래 내용을 읽은 뒤, 사용자가 입력한 할 일을 플랜 모드로 시작하고 서브에이전트에게 위임한 다음 최종 결과를 보고한다.

**원칙**:

- 진입 시점부터 **10단계**까지 순차 실행. 단계 생략 금지(스킵 조건에 해당할 때만 해당 단계 생략).
- **Chore 단순 작업** (스크립트 1줄 수정, 설정 변경 등): **6(문서화)**, **8(시스템 개선)** 단계 스킵 가능. **10단계(최종 보고서)**는 필수.
- **진입 가능 단계** (해당 단계부터 이어서 진행): 0, 2, 3, 4, 5, 6, 7, 8 (9는 8 이후 조건부)
- **진입 ≠ 종료**: 진입 단계 완료 후 반드시 다음 단계부터 **10단계(최종 보고서)**까지 진행. 예: "커밋 진행해줘" → 7단계 후 8→9(선택)→10 필수. "7만 하고 끝"은 금지.
- **메인 에이전트 역할**: 방향 결정, 판단, 작업 분배만. 실제 작업은 서브에이전트에 위임.
- **역할 분담**: **2~7·9단계**는 해당 서브에이전트(planner, developer, qa, security, docs, git-workflow) 호출. **0·1·8·10단계**는 메인 에이전트(8=system-improvement 스킬, 10=최종 보고서).
- **메인 에이전트 금지**: 코드 작성·테스트 실행·커밋 등 **위임 대상 작업**을 메인이 대신 수행하지 않음. 반드시 서브에이전트 호출. 예외: **8단계(시스템 개선)**는 메인이 스킬 참조하여 직접 수행.

**완료 전 필수**:

- 10단계(최종 보고서) 완료 전까지 "작업 완료" 선언 금지
- 10단계: 사이클 JSON에 `completed_at`/`success` 기록 + `reports/` 파일 저장

---

## 실행 순서 (워크플로우 0~10과 동일)

상세: `.cursor/workflows/plan-execution-workflow.md`

0. **사이클 메트릭 초기화** ← 메인 에이전트 직접  
   Feature/Bugfix/Refactor: `cycles/YYYY-MM-DD-NNN.json` 필수. Chore: 최소 수집. Docs/Hotfix: 스킵 가능.

1. **사용자 요청 수신** — 컨텍스트·목표 정리

2. **플랜 모드 (planner)** ← planner  
   TODO/플랜에 `[병렬-N]`/`[직렬-N]`, `담당: agent-name`, `선행: task-id` 필수. 참조: `.cursor/skills/planner/references/plan-todo-format.md`  
   사용자 승인 후 진행

3. **실행** ← developer 등 플랜 할당 에이전트

4. **QA 검증** ← qa  
   ReadLints → `format` → `test` → `lint` → `type-check` → `build` (존재하는 항목만). 스크립트 출처: **`.cursor-agent-config.yaml` 우선**, 없으면 루트 `package.json`.

5. **보안 검증** ← security  
   **Feature, Refactor, Bugfix** 시 (main-orchestrator.mdc 태스크 분류와 일치). 호출 시점·범위는 워크플로우 §5 참조.

6. **문서화** ← docs (Chore 단순 시 스킵 가능)

7. **커밋** ← git-workflow (`git push`는 사용자에게 요청)

8. **시스템 개선** ← 메인 에이전트 (`system-improvement` 스킬, Chore 단순 시 스킵 가능)

9. **개선 후 커밋** (선택) ← git-workflow (에이전트 정의·스킬 규칙 파일 수정 시)

10. **최종 보고서** ← 메인 에이전트  
    `cycles/` JSON 완료 필드 + `final-report-template.md` 형식 + `metrics/reports/YYYY-MM-DD-NNN-description.md` 저장

---

## 참고

- 상세 워크플로우: `.cursor/workflows/plan-execution-workflow.md`
- 메인 에이전트 규칙: `.cursor/rules/main-orchestrator.mdc`
