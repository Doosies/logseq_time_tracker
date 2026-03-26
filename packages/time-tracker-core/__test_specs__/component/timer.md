# Timer 컴포넌트 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: component
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 4.1 Timer

#### UC-UI-001: Timer 초기 렌더링

- **Given**: Timer 컴포넌트가 초기 상태 (is_running: false)로 렌더링된다
- **When**: 화면이 표시된다
- **Then**: "시작" 버튼이 보이고, 경과시간은 "00:00:00"으로 표시된다
- **Phase**: 1
- **테스트 레벨**: 컴포넌트

#### UC-UI-002: Timer 시작 버튼 클릭

- **Given**: Timer가 정지 상태이다
- **When**: "시작" 버튼을 클릭한다
- **Then**: onStart 콜백이 호출된다
- **Phase**: 1
- **테스트 레벨**: 컴포넌트

#### UC-UI-003: Timer 진행 중 상태 표시

- **Given**: Timer가 is_running: true, elapsed_seconds: 3661 (1시간 1분 1초)로 렌더링된다
- **When**: 화면이 표시된다
- **Then**: "01:01:01"이 표시되고, "일시정지" 버튼이 보인다
- **Phase**: 1
- **테스트 레벨**: 컴포넌트
