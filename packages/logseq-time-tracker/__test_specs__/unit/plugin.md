# Logseq 플러그인 (단위) 테스트 스펙

> **패키지**: `@personal/logseq-time-tracker`
> **테스트 레벨**: unit
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 5.1 플러그인 초기화

#### UC-PLUGIN-001: logseq.ready 호출

- **Given**: Logseq 환경이 모킹되어 있다
- **When**: main.ts가 실행된다
- **Then**: logseq.ready()가 호출되고, 콜백 내에서 UI/커맨드 등록이 수행된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-PLUGIN-002: 툴바 아이템 등록

- **Given**: logseq.ready 콜백이 실행된다
- **When**: 초기화가 완료된다
- **Then**: logseq.App.registerUIItem이 toolbar 타입으로 호출된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-PLUGIN-003: 명령어 팔레트 등록

- **Given**: logseq.ready 콜백이 실행된다
- **When**: 초기화가 완료된다
- **Then**: logseq.App.registerCommandPalette이 풀화면 전환 명령으로 호출된다
- **Phase**: 2
- **테스트 레벨**: 단위

### 5.2 LogseqStorageAdapter

#### UC-PLUGIN-004: Logseq 블록을 Job으로 변환

- **Given**: Logseq 블록 데이터가 모킹되어 있다 (properties 포함)
- **When**: LogseqStorageAdapter.getJob(block_uuid)을 호출한다
- **Then**: 블록 데이터가 Job 인터페이스에 맞게 변환되어 반환된다
- **Phase**: 4
- **테스트 레벨**: 단위

#### UC-PLUGIN-005: Job을 Logseq 블록으로 저장

- **Given**: Job 데이터가 있다
- **When**: LogseqStorageAdapter.saveJob(job)을 호출한다
- **Then**: logseq.Editor API가 올바른 property와 함께 호출된다
- **Phase**: 4
- **테스트 레벨**: 단위

### 5.3 테마 적용

#### UC-PLUGIN-006: #app에 light_theme 클래스 적용

- **Given**: DOM에 `#app` 엘리먼트가 존재하고, Logseq 환경과 time-tracker-core가 모킹되어 있다
- **When**: main.ts가 실행되어 renderApp()이 호출된다
- **Then**: `#app` 엘리먼트에 uikit의 `light_theme` CSS 클래스가 추가된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-PLUGIN-007: light_theme 클래스가 body에 적용되지 않음

- **Given**: DOM에 `#app` 엘리먼트가 존재하고, renderApp()이 실행 완료되었다
- **When**: document.body의 classList를 검사한다
- **Then**: body에는 light_theme 클래스가 추가되어 있지 않다 (Logseq iframe 투명성 보장)
- **Phase**: 1
- **테스트 레벨**: 단위
