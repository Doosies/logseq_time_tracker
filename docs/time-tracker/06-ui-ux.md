# UI/UX 설계

## 개요

사용자 기획 노트를 기반으로 UI/UX 요구사항을 구조화합니다.

> **관련 문서 (SSOT)**
>
> - 데이터 모델 (필드/제약): [03-data-model.md](03-data-model.md)
> - FSM 전환 규칙: [04-state-management.md §상태 머신](04-state-management.md)
> - 스토어/반응형 상태: [04-state-management.md §Svelte 5 Runes](04-state-management.md)
> - Phase 범위: [00-overview.md §5 Phase별 구현 계획](00-overview.md)

---

## UI 계층

### 1. 툴바 (오른쪽 위)

**위치**: Logseq 오른쪽 상단 툴바  
**용도**: 간단한 작업

**기능**:

- 현재 진행중 Job 표시 (있을 때만)
- 시작/일시정지 버튼 (간단한 토글)
- 대기/진행/보류 작업 목록 요약 및 스위칭
- 풀화면 열기 (단축키도 제공)

**제약**:

- "개념만 두고 버튼 노출하지 말자" → Job/Status가 없는 빈 상태에서는 시작 버튼 미노출

**와이어프레임**:

```
┌─────────────────────────────────────────────┐
│  Logseq 툴바                         [⏱ ▼] │
└─────────────────────────────────────────────┘
                                          │
                              ┌───────────▼──────────┐
                              │ 현재: API 개발       │
                              │ ⏱ 01:23:45          │
                              │ [⏸ 일시정지] [⏹ 종료]│
                              │─────────────────────│
                              │ 대기 작업:           │
                              │  · DB 설계 (보류)    │
                              │  · 회의록 (대기)     │
                              │─────────────────────│
                              │ [🔲 풀화면]          │
                              └─────────────────────┘
```

---

### 2. 풀화면 (단축키)

**진입**: 단축키 (예: `Cmd+Shift+T`) 또는 툴바 "풀화면" 버튼  
**용도**: 복잡한 작업 (목록 관리, 통계, 설정, 템플릿 편집 등)

**기능**:

- Job 목록 (대기/진행/보류/취소 필터)
- Job별 카테고리, TimeEntry 조회
- 기간별/잡별 통계
- 셀렉터 설정 (게시판, 진행상태, 커스텀 필드)
- 템플릿 생성/편집
- 잡 생성 워크플로우 (정보입력 → 페이지 생성 / 타임 트래킹 시작)

---

### 3. 페이지 내 인라인

**위치**: Logseq 페이지/블록 내  
**용도**: 현재 페이지 기반 빠른 시작

**기능**:

- 현재 페이지 정보 기반 "시작" 버튼 (한 번에 시작)
- 중앙 상태와 연동: 중앙에 진행중 Job이 있으면 해당 Job 표시, 없으면 이 페이지로 새 Job 생성 후 시작
- 시작 시 카테고리 선택 (옆에 표시)
- 중지 버튼: 선택적 (사용자 기획에서 "굳이..?" → 필요 시만 노출)

**원클릭 시작 시 카테고리 자동 선택 정책 (FR-1.1 + FR-6.2)**:

카테고리는 필수(FR-6.2)이지만, 원클릭 시작(FR-1.1)에서는 매번 셀렉터를 표시하면 UX가 저하됩니다. 다음 우선순위로 자동 선택합니다:

1. `last_selected_category` 설정값 (가장 최근 사용한 카테고리)
2. 시드 카테고리 중 `sort_order` 첫 번째 (예: "개발")
3. 위 모두 null이면 → 카테고리 셀렉터 강제 표시 (원클릭 불가, 2클릭으로 전환)

선택된 카테고리는 툴바/인라인 UI에 작은 뱃지로 표시하여 사용자가 인지할 수 있게 합니다. 변경하려면 뱃지를 클릭하여 셀렉터를 열 수 있습니다.

**페이지→Job 매핑 플로우**:

인라인 "시작" 버튼 클릭 시, 현재 페이지에 매핑된 Job을 찾는 과정:

1. `IExternalRefRepository.getExternalRefBySystemAndValue('logseq', page_uuid)` 호출
2. 결과가 있으면 → 해당 `job_id`로 기존 Job을 TimerService에 전달
3. 결과가 없으면 → 새 Job 생성 (title: 페이지 제목) + ExternalRef 생성 (system_key: 'logseq', ref_value: page_uuid) → TimerService.start()
4. **원자성**: Job 생성 + ExternalRef 연결 + TimerService.start() 내의 상태 전환을 하나의 UoW 트랜잭션에서 수행. 부분 실패 시 전체 롤백 (고아 Job 방지)

---

## Core UI 컴포넌트 분기

`time-tracker-core`에 DataType 기반 필드 렌더링 컴포넌트를 포함합니다.

### 설계 원칙

- DataType 분기 로직은 core에서 처리
- 플러그인/앱 레이어는 `DataField[]`와 값만 전달
- `view_type`은 필수이며, 값이 없으면 DB 기본값 `'default'`를 저장
- `view_type === 'default'`이면 core dispatcher가 기본 컴포넌트를 선택
- `view_type`이 명시되면 해당 컴포넌트를 우선 사용

### 제안 구조

```text
packages/time-tracker-core/src/ui/fields/
  field_renderer.svelte
  field_component_registry.ts
  components/
    string_field.svelte
    decimal_field.svelte
    date_field.svelte
    datetime_field.svelte
    boolean_field.svelte
    enum_field.svelte
    relation_field.svelte
```

### 동작

1. `field_renderer`가 `data_type`, `view_type`을 입력으로 받음
2. `view_type === 'default'`이면 `data_type` 기준 기본 컴포넌트 반환
3. `view_type` 지정 시 registry에서 override 컴포넌트 반환
4. decimal 타입 값은 `number`를 입력/출력 표준으로 사용 (정밀 소수 연산이 필요해지면 `decimal.js` 도입 검토)

---

## 셀렉터 설계

### 제공 셀렉터 유형

1. **게시판 선택**: 고정된 목록 (설정에서 정의)
2. **진행상태 선택**: 진행중, 취소, 대기, 최초생성 등
3. **기타**: 커스텀 필드
4. **완전 커스터마이징**: 설정에서 셀렉터 정의

### 폴더 중첩

- `프로젝트 > 메인업무 > 작업`, `프로젝트 > 부서 > Dev_5.6` 형태
- 트리 구조, 검색으로 한 번에 찾기 가능
- **결정: `Category.parent_id` 사용** (별도 `SelectorFolder` 엔티티 불필요)
    - 03-data-model.md의 Category 테이블에 이미 `parent_id` (FK → Category, self-ref) 존재
    - 최대 깊이 10으로 제한 (CategoryService에서 검증)
    - 별도 폴더 엔티티를 추가하면 Category와 폴더의 관계가 복잡해지므로, 카테고리 자체의 트리 구조로 충분

### 설정

- "셀렉터 설정"에서 사용자 정의
- DataType과 연동 (잡코드, 잡명, 카테고리, 진행상태, 시작일, 종료일 등)

---

## 데이트피커

**용도**: 날짜 입력 편의 (직접 입력 귀찮음)

**적용 위치**:

- 잡 생성 시 시작일/종료일
- TimeEntry 기간 필터
- 통계 기간 선택

**기술**: Svelte 컴포넌트, `input type="date"` 또는 date picker 라이브러리 (uikit 연동)

---

## 잡 생성 플로우

```
잡생성 → 정보입력 → 기능수행
```

### 1. 정보입력

- **목록 커스텀**: DataType 기반으로 사용자가 어떤 필드를 넣을지 설정
- **기본 필드 (이카운트 연동 시)**: 잡코드, 잡명, 카테고리, 진행상태, 시작일, 종료(예정)일
- **데이터 타입**: data_type이 존재하여 사용자는 제공된 타입에서 선택해 추가

### 2. 기능수행 (선택)

- **페이지 생성**: 사용자 정의 템플릿 기반
- **타임 트래킹 시작**: 진행중 Job 자동 중단 후 새 Job 시작, 카테고리 선택

---

## 수동 TimeEntry 입력 (Phase 3)

타이머 없이 과거 시간을 수동으로 기록하는 기능입니다.

### 수동 입력 폼

- Job 선택 (필수)
- Category 선택 (필수)
- 시작 시각 (필수, DateTimePicker)
- 종료 시각 (필수, DateTimePicker)
- 메모 (선택)

### OverlapResolutionModal (시간 중복 해소)

수동 입력한 시간 구간이 기존 TimeEntry와 겹치는 경우 표시됩니다. 서비스 레벨 로직(`resolveOverlap`)은 [`time-tracker-core/__test_specs__/unit/time-entry.md`](../../packages/time-tracker-core/__test_specs__/unit/time-entry.md) 참조.

**선택지**:

| 선택지             | 동작                                                                                |
| ------------------ | ----------------------------------------------------------------------------------- |
| **현재 입력 우선** | 새 입력 유지, 기존 항목에서 중복 구간 제거. 기존이 완전히 포함되면 삭제             |
| **기존 입력 우선** | 기존 유지, 새 입력에서 중복 구간 제거. 기존이 새 입력을 분할하면 2개 TimeEntry 생성 |

**동작 예시**:

- 새 입력 `10:00~12:00`, 기존 `11:00~13:00` → 중복 `11:00~12:00`
    - 현재 우선: 새 `10:00~12:00`, 기존 `12:00~13:00`
    - 기존 우선: 새 `10:00~11:00`, 기존 `11:00~13:00`
- 새 입력 `10:00~14:00`, 기존 `11:00~13:00` (완전 포함)
    - 현재 우선: 새 `10:00~14:00`, 기존 삭제
    - 기존 우선: 새 `10:00~11:00` + `13:00~14:00`, 기존 유지
- 중복 항목이 여러 개인 경우: 동일 정책을 일괄 적용

**UI 요소**:

- 시각적 타임라인으로 중복 구간 표시
- 기존/새 입력을 색상으로 구분
- 모달 하단에 선택지 2개 버튼 + 취소 버튼

---

## 템플릿 시스템

### 템플릿 구조

- 본문에 `{{job_title}}`, `{{start_date}}` 등 플레이스홀더
- Job 생성 시 입력한 값으로 치환
- DataType/필드 id와 매핑

### 템플릿 생성 페이지

- 템플릿 생성 전용 UI
- 플레이스홀더 삽입 시 "내가 생성한 값" 목록에서 선택
- JobTemplate 엔티티로 저장

### 페이지 생성

- 선택한 템플릿 + 입력 값으로 새 페이지 생성
- Logseq API `createPage` 등 사용 (플러그인 레이어)

### 템플릿 보안

- **플레이스홀더 치환 시**: 값을 HTML 엔티티로 이스케이프 (`<` → `&lt;`, `>` → `&gt;` 등)
- **위험 태그 필터링**: `<script>`, `<iframe>`, `<object>`, `<embed>` 등 제거
- **Logseq API 전달 전**: 최종 새니타이징 적용
- **custom_fields 값**: JSON에서 추출 시 문자열 이스케이프 적용

---

## 카테고리

- **기본**: 개발, 분석, 회의 등 (유저 커스터마이징 가능)
- 타임 트래킹 시작 시 **어떤 카테고리로 트래킹할지** 선택
- 옆에 카테고리 선택 UI 표시
- 동일 Job에 여러 카테고리 가능 → 작업별, 작업+카테고리별 통계

---

## ReasonModal (사유 입력 모달)

모든 Job 상태 전환 시 사유(reason)를 입력받는 공통 모달 컴포넌트입니다.

### 컴포넌트 명세

| 항목       | 내용                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| **파일**   | `packages/time-tracker-core/src/components/ReasonModal/ReasonModal.svelte`                             |
| **Props**  | `title: string`, `description?: string`, `onConfirm: (reason: string) => void`, `onCancel: () => void` |
| **입력**   | textarea (최소 1글자, 빈 문자열 제출 불가)                                                             |
| **버튼**   | 확인 (disabled until 1+ chars, 서비스 호출 중 스피너+disabled), 취소 (서비스 호출 중 disabled)         |
| **포커스** | 모달 열림 시 textarea 자동 포커스                                                                      |
| **키보드** | Enter = 확인 (Shift+Enter = 줄바꿈), Escape = 취소                                                     |
| **Phase**  | 1 (핵심 플로우에 필수)                                                                                 |

### 사용 시나리오

> **FSM 전환 규칙 (허용 방향/조건)**: [04-state-management.md §상태 머신](04-state-management.md) 참조. 아래 표는 각 전환에 대한 **UI 텍스트**만 정의합니다.

| 전환                          | 모달 title | description                                              |
| ----------------------------- | ---------- | -------------------------------------------------------- |
| pending → in_progress         | 작업 시작  | 작업을 시작하는 사유를 입력하세요                        |
| in_progress → paused          | 일시정지   | 작업을 일시정지하는 사유를 입력하세요                    |
| paused → in_progress          | 작업 재개  | 작업을 재개하는 사유를 입력하세요                        |
| in_progress → completed       | 작업 완료  | 작업을 완료하는 사유를 입력하세요                        |
| \* → cancelled                | 작업 취소  | 작업을 취소하는 사유를 입력하세요                        |
| 자동 전환 (타 Job 시작)       | 작업 전환  | 기존 작업 "{job_title}"을 일시정지하는 사유를 입력하세요 |
| completed/cancelled → pending | 재오픈     | 작업을 재오픈하는 사유를 입력하세요                      |
| pending → completed           | 사후 완료  | 이미 완료된 작업을 기록하는 사유를 입력하세요            |

---

## 알림 & 리마인더

### 알림 유형

| 유형              | 조건                                           | 기본값 | 커스터마이징     |
| ----------------- | ---------------------------------------------- | ------ | ---------------- |
| **장시간 타이머** | 연속 실행 N시간 초과                           | 4시간  | 사용자 설정 가능 |
| **방치 작업**     | in_progress Job이 N시간 비활성 (타이머 미실행) | 8시간  | 사용자 설정 가능 |

### 구현 방식

- **Logseq 환경**: `logseq.UI.showMsg()` API 활용
- **브라우저 Notification**: 탭이 백그라운드일 때 `Notification API` 사용 (권한 요청 필요)
- **인앱 배너**: 툴바 영역에 경고 배너 표시

### Phase

- Phase 4에서 구현 (01-requirements.md FR-10.x와 일치)
- Phase 1~3에서는 알림 없이 동작

---

## 타임존 UI 처리

모든 시간 표시 컴포넌트에서 UTC → 로컬 변환을 적용합니다.

| 위치                | 표시 형식           | 변환 방법                                               |
| ------------------- | ------------------- | ------------------------------------------------------- |
| 타이머 경과 시간    | HH:MM:SS            | 변환 불필요 (duration)                                  |
| TimeEntry 시작/종료 | YYYY-MM-DD HH:mm    | `Intl.DateTimeFormat` (로컬 타임존)                     |
| Job 생성/수정일     | YYYY-MM-DD          | `Intl.DateTimeFormat` (로컬 타임존)                     |
| 통계 기간 선택      | YYYY-MM-DD          | 로컬 날짜 → UTC 변환 후 쿼리 (`tz_offset_minutes` 전달) |
| History 전환 시각   | YYYY-MM-DD HH:mm:ss | `Intl.DateTimeFormat` (로컬 타임존)                     |

> **원칙**: 저장은 UTC, 표시는 로컬. 유틸 함수 `formatLocalDateTime(utc_iso: string): string`을 core에서 제공합니다.

> **DailySummary 날짜 경계**: 통계의 "일별 요약"은 사용자 로컬 타임존 기준으로 날짜를 구분합니다. UI에서 `StatisticsService.getDailySummary()`를 호출할 때 `tz_offset_minutes` (= `new Date().getTimezoneOffset() * -1`)를 전달하며, 서비스는 이 offset을 적용하여 로컬 날짜 경계로 TimeEntry를 집계합니다. 이를 통해 KST 사용자가 자정 이후 작업한 내용이 올바른 날짜에 표시됩니다.

---

## Timer 표시용 tick (컴포넌트 레이어)

> **SSOT**: `timer_store`는 이벤트 타임스탬프만 보관하는 순수 데이터 레이어입니다 ([04-state-management.md §timer_store](04-state-management.md) 참조). 실시간 경과 시간 표시(째깍째깍)는 **UI 컴포넌트의 책임**입니다.

Timer 컴포넌트(`TimerDisplay.svelte`)에서 `requestAnimationFrame`을 사용하여 표시용 갱신을 수행합니다:

```typescript
// TimerDisplay.svelte (컴포넌트 내부)
let display_seconds = $state(0);
let raf_id: number | null = null;

function startDisplayTick() {
    const update = () => {
        display_seconds = Math.floor(timer_store.getElapsedMs() / 1000);
        raf_id = requestAnimationFrame(update);
    };
    raf_id = requestAnimationFrame(update);
}

function stopDisplayTick() {
    if (raf_id) cancelAnimationFrame(raf_id);
    raf_id = null;
}

$effect(() => {
    if (timer_store.active_job && !timer_store.is_paused) {
        startDisplayTick();
    } else {
        stopDisplayTick();
        display_seconds = Math.floor(timer_store.getElapsedMs() / 1000);
    }
    return () => stopDisplayTick();
});
```

**설계 포인트**:

- `requestAnimationFrame`은 컴포넌트가 마운트된 동안에만 동작 (언마운트 시 자동 정리)
- 브라우저 백그라운드 탭에서는 rAF가 throttle되지만, 포그라운드 복귀 시 `Date.now()` 기준으로 즉시 정확한 값 표시
- Store에는 부수효과(`setInterval`, `requestAnimationFrame`)가 일절 존재하지 않음
- 타이머를 표시하지 않는 페이지(예: 통계 탭)에서는 rAF가 동작하지 않음 (리소스 절약)

---

## 비동기 액션 로딩 상태

서비스 호출 중 사용자 피드백을 위해 **버튼 레벨 로딩**을 적용합니다.

| 액션             | 로딩 UI                       | 비활성화 범위                     |
| ---------------- | ----------------------------- | --------------------------------- |
| 타이머 시작/정지 | 해당 버튼 스피너 + 비활성화   | 시작/정지/일시정지 버튼 그룹 전체 |
| Job 상태 전환    | 해당 Job 항목 스피너          | 전환 대상 Job의 액션 버튼         |
| Job 생성         | "생성" 버튼 스피너 + 비활성화 | 생성 폼의 제출 버튼               |
| 데이터 내보내기  | "내보내기" 버튼 스피너        | 내보내기 버튼                     |

**구현 패턴**:

```typescript
let is_starting = $state(false);

async function handleStart() {
    is_starting = true;
    try {
        await timer_service.start(job, category, reason);
    } finally {
        is_starting = false;
    }
}
```

- 전체 화면 오버레이/스피너는 사용하지 않음 (어떤 액션이 진행 중인지 불분명)
- 로딩 중 다른 영역은 정상 상호작용 가능

---

## 삭제 제한 UI

삭제가 거부되는 경우, `ReferenceIntegrityError`를 받아 사용자에게 안내합니다:

| 대상     | 거부 조건                        | UI 메시지                                                                       |
| -------- | -------------------------------- | ------------------------------------------------------------------------------- |
| Job      | `in_progress` 또는 `paused` 상태 | "진행 중인 작업은 삭제할 수 없습니다. 먼저 완료 또는 취소해주세요."             |
| Category | TimeEntry/JobCategory 참조 존재  | "이 카테고리를 사용하는 기록이 있어 삭제할 수 없습니다. 비활성화를 사용하세요." |
| Category | 하위 카테고리 존재               | "하위 카테고리가 있어 삭제할 수 없습니다. 하위를 먼저 삭제하거나 이동해주세요." |

- 삭제 버튼 클릭 시 **확인 다이얼로그** 표시 (되돌릴 수 없음 안내)
- 에러 시 `addToast('error', message)` + 해당 항목 UI 하이라이트
- 삭제 가능한 항목에만 삭제 버튼 활성화 (참조가 있는 항목은 삭제 대신 "비활성화" 제안)

---

## 에러 및 알림 UI

에러 유형별 최적 UI를 사용합니다.

| 에러 유형                             | UI 방식     | 상세                                        |
| ------------------------------------- | ----------- | ------------------------------------------- |
| 전역 에러 (StorageError, TimerError)  | 토스트      | 자동 dismiss 5초, error 레벨은 수동 dismiss |
| 폼 검증 (ValidationError)             | 인라인      | 필드 하단 빨간 텍스트                       |
| 상태 전환 실패 (StateTransitionError) | 토스트 + UI | 토스트 알림 + 해당 Job UI 하이라이트        |
| 성공 피드백                           | 토스트      | 자동 dismiss 3초                            |

**토스트 시스템 규칙**:

- **FIFO 큐**: 최대 3개 동시 표시, 최신이 위
- 4번째 토스트 도착 시 가장 오래된 토스트를 자동 dismiss 후 새 토스트 표시
- 위치: 오른쪽 하단
- 레벨: success (초록), warning (노랑), error (빨강), info (파랑)
- 자동 dismiss: success 3초, info 5초, warning 5초, error 수동 dismiss (X 버튼)
- 동일 메시지 중복 방지: 같은 메시지의 토스트가 이미 표시 중이면 새로 생성하지 않음

**UI → Service 에러 전파 패턴**:

```typescript
async function handleStart(job: Job, category: Category, reason?: string) {
    try {
        await timer_service.start(job, category, reason);
    } catch (e) {
        if (e instanceof ValidationError) {
            // 인라인 에러 표시 (해당 필드)
        } else if (e instanceof StateTransitionError) {
            addToast('error', e.message);
        } else if (e instanceof StorageError) {
            addToast('error', '저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } else {
            addToast('error', '알 수 없는 오류가 발생했습니다.');
            logger.error('Unhandled error in handleStart', { error: e });
        }
    }
}
```

> 모든 UI 이벤트 핸들러(`handleStart`, `handlePause`, `handleStop`, `handleCancel`)에 동일 패턴을 적용합니다. Service 레이어는 throw로 에러를 전파하고, UI 레이어에서 catch하여 적절한 UI를 표시합니다.

---

## 디자인 토큰

vanilla-extract `createTheme()` 기반으로 디자인 토큰을 정의합니다. 상세 값은 Phase 1 구현 시 확정합니다.

### 색상 팔레트 (6색)

| 토큰      | 용도                 |
| --------- | -------------------- |
| primary   | 주요 액션, 활성 상태 |
| secondary | 보조 액션            |
| error     | 에러, 위험           |
| warning   | 경고                 |
| success   | 성공, 완료           |
| neutral   | 배경, 텍스트, 테두리 |

### 타이포그래피

- heading: lg / md / sm
- body: md / sm

### 간격

4 / 8 / 12 / 16 / 24 / 32 px

### 반경

- sm: 4px
- md: 8px
- lg: 12px

---

## 반응형 레이아웃 모드

풀화면 UI는 두 가지 레이아웃 모드를 지원합니다.

| 모드        | 조건                             | 레이아웃                      |
| ----------- | -------------------------------- | ----------------------------- |
| **Compact** | 폭 < 600px (사이드바, 좁은 패널) | 단일 컬럼, 탭 기반 네비게이션 |
| **Full**    | 폭 >= 600px (독립 패널, 풀화면)  | 사이드바 + 메인 영역 2-컬럼   |

**Compact 모드**:

```
┌──────────────────────┐
│ [작업] [통계] [설정]  │  ← 탭 네비게이션
│──────────────────────│
│ 현재: API 개발        │
│ ⏱ 01:23:45           │
│ [일시정지] [종료]     │
│──────────────────────│
│ · DB 설계 (보류)      │
│ · 회의록 (대기)       │
└──────────────────────┘
```

**Full 모드**:

```
┌────────────┬──────────────────────────┐
│ 작업 목록   │ 현재: API 개발            │
│            │ ⏱ 01:23:45               │
│ · API 개발  │ [일시정지] [종료]          │
│   (진행중) │                           │
│ · DB 설계  │ ─────────────────────────│
│   (보류)   │ 최근 기록                  │
│ · 회의록   │ · 03/22 09:00~10:30 개발  │
│   (대기)   │ · 03/21 14:00~16:00 분석  │
└────────────┴──────────────────────────┘
```

---

## Phase 1 UI 범위

Phase 1 프로토타입에서는 다음만 구현합니다. 이는 01-requirements.md의 Must 우선순위 요구사항(FR-1 타이머, FR-2 Job 관리, FR-6 카테고리) 중 **최소 동작 가능한 범위**로 한정합니다. Must 중 수동 TimeEntry 관리(FR-3), Logseq 연동(FR-5) 등은 Phase 2~3에서 순차 구현합니다.

1. **Timer 컴포넌트** (Svelte 5) — FR-1 대응
    - 시작/정지/일시정지 버튼
    - 경과 시간 표시
    - 현재 Job/Category 표시 (있을 때)

2. **최소 Job CRUD** — FR-2 대응 (00-overview.md Phase 1 범위와 일치)
    - Job 생성, 목록 조회
    - 상세/수정/삭제는 Phase 2

3. **카테고리 시드 표시** — FR-6 대응
    - 시드 카테고리 목록 표시 (CRUD는 Phase 2)

4. **logseq-time-tracker 진입점**
    - `main.ts`: Logseq 플러그인 등록
    - `App.svelte`: Timer 컴포넌트 래핑, minimal UI

5. **툴바/풀화면/페이지 인라인**: Phase 2 이후
6. **셀렉터, 데이트피커, 템플릿**: Phase 3~5

---

## 빈 상태(Empty State) UI

각 뷰에서 데이터가 없을 때 표시하는 UI를 정의합니다.

| 뷰                   | 빈 상태 메시지                  | CTA (행동 유도)                                  |
| -------------------- | ------------------------------- | ------------------------------------------------ |
| Job 목록 (전체)      | "아직 작업이 없습니다"          | [새 작업 만들기] 버튼                            |
| Job 목록 (필터 결과) | "{상태} 상태의 작업이 없습니다" | 필터 초기화 링크                                 |
| TimeEntry 목록       | "기록된 시간이 없습니다"        | "타이머를 시작하거나 수동으로 시간을 기록하세요" |
| 통계 (기간 선택)     | "선택한 기간에 기록이 없습니다" | 기간 변경 제안                                   |
| Category 트리        | "카테고리가 없습니다"           | [기본 카테고리 생성] 버튼                        |
| 템플릿 목록          | "템플릿이 없습니다"             | [새 템플릿 만들기] 버튼                          |

**디자인 원칙**:

- 빈 상태는 에러가 아님 — 친근한 톤
- 다음 행동을 명확히 안내 (CTA 버튼 또는 설명)
- 아이콘 + 텍스트 조합 (텍스트만 나열하지 않음)

---

## 접근성 가이드라인

### 키보드 네비게이션

- 모든 인터랙티브 요소(버튼, 입력, 셀렉터)는 Tab 키로 접근 가능
- 타이머 시작/정지는 단축키 지원 (설정 가능)

### 포커스 관리

- 모달(ReasonModal, OverlapResolutionModal) 열림 시 포커스 트랩
- 모달 닫힘 시 트리거 요소로 포커스 복귀

### ARIA 역할

| 컴포넌트       | ARIA 속성                                               |
| -------------- | ------------------------------------------------------- |
| ReasonModal    | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Timer 경과시간 | `role="timer"`, `aria-live="polite"`                    |
| 상태 변경 알림 | `aria-live="polite"`                                    |
| 토스트 알림    | `role="alert"`                                          |
| Job 목록       | `role="list"`, 각 항목 `role="listitem"`                |

### 색상 대비

- WCAG 2.1 AA 기준 (4.5:1 이상)
- 색상만으로 상태를 구분하지 않음 (아이콘/텍스트 병행)

---

## 모달 렌더링 위치 (Stacking Context)

`position: fixed` 오버레이(ReasonModal, PromptDialog 등)는 **반드시 최상위 컴포넌트**에서 렌더링합니다.

### 문제

`position: absolute` + `z-index`가 설정된 컨테이너 내부에서 `position: fixed` 요소를 렌더링하면 새로운 stacking context가 생성되어 모달이 부모 영역에 갇힙니다.

### 해결

- 모달은 iframe/앱의 최상위 레벨에서 렌더링
- 하위 컴포넌트에서는 콜백 패턴으로 모달 설정을 상위로 전달
- 예시: `Toolbar`의 `on_reason_modal_change` → `App.svelte`에서 렌더링
