# Toolbar 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: component
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 4.8 Toolbar

#### UC-UI-019: Toolbar 잡 호버 시 액션 버튼 표시

- **Given**: Toolbar에 대기(pending)/일시정지(paused) 잡이 표시되어 있다
- **When**: 잡 항목에 마우스를 올린다
- **Then**: 액션 버튼이 표시된다 (활성 작업 있으면: 전환/완료/취소, 없으면: 시작 또는 재개/완료/취소)
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-UI-020: Toolbar 일시정지/완료 시 사유 모달 표시

- **Given**: 활성 타이머가 실행 중이다
- **When**: "일시정지" 또는 "완료" 버튼을 클릭한다
- **Then**: ReasonModal이 표시되고, 사유 입력 후 확인하면 해당 서비스 호출
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-UI-021: Toolbar 활성 작업 없을 때 pending 잡에 시작 버튼

- **Given**: 활성 타이머가 없고 pending 잡이 존재한다
- **When**: 해당 잡에 마우스를 올린다
- **Then**: "시작" 버튼이 표시되고, 클릭하면 사유 모달 → 타이머 시작
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-UI-022: Toolbar 활성 작업 없을 때 paused 잡에 재개 버튼

- **Given**: 활성 타이머가 없고 paused 잡이 존재한다
- **When**: 해당 잡에 마우스를 올린다
- **Then**: "재개" 버튼이 표시되고, 클릭하면 사유 모달 → 타이머 시작
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-UI-023: Toolbar 버튼 색상 FullView 일치

- **Given**: Toolbar가 렌더링되어 있다
- **When**: 액션 버튼이 표시된다
- **Then**: 시작(#22c55e)/재개(#3b82f6)/전환(#8b5cf6)/완료(#10b981)/취소(#6b7280) 색상이 FullView Timer 버튼과 일치
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-UI-024: on_reason_modal_change 콜백 모드

- **Given**: Toolbar에 `on_reason_modal_change` 콜백이 제공된 상태이다
- **When**: 일시정지/완료 버튼을 클릭한다
- **Then**: 내부 ReasonModal이 렌더링되지 않고, 콜백이 `{ title, onconfirm, oncancel }` 설정 객체와 함께 호출된다. onconfirm/oncancel 실행 시 콜백이 `null`로 재호출된다
- **Phase**: 3
- **테스트 레벨**: 컴포넌트
