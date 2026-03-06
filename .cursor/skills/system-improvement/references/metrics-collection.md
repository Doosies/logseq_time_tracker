---
name: metrics-collection
description: 자동 메트릭 수집 및 저장 시스템
---

# 메트릭 수집 시스템

## 개요

각 작업 사이클마다 AI 메인 에이전트가 파일 쓰기 도구와 쉘 명령어를 사용해 메트릭을 수집·저장합니다. 수집된 데이터는 일별/주별 요약 생성과 시스템 개선 분석에 활용됩니다.

---

## 수집 시점

| 태스크 유형 | 수집 수준 | 설명 |
|------------|----------|------|
| Feature, Bugfix, Refactor | 전체 | context, decisions, issues 포함 전체 수집 |
| Chore | 최소(권장: 전체) | 최소 수집 가능하나 context/decisions/issues 기록 권장 |
| Docs | 스킵 | 메트릭 수집하지 않음 |
| Hotfix | 최소 | 완료 후 사후 기록 (cycle_id, 시간, success) |

---

## 사이클 파일 형식

템플릿: `.cursor/metrics/cycle-template.json`

| 필드 | 설명 |
|------|------|
| cycle_id | `YYYY-MM-DD-NNN` (NNN은 당일 순번) |
| task_type | feature, bugfix, refactor, docs, hotfix, chore |
| task_description | 사용자 요청 문구 |
| context | 사용자 요청 배경과 제약 (`user_request`, `background`, `constraints[]`) |
| decisions | 단계별 결정사항 (`phase`, `decision`, `rationale`, `alternatives_considered[]`) |
| issues_encountered | 단계별 이슈 (`phase`, `description`, `resolution`, `impact`) |
| started_at, completed_at | ISO-8601 |
| success | 최종 성공 여부 |
| failure_reason | 실패 시 이유 |
| workflow | 호출된 에이전트 이름 배열 (순서대로) |
| agents | 에이전트별 outcome(success/failure/skipped), retries, errors |
| files_changed | created(A), modified(M), deleted(D) 파일 목록 |
| quality_gates | type_check, lint, test, security 각각 pass/fail/null |
| errors | 전체 에러 목록 |
| notes | 기타 메모 |

---

## 수집 절차

### 1. 사이클 시작 (사용자 요청 수신 직후)

1. `.cursor/metrics/cycles/`에서 `YYYY-MM-DD-*.json` 패턴으로 당일 기존 파일 목록 확인
2. 마지막 순번(NNN) 다음 번호로 `cycle_id` 생성 (예: 2026-02-27-001, 002, ...)
3. `cycle_id.json` 경로로 새 JSON 파일 생성
4. 다음 값 입력: cycle_id, task_type, task_description, started_at
5. `context.user_request/background/constraints` 초기값 설정
6. workflow, agents, quality_gates, files_changed, errors는 빈 배열/객체로 초기화
7. `decisions`, `issues_encountered`는 빈 배열로 초기화 (또는 템플릿 기본값 사용)

### 2. 에이전트 호출 시

**호출 전**

- workflow 배열에 해당 에이전트 이름 추가
- agents 객체에 `{ [agent_name]: { outcome: null, retries: 0, errors: [] } }` 형태로 초기 항목 추가 (아직 결과 없으면 나중에 채움)

**호출 후**

- agents[agent_name]에 outcome(success/failure/skipped), retries, errors 배열 갱신
- 서브에이전트 보고에서 결정사항을 `decisions[]`에 누적
- 서브에이전트 보고에서 이슈를 `issues_encountered[]`에 누적
- 파일을 다시 저장하여 반영

### 3. 품질 게이트 (검증 후)

각 검증 단계 완료 시 quality_gates 필드 갱신:

- type_check: `pnpm type-check` 결과
- lint: ReadLints 또는 `pnpm lint` 결과
- test: `pnpm test` 결과
- security: Security 에이전트 검증 결과 (해당 시)

pass면 `true`, fail이면 `false`, 수행하지 않았으면 `null`

### 4. 사이클 완료 (최종 승인 시)

1. `git diff --name-status HEAD~N` 실행 (N은 사이클 시작 이후 커밋 수. 미커밋 변경만 있으면 `git status`로 대체)
2. 출력 해석: A → created, M → modified, D → deleted
3. files_changed 객체에 created, modified, deleted 배열 채우기
4. completed_at, success, failure_reason 설정
5. 최종 JSON 파일 저장

### 5. 실패 시

- success를 `false`로 설정
- failure_reason에 실패 사유 기록
- 실패한 에이전트·오류 정보를 agents, errors에 반영
- 위와 동일하게 파일 저장 (실패해도 사이클 파일은 생성)

---

## decisions/issues 필드 규격

### decisions[]

| 필드 | 설명 |
|------|------|
| phase | `planning|implementation|qa|security|docs|git_workflow|system_improvement` |
| decision | 무엇을 결정했는지 |
| rationale | 왜 그렇게 결정했는지 |
| alternatives_considered | 검토한 대안 목록 |

### issues_encountered[]

| 필드 | 설명 |
|------|------|
| phase | `planning|implementation|qa|security|docs|git_workflow|system_improvement` |
| description | 발생한 이슈 |
| resolution | 해결 방법 또는 대응 계획 |
| impact | `none|minor|major|critical` |

---

## 수집 게이트 운영 (Soft/Hard)

### Soft Gate (기본)

- 누락이 있어도 진행은 허용
- 단, 누락 항목을 TODO로 추가하고 다음 단계 전에 보완 계획을 기록
- 누락 항목:
  - `context.user_request/background/constraints`
  - 단계별 `decisions[]` 또는 `none` 근거
  - 단계별 `issues_encountered[]` 또는 `none` 근거

### Hard Gate (전환)

- 전환 후보:
  - 최근 3사이클 연속 누락 0건, 또는
  - 최근 5사이클 누락률 10% 이하
- 동작:
  - `context` 누락 시 플랜 단계 완료 불가
  - `decisions/issues` 누락 시 해당 단계 승인 불가

---

## 운영 지표 및 점검 주기

### 핵심 지표

- `missing_context_count`: context 누락 건수
- `missing_decisions_count`: decisions 누락 건수
- `missing_issues_count`: issues 누락 건수
- `phase_completion_rate`: 단계별 수집 완료율
- `final_report_reflection_rate`: 최종 보고서 반영률
- `gate_mode`: `soft|hard`

### 점검 주기

- **사이클 종료 시**: 누락 건수와 반영률 기록
- **일별 요약 생성 시**: 누락률 추세 집계
- **주별 요약 시**: gate 모드 전환 여부 재평가

---

## 일별 요약

**트리거**: 사이클 완료 직후

**절차**

1. cycle_id에서 날짜(YYYY-MM-DD) 추출
2. `.cursor/metrics/cycles/`에서 해당 날짜 `YYYY-MM-DD-*.json` 파일 모두 읽기
3. 다음 통계 계산:
   - total_cycles, success_count, failure_count
   - task_type_distribution (태스크 유형별 건수)
   - agents_used (사용된 에이전트 목록과 호출 횟수)
   - common_errors (빈번한 에러 유형)
4. `.cursor/metrics/summaries/daily-YYYY-MM-DD.json`에 저장

**일별 요약 JSON 형식 예시**

```json
{
  "date": "YYYY-MM-DD",
  "total_cycles": 0,
  "success_count": 0,
  "failure_count": 0,
  "task_type_distribution": {},
  "agents_used": {},
  "common_errors": []
}
```

---

## 주별 요약

**트리거**: 일요일 또는 수동 요청 시

**절차**

1. 해당 주의 일별 요약 파일(daily-YYYY-MM-DD.json) 읽기
2. 통계 집계: 총 사이클 수, 성공/실패 수, 태스크 유형 분포
3. 트렌드 분석: 전반주 vs 후반주 비교로 improving/degrading 판단
4. `.cursor/metrics/summaries/weekly-YYYY-WNN.json` 저장 (NN은 ISO 주 번호, 2자리)

---

## 개선 리포트 파일명

**경로**: `.cursor/metrics/improvements/`

**형식**: `YYYY-MM-DD-NNN-description.md`

- NNN: 같은 날짜 내 순번 (001, 002, 003 ...)
- description: 개선 내용을 간단히 설명하는 slug (하이픈으로 단어 구분)

**순번 결정**

1. `.cursor/metrics/improvements/`에서 `YYYY-MM-DD-*` 패턴으로 당일 파일 검색
2. 기존 NNN 중 최댓값 확인 후 +1한 값 사용

예: 2026-02-27-001-css-commonization-agent-behavior-analysis.md
