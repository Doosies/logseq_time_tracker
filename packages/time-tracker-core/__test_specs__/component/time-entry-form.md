# TimeEntryForm 컴포넌트 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: component
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 4.3 TimeEntryForm

#### UC-UI-007: TimeEntryForm 입력 검증

- **Given**: TimeEntryForm이 렌더링되어 있다
- **When**: started_at만 입력하고 ended_at을 비워둔 채 제출한다
- **Then**: 유효성 에러가 표시되고 제출되지 않는다
- **Phase**: 2
- **테스트 레벨**: 컴포넌트

#### UC-UI-008: TimeEntryForm 정상 제출

- **Given**: TimeEntryForm에 모든 필수 필드가 입력되어 있다 (started_at, ended_at, category)
- **When**: 제출 버튼을 클릭한다
- **Then**: onSubmit 콜백이 입력값과 함께 호출된다
- **Phase**: 2
- **테스트 레벨**: 컴포넌트
