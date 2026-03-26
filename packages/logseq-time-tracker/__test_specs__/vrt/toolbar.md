# Toolbar VRT 테스트 스펙

> **패키지**: `@personal/logseq-time-tracker`
> **테스트 레벨**: vrt
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

#### UC-VRT-001: Toolbar 기본 상태 (잡 없음)

- **Given**: Toolbar가 드롭다운 모드로 표시되어 있고, 등록된 잡이 없다
- **When**: 페이지 전체 스크린샷을 캡처한다
- **Then**: 베이스라인 이미지와 시각적 차이가 maxDiffPixelRatio 0.01 이내이다
- **Phase**: 3
- **테스트 레벨**: VRT

#### UC-VRT-002: Toolbar에서 완료 클릭 시 ReasonModal 표시

- **Given**: 잡이 시작되어 활성 타이머가 있는 상태이다
- **When**: 완료 버튼을 클릭하여 ReasonModal이 표시된 상태에서 스크린샷을 캡처한다
- **Then**: ReasonModal이 전체 뷰포트를 올바르게 덮고, 베이스라인과 시각적 차이가 0.01 이내이다
- **Phase**: 3
- **테스트 레벨**: VRT

#### UC-VRT-003: Toolbar에서 일시정지 클릭 시 ReasonModal 표시

- **Given**: 잡이 시작되어 활성 타이머가 있는 상태이다
- **When**: 일시정지 버튼을 클릭하여 ReasonModal이 표시된 상태에서 스크린샷을 캡처한다
- **Then**: ReasonModal이 전체 뷰포트를 올바르게 덮고, 베이스라인과 시각적 차이가 0.01 이내이다
- **Phase**: 3
- **테스트 레벨**: VRT
