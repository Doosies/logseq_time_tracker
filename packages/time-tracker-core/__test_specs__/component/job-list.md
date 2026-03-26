# JobList 컴포넌트 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: component
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 4.2 JobList

#### UC-UI-004: Job 목록 렌더링

- **Given**: 3개의 Job (in_progress 1개, paused 1개, pending 1개)이 있다
- **When**: JobList가 렌더링된다
- **Then**: 3개의 Job 항목이 표시되고, 각 상태가 구분되어 표시된다
- **Phase**: 2
- **테스트 레벨**: 컴포넌트

#### UC-UI-005: Job 상태 필터링

- **Given**: JobList에 5개의 Job이 있다 (in_progress 1, paused 2, pending 2)
- **When**: "paused" 필터를 선택한다
- **Then**: paused 상태인 2개의 Job만 표시된다
- **Phase**: 2
- **테스트 레벨**: 컴포넌트

#### UC-UI-006: Job 클릭 시 스위칭

- **Given**: Job A (paused)가 목록에 있다
- **When**: Job A를 클릭한다
- **Then**: onSwitch 콜백이 Job A의 id와 함께 호출된다
- **Phase**: 2
- **테스트 레벨**: 컴포넌트
