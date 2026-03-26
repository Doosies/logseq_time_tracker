# TimeEntry 서비스 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: unit
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 2.5 TimeEntryService (Phase 3)

> **strategy 결정 흐름**: `resolveOverlap`의 strategy 파라미터(`new_first` / `existing_first`)는 UI 레이어의 OverlapResolutionModal에서 **사용자 선택**에 의해 결정됩니다. 아래 단위 테스트는 각 strategy별 순수 로직을 검증하며, 사용자 선택 → strategy 전달 → 결과 반영의 통합 흐름은 UC-UI-014~016(컴포넌트 테스트)에서 검증합니다.

#### UC-ENTRY-001: 시간 중복(overlap) 감지 - 부분 중복

- **Given**: Job A에 TimeEntry가 존재한다 (10:00~12:00)
- **When**: detectOverlaps("11:00", "13:00")를 호출한다
- **Then**: 기존 TimeEntry가 중복 목록에 포함된다 (부분 중복)
- **Phase**: 3
- **테스트 레벨**: 단위

#### UC-ENTRY-002: resolveOverlap - new_first 전략

- **Given**: 기존 TimeEntry(10:00~12:00)와 새 TimeEntry(11:00~13:00)가 중복한다
- **When**: resolveOverlap(new_entry, [existing], 'new_first')를 호출한다
- **Then**: 기존 TimeEntry의 ended_at이 11:00으로 잘리고, 새 TimeEntry는 원본 유지된다
- **Phase**: 3
- **테스트 레벨**: 단위

#### UC-ENTRY-002a: resolveOverlap - 완전 포함(contain) 시 분할

- **Given**: 기존 TimeEntry(09:00~14:00)와 새 TimeEntry(10:00~12:00)가 완전 포함 관계이다
- **When**: resolveOverlap(new_entry, [existing], 'new_first')를 호출한다
- **Then**: 기존 TimeEntry가 두 구간(09:00~10:00, 12:00~14:00)으로 분할되고, 새 TimeEntry(10:00~12:00)는 원본 유지된다
- **Phase**: 3
- **테스트 레벨**: 단위

#### UC-ENTRY-002b: resolveOverlap - existing_first 전략

- **Given**: 기존 TimeEntry(10:00~12:00)와 새 TimeEntry(11:00~13:00)가 중복한다
- **When**: resolveOverlap(new_entry, [existing], 'existing_first')를 호출한다
- **Then**: 새 TimeEntry의 started_at이 12:00으로 조정되고, 기존 TimeEntry는 변경 없다
    - 참고: 동일 중복 시나리오에서 사용자가 "현재 입력 우선"을 선택하면 기존 TimeEntry가 변경됨 (UC-ENTRY-002, UC-UI-015 참조)
- **Phase**: 3
- **테스트 레벨**: 단위

#### UC-ENTRY-003: 수동 TimeEntry 생성 시 duration_seconds 자동 계산

- **Given**: Job A와 Category가 존재한다
- **When**: createManualEntry({ started_at: "2026-03-15T10:00:00Z", ended_at: "2026-03-15T11:30:00Z" })를 호출한다
- **Then**: 생성된 TimeEntry의 duration_seconds가 5400(90분)이다
- **Phase**: 3
- **테스트 레벨**: 단위

#### UC-ENTRY-004: ended_at < started_at 거부

- **Given**: Job A와 Category가 존재한다
- **When**: createManualEntry({ started_at: "2026-03-15T12:00:00Z", ended_at: "2026-03-15T10:00:00Z" })를 호출한다
- **Then**: ValidationError가 발생한다 (ended_at은 started_at 이후여야 함)
- **Phase**: 3
- **테스트 레벨**: 단위
