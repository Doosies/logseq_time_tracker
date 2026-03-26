# 데이트피커 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: component
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 4.5 데이트피커

#### UC-UI-011: 날짜 선택

- **Given**: DatePicker가 렌더링되어 있다
- **When**: 2026-03-15를 선택한다
- **Then**: onSelect 콜백이 "2026-03-15" 값과 함께 호출된다
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-UI-012: 날짜 범위 검증

- **Given**: DatePicker에 min: "2026-01-01", max: "2026-12-31" 제약이 있다
- **When**: 2025-12-31을 선택하려 한다
- **Then**: 선택이 불가하다 (비활성 또는 에러)
- **Phase**: 3
- **테스트 레벨**: 컴포넌트
