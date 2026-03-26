# Phase 3G: 테스트

## 목표

Phase 3 전체 기능에 대한 단위·통합·컴포넌트·성능·E2E 테스트를 작성하고, 전체 커버리지 **80% 이상**을 달성합니다.

---

## 선행 조건

- Phase 3A ~ 3F 전체 완료

---

## 참조 설계 문서

| 문서 | 섹션 | 참조 |
| --- | --- | --- |
| `08-test-usecases.md` | §Phase 3 유즈케이스 | UC-ENTRY, UC-DFIELD, UC-UI, UC-PERF, UC-E2E |
| `02-architecture.md` | §4.9 TimeEntryService | 서비스 인터페이스 |
| `02-architecture.md` | §4.3 DataFieldService | 서비스 인터페이스 |
| `04-state-management.md` | §TimeEntry overlap 정책 | 겹침 감지 정책 |

---

## 생성/변경 파일 목록

`packages/time-tracker-core/src` 기준.

| 파일 | 역할 | 변경 유형 |
| --- | --- | --- |
| `services/time_entry_service.test.ts` | TimeEntryService 단위 테스트 | 신규 |
| `services/data_field_service.test.ts` | DataFieldService 단위 테스트 | 신규 |
| `__tests__/component/CategorySelector.test.ts` | CategorySelector 컴포넌트 테스트 | 신규 |
| `__tests__/component/JobSelector.test.ts` | JobSelector 컴포넌트 테스트 | 신규 |
| `__tests__/component/DatePicker.test.ts` | DatePicker 컴포넌트 테스트 | 신규 |
| `__tests__/component/TimeRangePicker.test.ts` | TimeRangePicker 컴포넌트 테스트 | 신규 |
| `__tests__/component/ManualEntryForm.test.ts` | ManualEntryForm 컴포넌트 테스트 | 신규 |
| `__tests__/component/OverlapResolutionModal.test.ts` | OverlapResolutionModal 컴포넌트 테스트 | 신규 |
| `__tests__/integration/time_entry_overlap.test.ts` | overlap 통합 테스트 | 신규 |
| `__tests__/performance/rendering.test.ts` | 성능 테스트 | 신규 |

> **E2E (UC-E2E-003)**: 스펙 파일의 물리적 위치는 Logseq 플러그인·모노레포 E2E 진입점(예: `packages/logseq-time-tracker` 등)의 기존 설정을 따릅니다. `it()` 설명에는 동일하게 UC prefix 규칙을 적용합니다.

---

## 상세 구현 내용

### 테스트 설명 UC prefix 규칙 (필수)

모든 테스트의 `it()` / `describe()` 설명 문자열에 **UC-ID를 prefix로 포함**해야 합니다. 이는 기존 코드베이스의 확립된 컨벤션이며, 테스트 실패 시 해당 유스케이스 추적에 필수적입니다.

```typescript
// 단위 테스트 예시
it('UC-ENTRY-001: 시간 중복(overlap) 감지 - 부분 중복', async () => { ... });
it('UC-DFIELD-002: 시스템 필드 삭제 거부', async () => { ... });

// 컴포넌트 테스트 예시
it('UC-UI-013: 수동 TimeEntry 정상 생성 (중복 없음)', async () => { ... });

// describe에 여러 UC가 포함될 때
describe('TimeEntryService overlap (UC-ENTRY-001/002)', () => { ... });

// 성능 테스트 예시
it('UC-PERF-003: 100개 Job 렌더링 < 500ms', async () => { ... });
```

**규칙**

- `it()`: `UC-{영역}-{번호}: {설명}` 형식 (콜론 + 공백 + 한글 설명)
- `describe()`: 여러 UC를 묶을 때 `(UC-XXX-NNN/NNN)` 형식 또는 단일 UC 사용
- UC-ID는 `08-test-usecases.md`에 정의된 ID를 정확히 사용
- UC-ID가 없는 보조 테스트(setup 검증 등)는 prefix 없이 작성 가능하나, 최소화할 것

---

### 1. 단위 테스트 (출처: `08-test-usecases.md` Phase 3)

#### TimeEntryService — UC-ENTRY-001 ~ 004

| UC-ID | 테스트 설명 |
| --- | --- |
| UC-ENTRY-001 | overlap 부분 중복 감지 |
| UC-ENTRY-002 | `resolveOverlap` `new_first` (부분, 완전 포함, 분할) |
| UC-ENTRY-002 | `resolveOverlap` `existing_first` (부분, 완전 포함) |
| UC-ENTRY-003 | `duration_seconds` 자동 계산 |
| UC-ENTRY-004 | `ended_at < started_at` 거부 |

**파일**: `services/time_entry_service.test.ts`

#### DataFieldService — UC-DFIELD-001 ~ 003

| UC-ID | 테스트 설명 |
| --- | --- |
| UC-DFIELD-001 | 커스텀 필드 생성 |
| UC-DFIELD-002 | `is_system` 삭제 거부 |
| UC-DFIELD-003 | `(entity_type_id, key)` 유일성 |

**파일**: `services/data_field_service.test.ts`

---

### 2. 컴포넌트 테스트

| UC-ID | 테스트 설명 | 대상 컴포넌트 |
| --- | --- | --- |
| UC-UI-009 | Category 트리 탐색 | CategorySelector |
| UC-UI-010 | 셀렉터 검색 | CategorySelector, JobSelector |
| UC-UI-011 | 날짜 선택 | DatePicker |
| UC-UI-012 | 날짜 범위 검증 | TimeRangePicker |
| UC-UI-013 | 수동 TimeEntry 정상 생성 (중복 없음) | ManualEntryForm |
| UC-UI-014 | overlap 감지 시 모달 표시 | ManualEntryForm + OverlapResolutionModal |
| UC-UI-015 | `new_first` 선택 시 기존 조정 | OverlapResolutionModal |
| UC-UI-016 | `existing_first` 선택 시 새 엔트리 조정 | OverlapResolutionModal |
| UC-UI-017 | 새 엔트리가 기존을 완전 포함 | OverlapResolutionModal |
| UC-UI-018 | 기존이 새 엔트리를 완전 포함 | OverlapResolutionModal |

**파일**: 각 컴포넌트 디렉터리 또는 `__tests__/component/` 내 `*.test.ts` (상기 생성/변경 파일 목록과 동일)

---

### 3. 성능 테스트

| UC-ID | 테스트 설명 | 기준 |
| --- | --- | --- |
| UC-PERF-003 | 100개 Job 렌더링 | < 500ms |
| UC-PERF-004 | 10,000건 TimeEntry 쿼리 | < 500ms |

**파일**: `__tests__/performance/rendering.test.ts`  
(쿼리 성능은 동일 파일 내 별도 `it()` 블록으로 구성하거나, 필요 시 `__tests__/performance/` 하위로 분리 가능 — 단, UC prefix 및 기준(ms)은 본 표와 일치시킵니다.)

---

### 4. E2E 테스트

| UC-ID | 테스트 설명 |
| --- | --- |
| UC-E2E-003 | 풀화면에서 잡 생성 → 트래킹 시작 |

**비고**: E2E 러너·디렉터리는 프로젝트 기존 정책을 따르며, 본 표의 UC-ID를 `it()` 설명에 반드시 포함합니다.

---

### 5. 통합 테스트 (overlap)

서비스·저장소·정책이 연결된 overlap 시나리오를 검증합니다. `04-state-management.md`의 TimeEntry overlap 정책과 `TimeEntryService` 동작이 end-to-end(트랜잭션 또는 인메모리 UoW)로 일치하는지 확인합니다.

**파일**: `__tests__/integration/time_entry_overlap.test.ts`

**권장 `describe()` 예시**: `describe('Time entry overlap integration (UC-ENTRY-001/002)', () => { ... });`  
개별 `it()`에는 해당하는 UC-ENTRY-001·002 세부 시나리오를 한글 설명과 함께 부여합니다.

---

## 완료 기준

- [ ] TimeEntryService 단위 테스트: UC-ENTRY-001 ~ 004 전체 커버
- [ ] DataFieldService 단위 테스트: UC-DFIELD-001 ~ 003 전체 커버
- [ ] CategorySelector 컴포넌트 테스트: UC-UI-009, UC-UI-010
- [ ] JobSelector 컴포넌트 테스트: UC-UI-010
- [ ] DatePicker 컴포넌트 테스트: UC-UI-011
- [ ] TimeRangePicker 컴포넌트 테스트: UC-UI-012
- [ ] ManualEntryForm 컴포넌트 테스트: UC-UI-013, UC-UI-014
- [ ] OverlapResolutionModal 컴포넌트 테스트: UC-UI-015 ~ 018
- [ ] 성능 테스트: UC-PERF-003, UC-PERF-004
- [ ] E2E 테스트: UC-E2E-003
- [ ] 모든 테스트 설명에 UC prefix 포함
- [ ] 전체 커버리지 80%+
- [ ] 모든 테스트 통과

---

## 다음 단계

→ **Phase 4: 잡 생성 & 템플릿** (`phase-4/plan.md`)
