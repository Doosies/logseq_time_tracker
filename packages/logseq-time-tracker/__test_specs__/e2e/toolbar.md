# E2E 툴바 테스트 스펙

> **패키지**: `@personal/logseq-time-tracker`
> **테스트 레벨**: e2e
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 6.5 툴바

#### UC-E2E-005: 툴바에서 현재 작업 확인 및 전환

- **Given**: Job A가 in_progress 상태이다
- **When**: 툴바 아이콘을 클릭한다
- **Then**: 현재 진행 중인 Job A 정보가 표시되고, 다른 작업으로 전환하거나 풀화면을 열 수 있다
- **Phase**: 4
- **테스트 레벨**: E2E

#### UC-E2E-006: Toolbar에서 잡 시작 → 타이머 실행 확인

- **Given**: Toolbar 모드에서 잡이 1개 이상 존재하고 활성 타이머 없음
- **When**: 잡 호버 → "시작" 클릭 → 사유 모달 확인
- **Then**: 타이머가 시작되고 활성 작업 정보가 Toolbar에 표시됨
- **Phase**: 3
- **테스트 레벨**: E2E
