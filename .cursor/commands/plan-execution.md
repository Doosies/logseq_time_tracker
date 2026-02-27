# 플랜 실행 워크플로우

사용자가 입력한 할 일을 플랜 모드로 시작해, 검증·커밋·개선·최종 보고까지 진행한다.

**사용법**: `/plan-execution [할 일]`  
예: `/plan-execution CSS 공통화`, `/plan-execution DnD 마이그레이션`

**원칙**:
- 진입 시점부터 9단계까지 순차 실행. 단계 생략 금지.
- **진입 가능 단계**: 1, 3, 5, 6, 7 (해당 단계부터 진행)
- **메인 에이전트 역할**: 방향결정, 판단, 작업 분배만. 실제 작업은 서브에이전트에 위임.
- **1~8단계**: 각 단계별 서브에이전트 활용. 9단계(최종 보고서)만 메인 에이전트가 직접 제출.

---

## 실행 순서

1. **플랜 모드 (planner)** ← planner 서브에이전트  
   - `.cursor/agents/planner.md` 참조  
   - 요구사항 분석, 작업 분해, TODO/플랜 파일 생성  
   - 각 작업에 서브에이전트 할당 (developer, planner, explore 등)  
   - 직렬/병렬 실행 순서 정의  
   - 사용자 승인 후 진행  

2. **실행** ← developer, planner, explore 서브에이전트  
   - 플랜에 따라 developer, planner, explore 서브에이전트 호출  

3. **QA 검증** ← qa 서브에이전트  
   - `.cursor/agents/qa.md` 참조  
   - `pnpm format` → `pnpm test` → `pnpm lint` → `pnpm type-check` → `pnpm build`  
   - 실패 시 원인 분석·수정·재검증  

4. **보안 검증** (Feature/Refactor 시) ← security 서브에이전트  
   - `.cursor/agents/security.md` 참조  

5. **문서화** ← docs 서브에이전트  
   - `.cursor/agents/docs.md` 참조  
   - CHANGELOG, API 문서, design-tokens 등 업데이트  

6. **커밋** ← git-workflow 서브에이전트  
   - `.cursor/agents/git-workflow.md` 참조  
   - Conventional Commits 형식, 논리적 단위로 분할  
   - `git push`는 사용자에게 요청  

7. **시스템 개선** ← system-improvement 서브에이전트  
   - `.cursor/agents/system-improvement.md` 참조  
   - 패턴/이슈 분석, 에이전트 규칙 개선 여부 판단  
   - 개선 시 `.cursor/metrics/improvements/` 에 리포트 저장  

8. **개선 후 커밋** (선택) ← git-workflow 서브에이전트  
   - 에이전트 정의 파일 수정 시 git-workflow로 추가 커밋  

9. **최종 보고서** (메인 에이전트 직접 제출)  
   - `.cursor/workflows/final-report-template.md` 형식으로 사용자에게 제출  

---

## 참고

- 상세 워크플로우: `.cursor/workflows/plan-execution-workflow.md`
