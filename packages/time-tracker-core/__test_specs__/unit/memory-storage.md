# Memory 레포지토리 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: unit
> **ID 체계**: `UC-MEM-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

## MemoryCategoryRepository

#### UC-MEM-001: upsertCategory + getCategoryById
- **Given**: MemoryCategoryRepository가 초기화되었다
- **When**: upsertCategory 후 getCategoryById로 조회한다
- **Then**: 저장된 카테고리가 반환된다

#### UC-MEM-002: getCategories: 모든 카테고리 반환
- **Given**: 2개 카테고리를 저장했다
- **When**: getCategories()를 호출한다
- **Then**: 2개 모두 반환된다

#### UC-MEM-003: deleteCategory: 삭제 후 getCategoryById null
- **Given**: 카테고리를 저장했다
- **When**: deleteCategory 후 getCategoryById를 호출한다
- **Then**: null이 반환된다

#### UC-MEM-004: structuredClone 격리
- **Given**: 카테고리를 저장한 후 원본 객체를 변경했다
- **When**: getCategoryById로 조회한다
- **Then**: 원본 변경이 반영되지 않는다 (깊은 복사)

---

## MemoryUnitOfWork

#### UC-MEM-005: 모든 Repository 프로퍼티 접근 가능
- **Given**: MemoryUnitOfWork가 생성되었다
- **When**: 각 Repository 프로퍼티에 접근한다
- **Then**: 모두 defined이다

#### UC-MEM-006: transaction 성공 시 데이터 유지
- **Given**: MemoryUnitOfWork가 생성되었다
- **When**: transaction 내에서 Job을 저장하고 성공한다
- **Then**: transaction 밖에서 해당 Job을 조회할 수 있다

#### UC-MEM-007: transaction 실패 시 롤백 (저장한 Job 복원됨)
- **Given**: MemoryUnitOfWork가 생성되었다
- **When**: transaction 내에서 Job을 저장하고 에러를 발생시킨다
- **Then**: 저장한 Job이 롤백되어 조회되지 않는다

#### UC-MEM-008: 중첩 트랜잭션: 외부 실패 시 전체 롤백

---

## MemoryJobRepository

#### UC-MEM-009: getJobs: 빈 상태일 때 빈 배열
#### UC-MEM-010: getActiveJob: in_progress Job 반환 (없으면 null)
#### UC-MEM-011: updateJobStatus: 상태 변경 확인
#### UC-MEM-012: deleteJob: 삭제 후 getJobById null
#### UC-MEM-013: structuredClone 격리: 저장 후 원본 수정해도 저장된 값 불변

---

## MemoryTimeEntryRepository

#### UC-MEM-014: upsertTimeEntry + getTimeEntryById
#### UC-MEM-015: getTimeEntries: 필터 없이 전체 반환
#### UC-MEM-016: getTimeEntries: job_id 필터
#### UC-MEM-017: deleteByJobId: 해당 job_id 엔트리 모두 삭제
#### UC-MEM-018: deleteTimeEntry: 단일 삭제
- **Given**: MemoryUnitOfWork가 생성되었다
- **When**: 외부 transaction에서 Job 저장 → 중첩 transaction에서 Job 저장 → 외부에서 에러 발생
- **Then**: 내부와 외부 모두 롤백된다
