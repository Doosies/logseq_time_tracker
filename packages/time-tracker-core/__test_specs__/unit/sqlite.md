# SQLite 어댑터/레포지토리 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: unit
> **ID 체계**: `UC-SQL-{SUB}-{번호}` (SUB: ADPT, CAT, HIST, JCAT, JOB, SET, TMPL, TE, UOW, DF)
> **형식**: BDD (Given-When-Then)

---

## SqliteAdapter (UC-SQL-ADPT)

#### UC-SQL-ADPT-001: 미초기화 상태에서 getDatabase는 StorageError를 던진다
- **Given**: SqliteAdapter가 initialize 없이 생성되었다
- **When**: getDatabase()를 호출한다
- **Then**: StorageError('Database not initialized')가 발생한다

#### UC-SQL-ADPT-002: 미초기화 상태에서 persist는 StorageError를 던진다
- **Given**: SqliteAdapter가 initialize 없이 생성되었다
- **When**: persist()를 호출한다
- **Then**: StorageError가 발생한다

#### UC-SQL-ADPT-003: initialize → getDatabase → persist 기본 흐름
- **Given**: MemoryStorageBackend와 SqliteAdapter가 있다
- **When**: initialize → getDatabase → 데이터 삽입 → persist를 순서대로 수행한다
- **Then**: backend에 데이터가 저장된다

#### UC-SQL-ADPT-004: backend.read 버퍼로 기존 DB를 복원한다
- **Given**: 첫 번째 어댑터로 데이터를 persist했다
- **When**: 두 번째 어댑터를 같은 backend로 initialize한다
- **Then**: 이전에 저장된 데이터가 복원된다

---

## SqliteCategoryRepository (UC-SQL-CAT)

#### UC-SQL-CAT-001: upsert·getCategoryById·getCategories·deleteCategory
- **Given**: SqliteCategoryRepository가 초기화되었다
- **When**: upsert → getCategoryById → getCategories → deleteCategory를 수행한다
- **Then**: 각 연산이 올바르게 동작한다

#### UC-SQL-CAT-002: is_active true는 저장 후 true로 읽힌다
- **Given**: is_active가 true인 카테고리를 저장했다
- **When**: getCategoryById로 조회한다
- **Then**: is_active가 true이다 (INTEGER 1 → boolean 변환)

#### UC-SQL-CAT-003: is_active false는 INTEGER 0과 왕복
- **Given**: is_active가 false인 카테고리를 저장했다
- **When**: getCategoryById로 조회한다
- **Then**: is_active가 false이다 (INTEGER 0 → boolean 변환)

---

## SqliteHistoryRepository (UC-SQL-HIST)

#### UC-SQL-HIST-001: appendJobHistory 후 getJobHistory로 조회
- **Given**: 2개의 이력을 append했다
- **When**: getJobHistory(job_id)를 호출한다
- **Then**: 2개 행이 occurred_at 순서로 반환된다

#### UC-SQL-HIST-002: getJobHistoryByPeriod: job_id 필터
- **Given**: 서로 다른 job_id의 이력이 존재한다
- **When**: getJobHistoryByPeriod({ job_id })를 호출한다
- **Then**: 해당 job_id의 이력만 반환된다

#### UC-SQL-HIST-003: getJobHistoryByPeriod: from_date·to_date
- **Given**: 서로 다른 시간대의 이력이 존재한다
- **When**: getJobHistoryByPeriod({ from_date, to_date })를 호출한다
- **Then**: 해당 기간 내 이력만 반환된다

#### UC-SQL-HIST-004: getJobHistoryByPeriod: job_id와 기간 조합
- **Given**: 여러 job, 여러 시간대의 이력이 존재한다
- **When**: getJobHistoryByPeriod({ job_id, from_date, to_date })를 호출한다
- **Then**: 두 조건 모두 만족하는 이력만 반환된다

#### UC-SQL-HIST-005: deleteByJobId로 해당 job 이력만 삭제
- **Given**: 2개 job의 이력이 존재한다
- **When**: deleteByJobId(job_id)를 호출한다
- **Then**: 해당 job의 이력만 삭제되고 다른 job 이력은 유지된다

---

## SqliteJobCategoryRepository (UC-SQL-JCAT)

#### UC-SQL-JCAT-001: upsert 후 getJobCategories로 조회한다
#### UC-SQL-JCAT-002: getCategoryJobs로 카테고리에 연결된 Job들을 조회한다
#### UC-SQL-JCAT-003: is_default boolean 변환이 올바르다
#### UC-SQL-JCAT-004: (job_id, category_id) UNIQUE 제약: 동일 쌍 upsert 시 덮어쓴다
#### UC-SQL-JCAT-005: deleteJobCategory로 단건 삭제한다
#### UC-SQL-JCAT-006: deleteByJobId로 특정 Job의 모든 연결을 삭제한다
#### UC-SQL-JCAT-007: 존재하지 않는 Job/Category를 조회하면 빈 배열을 반환한다
#### UC-SQL-JCAT-008: created_at ASC 정렬로 반환한다

---

## SqliteJobRepository (UC-SQL-JOB)

#### UC-SQL-JOB-001: upsert 후 getJobById·getJobs·getJobsByStatus로 조회한다
#### UC-SQL-JOB-002: getActiveJob: 진행 중인 작업이 없으면 null
#### UC-SQL-JOB-003: getActiveJob: 진행 중인 작업이 1건이면 반환
#### UC-SQL-JOB-004: updateJobStatus: 존재하면 갱신
#### UC-SQL-JOB-005: updateJobStatus: 대상이 없으면 StorageError
#### UC-SQL-JOB-006: deleteJob로 행을 제거한다

---

## SqliteSettingsRepository (UC-SQL-SET)

#### UC-SQL-SET-001: 존재하지 않는 키는 null
#### UC-SQL-SET-002: setSetting·getSetting으로 객체 설정을 JSON 왕복
#### UC-SQL-SET-003: 문자열 설정 last_selected_category 왕복
#### UC-SQL-SET-004: deleteSetting 후 getSetting은 null
#### UC-SQL-SET-005: 손상된 JSON이면 StorageError

---

## SqliteTemplateRepository (UC-SQL-TMPL)

#### UC-SQL-TMPL-001: upsert 후 getTemplateById로 조회한다
#### UC-SQL-TMPL-002: getTemplates는 created_at DESC 순으로 반환한다
#### UC-SQL-TMPL-003: upsert로 기존 템플릿을 갱신한다
#### UC-SQL-TMPL-004: deleteTemplate로 삭제한다
#### UC-SQL-TMPL-005: 존재하지 않는 id를 조회하면 null을 반환한다
#### UC-SQL-TMPL-006: 빈 테이블에서 getTemplates는 빈 배열을 반환한다
#### UC-SQL-TMPL-007: placeholders JSON 문자열이 그대로 보존된다

---

## SqliteTimeEntryRepository (UC-SQL-TE)

#### UC-SQL-TE-001: upsert·getTimeEntryById·deleteTimeEntry CRUD
#### UC-SQL-TE-002: is_manual true/false가 INTEGER와 왕복한다
#### UC-SQL-TE-003: getTimeEntries: job_id 필터
#### UC-SQL-TE-004: getTimeEntries: category_id 필터
#### UC-SQL-TE-005: getTimeEntries: from_date·to_date 조합
#### UC-SQL-TE-006: getTimeEntries: job_id·category_id·기간을 함께 적용
#### UC-SQL-TE-007: deleteByJobId로 해당 job의 기록만 삭제

---

## SqliteDataFieldRepository (UC-SQL-DF)

#### UC-SQL-DF-001: upsert 후 getDataFields·getDataFieldById로 조회
#### UC-SQL-DF-002: getDataFields: sort_order 기준 정렬
#### UC-SQL-DF-003: deleteDataField 후 조회되지 않음

---

## SqliteUnitOfWork (UC-SQL-UOW)

#### UC-SQL-UOW-001: 모든 Repository 프로퍼티 접근 가능
#### UC-SQL-UOW-002: transaction 성공 시 데이터 유지하고 persist 호출
#### UC-SQL-UOW-003: transaction 실패 시 롤백되어 데이터 없음
#### UC-SQL-UOW-004: 중첩 transaction: 내부는 별도 BEGIN 없이 조인, 성공 시 persist는 외부 1회
#### UC-SQL-UOW-005: 중첩 transaction: 외부 실패 시 전체 롤백

---

## SqliteExternalRefRepository (UC-SQL-EXTREF)

#### UC-SQL-EXTREF-001: upsert 후 getExternalRefs로 조회한다
#### UC-SQL-EXTREF-002: getExternalRef로 (job_id, system_key) 쌍을 조회한다
#### UC-SQL-EXTREF-003: getExternalRefBySystemAndValue로 시스템키+값 조합을 조회한다
#### UC-SQL-EXTREF-004: deleteExternalRef로 단건 삭제한다
#### UC-SQL-EXTREF-005: deleteByJobId로 특정 Job의 모든 참조를 삭제한다
#### UC-SQL-EXTREF-006: 존재하지 않는 Job의 참조를 조회하면 빈 배열을 반환한다
#### UC-SQL-EXTREF-007: system_key ASC 정렬로 반환한다
