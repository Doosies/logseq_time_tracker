# MemoryStorageAdapter 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: unit
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 2.6 MemoryStorageAdapter

#### UC-STORE-001: Job CRUD 전체 동작

- **Given**: 빈 MemoryStorageAdapter
- **When**: Job을 생성 → 조회 → 수정 → 삭제한다
- **Then**: 각 단계에서 정상 동작하고, 삭제 후 조회 시 null을 반환한다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-STORE-002: 존재하지 않는 id 조회

- **Given**: 빈 MemoryStorageAdapter
- **When**: 존재하지 않는 id로 Job을 조회한다
- **Then**: null을 반환한다 (에러 아님)
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-STORE-003: 상태별 필터링

- **Given**: in_progress 1개, paused 2개, pending 1개의 JobStatus가 저장되어 있다
- **When**: status === 'paused'로 필터하여 조회한다
- **Then**: 2개의 결과가 반환된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-STORE-004: TimeEntry 저장 및 기간 조회

- **Given**: 2026-03-10, 2026-03-12, 2026-03-14에 각각 TimeEntry가 저장되어 있다
- **When**: 2026-03-11 ~ 2026-03-13 기간으로 조회한다
- **Then**: 2026-03-12의 1건만 반환된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-STORE-005: Category 삭제 시 참조 검사

- **Given**: Category "개발"이 있고, TimeEntry 1건이 해당 category_id를 참조한다
- **When**: Category "개발"을 삭제하려 시도한다
- **Then**: 에러가 발생한다 (참조 레코드가 존재하므로 삭제 거부)
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-STORE-006: Storage fallback 전환 (SQLite → Memory)

- **Given**: OpfsSqliteStorageAdapter 초기화가 실패한다 (OPFS 접근 불가 시뮬레이션)
- **When**: 앱이 초기화를 시도한다
- **Then**: MemoryStorageAdapter로 자동 전환되고, 사용자에게 "임시 모드" 토스트가 표시된다
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-STORE-007: Export/Import 라운드트립

- **Given**: Job 2건, TimeEntry 3건, Category 4건이 저장되어 있다
- **When**: exportData() → 결과를 importData()로 재가져오기한다
- **Then**: 모든 레코드가 정확히 복원되고, 데이터 정합성이 유지된다
- **Phase**: 2
- **테스트 레벨**: 단위
