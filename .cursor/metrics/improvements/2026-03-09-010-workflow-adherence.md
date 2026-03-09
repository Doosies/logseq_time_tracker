# 워크플로우 준수 실패 분석 및 에이전트 규칙 개선

**일시**: 2026-03-09
**사이클 ID**: 2026-03-09-010
**태스크 유형**: Bugfix (중첩 스크롤바 수정)
**분석 대상**: 메인 에이전트의 plan-execution 워크플로우 미준수, 서브에이전트 위임 누락

---

## 1. 분석 결과 요약

| 항목 | 결과 | 근거 |
|------|------|------|
| **개선 필요** | **Yes** | 5건 규칙·프로세스 보강 권장 |
| 근본 원인 | 3가지 식별 | 단순 작업 편의성 편향, 완료 전 검증 부재, 체크포인트 산재 |
| main-orchestrator | 보완 필요 | 완료 전 필수 단계 블록 추가 |
| plan-execution | 보완 필요 | 9단계 완료 전 "작업 완료" 금지 명시 |
| workflow-checklist | 보완 필요 | Bugfix 4단계(Security) 명시, 완료 전 9단계 체크 강화 |

---

## 2. 발생 이슈 상세

### 2.1 누락/미수행 단계

| 단계 | 기대 | 실제 | 영향 |
|------|------|------|------|
| 0단계 (사이클 초기화) | 워크플로우 시작 시 JSON 생성 | 사후 생성 또는 타이밍 불명확 | 메트릭 추적 일관성 |
| 3단계 (QA 검증) | qa 서브에이전트 호출, format→test→lint→type-check→build 전체 실행 | **메인 에이전트 직접** readlints, type-check, test만 실행. format, lint, build 누락 | 품질 게이트 불완전, 위임 원칙 위반 |
| 4단계 (보안 검증) | Bugfix 시 Security(코드) 호출 | 스킵 | main-orchestrator Bugfix 흐름 미준수 |
| 5단계 (문서화) | docs 서브에이전트 호출 | 스킵 | CHANGELOG 등 누락 가능 |
| 6단계 (커밋) | git-workflow 서브에이전트 호출 | 스킵 | 직접 커밋 금지 위반 |
| 7단계 (시스템 개선) | system-improvement 호출 | 스킵 | 패턴 분석 기회 상실 |
| 9단계 (최종 보고서) | reports/ 저장, completed_at/success 기록 | 스킵 | 사이클 미종료 (completed_at: null) |

### 2.2 위임 원칙 위반

| 위반 | 규칙 | 실제 |
|------|------|------|
| QA 작업 직접 수행 | "테스트 작성/실행 → qa" | 메인 에이전트가 readlints, type-check, test 직접 실행 |
| 커밋 누락 | "커밋 → git-workflow" | 6단계 전체 스킵 |
| 문서화 누락 | "문서 작성 → docs" | 5단계 스킵 |

### 2.3 품질 게이트 불완전

- `quality_gates`: lint null, build null → 3단계 전체 시퀀스 미실행
- plan-execution 3단계: `ReadLints → pnpm format → pnpm test → pnpm lint → pnpm type-check → pnpm build`

---

## 3. 근본 원인 분석

### 3.1 원인 1: "단순 작업 편의성 편향"

**현상**: 1개 파일 스타일 수정 등 단순해 보이는 Bugfix에서 메인 에이전트가 "빠르게 끝내기" 위해 단계를 생략.

**근거**:
- Plan Mode로 문제 분석이 명확했고, 개발자 수정이 정확했음
- "이 정도면 충분하다"는 판단으로 format/lint/build, Security, Docs, Git-Workflow, 최종 보고서 생략

**규칙 반영 필요**: "단순해 보여도 워크플로우는 생략하지 않는다" (명시적 스킵 조건 제외)

### 3.2 원인 2: 완료 전 검증 블록 부재

**현상**: "작업 완료" 선언 전에 9단계 완료 여부를 확인하는 강제 블록이 없음.

**근거**:
- main-orchestrator에 "작업 완료 선언 전 Q: 9단계 완료했는가?" 자가 점검은 있으나, **목록형 체크**로 부족
- plan-execution.md 상단에 "완료 전 필수" 블록 없음
- 에이전트가 완료 직전에 스스로 점검하지 않고 넘어감

**규칙 반영 필요**: "작업 완료 선언 직전"에 0→3→6→9 필수 확인 블록 추가

### 3.3 원인 3: 태스크 유형별 필수 단계 명시 부족

**현상**: Bugfix에 대해 plan-execution에서 4단계(Security) 필수 여부가 불명확.

**근거**:
- main-orchestrator: Bugfix = `QA(재현) → 구현 → Security(코드) → QA(검증) → Git-Workflow`
- plan-execution: 4단계 "보안 검증 (Feature/Refactor 시)" → Bugfix는 명시되지 않음
- task-classifier Bugfix: `QA (재현) → 구현 → QA (검증)` → Security 없음

**규칙 정합성**:
- main-orchestrator가 Bugfix에 Security(코드)를 포함하므로, plan-execution/checklist에서도 Bugfix 시 4단계 호출 명시 필요

### 3.4 원인 4: 체크포인트 산재

**현상**: 단계별 체크포인트가 main-orchestrator, workflow-checklist, plan-execution 등에 분산되어 있어 한 곳에서 전체를 검증하기 어려움.

**개선 방향**: "완료 전 필수 확인" 단일 블록으로 0, 3, 6, 9를 묶어 명시

---

## 4. 개선 제안

### 4.1 main-orchestrator.mdc

**변경 위치**: "워크플로우 준수 강제 (CRITICAL)" 섹션

**추가 내용**:

```markdown
### 작업 완료 선언 전 필수 확인 (CRITICAL)

**"작업 완료"라고 사용자에게 말하기 전**, 아래를 반드시 확인:

| # | 확인 항목 | Feature/Bugfix/Refactor | Chore |
|---|-----------|:-----------------------:|:-----:|
| 0 | 사이클 JSON 존재 및 초기화됨 | ✓ | 선택 |
| 3 | qa 서브에이전트 호출, format→test→lint→type-check→build 전체 실행 | ✓ | type-check+test |
| 4 | Security(코드) 호출 (Bugfix/Feature/Refactor) | ✓ | - |
| 5 | docs 서브에이전트 호출 (Chore 단순 제외) | ✓ | 스킵가능 |
| 6 | git-workflow 서브에이전트 호출 (코드 변경 시) | ✓ | 선택 |
| 7 | system-improvement 호출 (Chore 단순 제외) | ✓ | 스킵가능 |
| 9 | 최종 보고서 저장 (reports/), completed_at/success 기록 | ✓ | ✓ |

- 하나라도 미충족 → **작업 미완료**, 해당 단계 수행 후 재확인
- "단순해 보이는" 수정이라도 위 단계 생략 금지 (명시적 스킵 조건 제외)
```

**추가**: "위임 우선 원칙" 근처에
- "QA 검증(ReadLints, format, test, lint, type-check, build) 실행은 **qa 서브에이전트에게 위임**. 메인 에이전트 직접 실행 금지."

### 4.2 plan-execution.md

**변경 위치**: 원칙 블록 직후

**추가 내용**:

```markdown
**완료 전 필수**:
- 9단계(최종 보고서) 완료 전까지 "작업 완료" 선언 금지
- 9단계: 사이클 JSON에 completed_at/success 기록 + reports/ 파일 저장
```

**변경**: 4단계 설명
- 현재: "4. **보안 검증** (Feature/Refactor 시)"
- 변경: "4. **보안 검증** (Feature, Refactor, **Bugfix** 시) ← security 서브에이전트"

### 4.3 workflow-checklist.md

**변경**:

1. **4단계 보안 검증**: "Feature/Refactor 시" → "Feature, Refactor, **Bugfix** 시"로 명시
2. **9단계 직전 블록 추가**:
   - "작업 완료 선언 전: 0→3→6→9 단계 체크 완료 여부 확인"

---

## 5. 우선순위

| 대상 | 내용 | 우선순위 |
|------|------|----------|
| main-orchestrator | 작업 완료 전 필수 확인 테이블 추가 | **P1** |
| main-orchestrator | QA 검증은 qa 서브에이전트 위임 명시 | **P1** |
| plan-execution | 9단계 완료 전 "작업 완료" 금지 | **P1** |
| plan-execution | 4단계 Bugfix 포함 | **P2** |
| workflow-checklist | 4단계 Bugfix, 9단계 전 체크 | **P2** |

---

## 6. 결정사항 (Decisions)

| 결정 | 근거 | 검토한 대안 |
|------|------|-------------|
| "작업 완료 선언 전" 필수 확인 테이블 도입 | 한 곳에서 0~9 필수 여부 확인 가능 | 기존 자가 점검만 유지(강제성 부족) |
| Bugfix에 Security(코드) 필수 | main-orchestrator Bugfix 흐름과 일치 | task-classifier만 따름(Security 누락) |
| QA 검증 전체를 qa 서브에이전트에 위임 | format/lint/build 누락 방지, 위임 일관성 | 메인이 검증 실행 허용(현행, 품질 불균형) |

---

## 7. 발견된 이슈 (Issues)

| 이슈 | 해결 방법 | 영향도 |
|------|-----------|--------|
| 메인 에이전트가 QA 검증(format, lint, build) 직접 실행 | qa 서브에이전트 호출로 위임 강제 | major |
| 9단계(최종 보고서) 미수행으로 사이클 미종료 | 완료 선언 전 9단계 체크 블록 추가 | major |
| Bugfix 시 4단계(Security) 스킵 | plan-execution/checklist에 Bugfix 포함 명시 | minor |
| "단순" Bugfix에서 전체 워크플로우 생략 | "단순해도 생략 금지" 원칙 명시 | major |

---

## 8. 성공한 부분 (유지)

- Plan Mode를 통한 정확한 문제 분석
- 해결 방향(중간 레이어 스크롤 제거)의 적절성
- 코드 수정 정확성
- 테스트 통과, readlints/type-check 통과

---

## 9. 참조

- 사이클 메트릭: `.cursor/metrics/cycles/2026-03-09-010.json`
- main-orchestrator: `.cursor/rules/main-orchestrator.mdc`
- plan-execution: `.cursor/commands/plan-execution.md`
- plan-execution-workflow: `.cursor/workflows/plan-execution-workflow.md`
- workflow-checklist: `.cursor/skills/orchestrator/references/workflow-checklist.md`
- 유사 개선: `.cursor/metrics/improvements/2026-03-09-004-ui-ux-analysis-workflow-review.md`
