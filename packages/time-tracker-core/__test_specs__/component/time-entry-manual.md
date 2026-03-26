# 수동 TimeEntry 입력 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: component
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 4.6 수동 TimeEntry 입력

#### UC-UI-013: 수동 TimeEntry 정상 생성 (중복 없음)

- **Given**: 수동 입력 폼에 Job, Category, 시작 10:00, 종료 12:00를 입력했다. 해당 시간에 기존 TimeEntry가 없다
- **When**: 제출 버튼을 클릭한다
- **Then**: TimeEntry가 생성되고 목록에 추가된다
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-UI-014: 수동 TimeEntry 시간 중복 감지

- **Given**: 기존 TimeEntry가 11:00~13:00에 존재한다
- **When**: 수동으로 10:00~12:00를 제출한다
- **Then**: OverlapResolutionModal이 표시되고, 중복 구간(11:00~12:00)이 시각적으로 표시된다
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-UI-015: 현재 입력 우선 선택 시 기존 TimeEntry 조정

- **Given**: OverlapResolutionModal이 표시된 상태이다 (새: 10:00~12:00, 기존: 11:00~13:00)
- **When**: "현재 입력 우선"을 선택한다
- **Then**: 새 TimeEntry 10:00~12:00가 생성되고, 기존 TimeEntry가 12:00~13:00로 조정된다
    - 서비스 레벨 검증: UC-ENTRY-002 (new_first 단위 테스트)
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-UI-016: 기존 입력 우선 선택 시 새 TimeEntry 조정

- **Given**: OverlapResolutionModal이 표시된 상태이다 (새: 10:00~12:00, 기존: 11:00~13:00)
- **When**: "기존 입력 우선"을 선택한다
- **Then**: 새 TimeEntry가 10:00~11:00로 조정되어 생성되고, 기존 TimeEntry는 변경 없다
    - 서비스 레벨 검증: UC-ENTRY-002b (existing_first 단위 테스트)
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-UI-017: 새 입력이 기존 TimeEntry를 완전 포함

- **Given**: 기존 TimeEntry가 11:00~13:00에 존재한다
- **When**: 수동으로 10:00~14:00를 제출하고 "현재 입력 우선"을 선택한다
- **Then**: 새 TimeEntry 10:00~14:00가 생성되고, 기존 TimeEntry는 삭제된다
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-UI-018: 기존 TimeEntry가 새 입력을 완전 포함

- **Given**: 기존 TimeEntry가 09:00~15:00에 존재한다
- **When**: 수동으로 11:00~13:00를 제출하고 "기존 입력 우선"을 선택한다
- **Then**: 새 TimeEntry는 생성되지 않는다 (중복 구간 제거 후 남는 시간 없음 → 취소와 동일)
- **Phase**: 3
- **테스트 레벨**: 컴포넌트
