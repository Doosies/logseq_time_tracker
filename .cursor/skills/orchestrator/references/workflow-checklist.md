# Plan Execution 워크플로우 체크리스트

## 각 단계별 필수 확인 사항

### 0단계: 사이클 메트릭 초기화 (필수)
- [ ] `.cursor/metrics/cycles/` 에 `YYYY-MM-DD-NNN.json` 생성
- [ ] `cycle_id`, `task_type`, `task_description`, `started_at` 기록
- [ ] 태스크 유형에 따른 수집 수준 확인 (Feature/Bugfix/Refactor = 전체, Chore = 최소)

### 1단계: 플랜 모드
- [ ] planner 서브에이전트 호출 (또는 메인이 Plan Mode)
- [ ] TODO 또는 플랜 파일 생성
- [ ] 각 작업에 서브에이전트 할당 명시
- [ ] 사용자 승인 확인

### 2단계: 실행
- [ ] **서브에이전트 호출** (developer/generalPurpose 등)
- [ ] ❌ 메인 에이전트 직접 코드 수정 금지 (1-2줄 오타만 허용)
- [ ] Task 도구 사용하여 서브에이전트에 명확한 작업 범위 전달

### 3단계: QA 검증
- [ ] **qa 서브에이전트 호출**
- [ ] ❌ 메인 에이전트 직접 테스트 실행 금지
- [ ] ReadLints → format → test → lint → type-check → build 순서 확인
- [ ] 스크립트명·순서: `.cursor-agent-config.yaml` 우선, 없으면 루트 `package.json`

### 4단계: 보안 검증 (Feature / Refactor / Bugfix 시)
- [ ] security 서브에이전트 호출
- [ ] Feature·Refactor: 설계 후 / 구현 후 / 배포 전 검증
- [ ] Bugfix: 구현 후 코드 검증 (main-orchestrator.mdc Bugfix 워크플로우와 일치)

### 5단계: 문서화 (선택적, Chore 시 스킵 가능)
- [ ] docs 서브에이전트 호출
- [ ] CHANGELOG, API 문서, design-tokens 업데이트

### 6단계: 커밋
- [ ] **git-workflow 서브에이전트 호출**
- [ ] ❌ 메인 에이전트 직접 커밋 금지 (직접 = git-workflow bypass)
- [ ] git-workflow 준비 후 `GIT_COMMANDS.md` 명령 실행 (메인 에이전트 또는 사용자)
- [ ] Conventional Commits 형식 준수
- [ ] `git push`는 사용자에게 요청

### 7단계: 시스템 개선 (선택적, Chore 시 스킵 가능)
- [ ] 메인 에이전트가 system-improvement 스킬 참조하여 직접 수행 (`.cursor/skills/system-improvement/SKILL.md`)
- [ ] 패턴/이슈 분석
- [ ] 개선 리포트 저장 (`.cursor/metrics/improvements/`)

### 8단계: 개선 후 커밋 (선택)
- [ ] 에이전트 정의 파일 수정 시 git-workflow 재호출

### 9단계: 최종 보고서 (필수) — `plan-execution-workflow.md` **10단계**와 동일

- [ ] 사이클 메트릭에 `completed_at`, `success` 기록
- [ ] `git diff --name-status`로 `files_changed` 수집
- [ ] `.cursor/metrics/reports/YYYY-MM-DD-NNN-description.md` 저장
- [ ] 사용자에게 보고서 출력
- [ ] 워크플로우 §10·`final-report-template.md` 절차 준수

> **번호 매핑**: 이 파일은 0단계(메트릭) 다음 **1~8단계**를 워크플로우 **2~9단계**에 대응시킨다(워크플로 **1단계** 사용자 요청 수신은 체크리스트에 생략). `plan-execution.md` 커맨드는 **0~10** 전 구간을 명시한다.

### 워크플로우 문서 동기화 (변경 시)

- [ ] `plan-execution-workflow.md` 변경 시 → `.cursor/commands/plan-execution.md` 요약 반영
- [ ] 단계 번호, 스킵 조건, Security 호출 시점이 양쪽에서 동일한지 확인

## 자가 점검 질문

### 코드를 직접 수정하려는 순간
- Q: "지금 내가 developer 서브에이전트를 호출해야 하는가?"
- A: YES → Task 도구 호출, NO → 1-2줄 오타 수정만 허용

### 테스트를 실행하려는 순간
- Q: "지금 내가 qa 서브에이전트를 호출해야 하는가?"
- A: YES → Task 도구 호출

### 커밋하려는 순간
- Q: "지금 내가 git-workflow 서브에이전트를 호출해야 하는가?"
- A: YES → Task 도구 호출

### 작업 완료 선언 전
- Q: "최종 보고서(워크플로우 **10단계**, 이 체크리스트 **9단계**)를 완료했는가?"
- A: NO → **작업 미완료, 보고서 작성 필수**
