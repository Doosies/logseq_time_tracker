# 접근성 (컴포넌트) 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: component
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

## 12. 접근성 테스트

06-ui-ux.md 접근성 가이드라인에 따른 검증 유즈케이스입니다.

### 12.1 키보드 네비게이션

#### UC-A11Y-001: Tab 키로 모든 인터랙티브 요소 접근

- **Given**: Timer 컴포넌트와 JobList가 렌더링되어 있다
- **When**: Tab 키를 반복 누른다
- **Then**: 모든 버튼, 입력 필드, 셀렉터에 포커스가 순서대로 이동한다
- **Phase**: 2
- **테스트 레벨**: 컴포넌트

#### UC-A11Y-002: ReasonModal 포커스 트랩

- **Given**: ReasonModal이 열려 있다
- **When**: Tab 키를 반복 누른다
- **Then**: 포커스가 모달 내부 요소(textarea, 확인, 취소)에서만 순환하고, 모달 바깥으로 이동하지 않는다
- **Phase**: 1
- **테스트 레벨**: 컴포넌트

#### UC-A11Y-003: 모달 닫힘 시 포커스 복귀

- **Given**: ReasonModal이 열려 있다
- **When**: 모달을 닫는다 (확인 또는 취소)
- **Then**: 포커스가 모달을 트리거한 요소로 복귀한다
- **Phase**: 1
- **테스트 레벨**: 컴포넌트

### 12.2 ARIA 속성

#### UC-A11Y-004: Timer 컴포넌트 ARIA 역할

- **Given**: Timer 컴포넌트가 렌더링되어 있다
- **When**: 접근성 트리를 검사한다
- **Then**: 경과 시간 요소에 `role="timer"` 및 `aria-live="polite"`가 설정되어 있다
- **Phase**: 1
- **테스트 레벨**: 컴포넌트
