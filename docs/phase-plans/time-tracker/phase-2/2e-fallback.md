# Phase 2E: Storage Fallback & Web Locks

## 목표

`StorageState` 상태 머신을 구현하고, SqliteUnitOfWork 초기화·런타임 실패 시 Memory Unit of Work로의 fallback, 복구(재시도·자동 복구·데이터 마이그레이션)를 정의합니다. 멀티탭 동시 접근을 위해 Web Locks API를 래핑하고, 락 실패 시 읽기 전용 모드로 전환합니다. Logseq 플러그인 생명주기에 맞춰 `beforeunload` / `logseq.beforeunload`에서 ActiveTimerState와 영속 계층을 안전히 플러시하고, TimerService에서 30초 주기 백업(누적 시간 갱신)을 수행합니다.

---

## 선행 조건

- Phase 2D 완료 — SqliteUnitOfWork + `initializeApp` 통합

---

## 참조 설계 문서

| 문서 | 섹션 | 참조 |
|------|------|------|
| `05-storage.md` | §Storage Fallback 상세 설계 | 전체 fallback 흐름(초기화·런타임 실패, Memory 전환, 복구) |
| `05-storage.md` | §멀티탭 동시 접근 | Web Locks API 상세, 쓰기 직렬화 정책 |
| `05-storage.md` | §Logseq 플러그인 생명주기 | `beforeunload`, 30초 주기 백업, 플러그인 언로드 시나리오 |
| `02-architecture.md` | §14 리소스 정리 | `IDisposable`, dispose 패턴, `setInterval` 정리 |

---

## 생성/변경 파일 목록

`time-tracker-core/src` 기준:

| 파일 | 역할 | 변경 유형 |
|------|------|-----------|
| `adapters/storage/storage_state.ts` | `StorageState` 상태 머신, 전이 규칙·스냅샷 노출 | 신규 |
| `adapters/storage/storage_manager.ts` | 스토리지 초기화, Sqlite↔Memory 전환, 복구·마이그레이션 조율 | 신규 |
| `adapters/storage/web_locks.ts` | Web Locks API 래퍼(`WebLocksManager`) | 신규 |
| `initialize.ts` | Fallback·락·읽기 전용 모드와의 통합, 앱 부트스트랩 훅 | 변경 |
| `services/timer_service.ts` | `beforeunload` 연동, 30초 주기 백업, dispose 시 `clearInterval` | 변경 |

UI 레이어(배너·토스트)는 플러그인 패키지에서 구현할 수 있으나, 본 Phase에서는 **코어가 노출하는 이벤트/콜백**(예: `on_storage_mode_changed`, `on_readonly_changed`)과 위 파일의 책임 경계를 명확히 두고 연동합니다.

---

## 상세 구현 내용

### 1. StorageState 상태 머신

앱 전역에서 현재 저장소 모드와 fallback 메타데이터를 단일 소스로 유지합니다.

`StorageState` **타입**은 `types/settings.ts`에 정의되어 있으며, `storage_state.ts`의 `StorageStateMachine`이 이를 복사·전파합니다.

```typescript
// types/settings.ts
export interface StorageState {
  mode: 'sqlite' | 'memory_fallback';
  fallback_reason?: string;
  fallback_since?: string;  // ISO8601
}
```

**상태 전환**

| From | To | 조건 |
|------|-----|------|
| `sqlite` | `memory_fallback` | SqliteUnitOfWork 초기화 실패(`StorageError` 등), 또는 런타임 SQLite 쓰기 실패가 정책상 임계(아래 §3) 도달 |
| `memory_fallback` | `sqlite` | 재시도 또는 자동 복구로 SQLite 재초기화 성공 후, Memory → SQLite 마이그레이션(§4) 완료 |

- 상태 변경 시 구독자(UI·서비스)에 알림하여 배너·토스트·버튼 활성화를 동기화합니다.
- `fallback_reason`은 로그·지원용 짧은 코드 또는 메시지 키를 권장합니다.

### 2. 초기화 실패 처리

1. 부트스트랩에서 SqliteUnitOfWork 초기화를 시도합니다.
2. 실패 시(`StorageError` 또는 동등한 분류된 오류):
   - `MemoryUnitOfWork`로 전환하고 `StorageState.mode = 'memory_fallback'`으로 갱신합니다.
   - **영구 배너(warning)**: "저장소에 접근할 수 없어 임시 모드로 실행 중입니다. 데이터가 영구 저장되지 않습니다."
   - 배너에 **재시도** 버튼을 포함합니다(수동 복구 트리거).

구현 상 세부는 `storage_manager`가 `initialize.ts`에서 주입·호출되는 형태를 권장합니다.

### 3. 런타임 실패 처리

1. SQLite 기반 쓰기 경로에서 실패를 감지합니다(예: `persist`, 트랜잭션 커밋, 백엔드 `write`).
2. 동일 작업에 대해 **3회 재시도**하며, 간격은 **exponential backoff**: 구현 기본값은 `base_delay_ms: 50`으로 **50ms → 100ms → 200ms** (`base_delay_ms * 2^attempt`, `exponential_backoff.ts`·`StorageManager`의 `DEFAULT_RETRY`). 설계 초안의 500ms/1s/2s와는 다릅니다.
3. 모든 재시도 실패 시:
   - 현재 세션에서 **아직 SQLite에 반영되지 않은 변경**을 수집해 `MemoryUnitOfWork`에 보존(메모리 내 일관성 유지).
   - `sqlite` → `memory_fallback` 전환 및 배너(§2와 동일 메시지 계열) 표시.
4. 재시도 중에는 사용자 입력이 무한 대기하지 않도록 타임아웃·취소 정책을 설계 문서와 맞춥니다.

### 4. 복구 로직

- **트리거**: 배너의 재시도 버튼, 또는 **자동 복구**(예: 30초 간격으로 SQLite 재초기화 가능 여부 점검 — 설계 문서의 주기와 정합).
- SQLite 재초기화에 성공하면:
  1. `MemoryUnitOfWork`에 존재하는 데이터를 **SqliteUnitOfWork로 마이그레이션**합니다. 권장: **단일 트랜잭션 내 전체 upsert**(Job, TimeEntry, ActiveTimerState 등 Phase 범위 엔티티).
  2. 성공 시: Memory 인스턴스 해제, 활성 UoW를 Sqlite로 전환, `StorageState.mode = 'sqlite'`, 성공 토스트(아래 표).
  3. 실패 시: **MemoryUnitOfWork 유지**, 사용자에게 **데이터보내기** 안내(토스트 error).

마이그레이션 실패 시 기존 Memory 데이터 손실을 방지하기 위해, Sqlite 쪽 롤백 후에도 Memory 스냅샷이 남도록 구현 순서를 문서화합니다.

### 5. Web Locks API

쓰기 충돌을 줄이기 위해 DB 쓰기 구간에만 락을 적용합니다. 읽기 경로는 락 없이 허용합니다.

```typescript
class WebLocksManager {
  private lock_held = false;

  async acquireLock(name: string = 'time-tracker-db'): Promise<boolean>;
  releaseLock(): void;
  isLockHeld(): boolean;
}
```

- `navigator.locks.request(name, { ifAvailable: true }, callback)` 패턴을 사용합니다. `ifAvailable: true`는 다른 탭이 이미 락을 잡은 경우 즉시 실패할 수 있어, 읽기 전용 모드(§6)와 연계하기 적합합니다.
- **획득 타임아웃**: 최대 **5초** 내에 락을 잡지 못하면 실패로 간주하고 §6으로 전환합니다(구현 시 `AbortController` 또는 래퍼 내부 타이머로 일관되게 처리).
- **적용 범위**: DB **쓰기** 연산에만 락 적용. **읽기는 자유**.

`web_locks.ts`는 환경에 Web Locks가 없는 경우의 graceful degradation(락 생략 또는 읽기 전용 비활성) 정책을 `05-storage.md`와 동일하게 맞춥니다.

### 6. Lock 실패 시 읽기 전용 모드

- 락 획득 실패 시: **토스트** 알림 + **읽기 전용 모드** 진입.
- **제한**:
  - 타이머 시작·정지·일시정지 버튼 비활성화
  - Job / TimeEntry 생성·수정·삭제 불가
- **허용**:
  - Job 목록 조회, TimeEntry 조회, 통계
- **UI**: 상단 영구 배너(info) — "다른 탭에서 실행 중 - 읽기 전용 모드"
- **자동 복구**: **5초 간격**으로 락 재획득을 시도하고, 성공 시 읽기 전용 해제 + 성공 토스트(아래 표).

읽기 전용 플래그는 `TimerService`·커맨드 게이트에서 동일하게 참조해야 합니다.

### 7. beforeunload / logseq.beforeunload

- **진행 중 타이머**가 있으면 `ActiveTimerState`를 강제 저장합니다(메모리 내 최신값).
- **`accumulated_ms`**를 현재 시각 기준으로 갱신합니다.
- SqliteUnitOfWork가 활성이면 → **`persist()`** 호출(또는 동등한 영속 플러시)로 디스크 반영을 시도합니다.
- ~~Logseq 환경에서는 `logseq.beforeunload` 훅을 우선 등록하고, 일반 웹 환경에서는 `window.beforeunload`를 보조로 사용하는 이중 등록을 검토합니다.~~ → `@logseq/libs` SDK(현재 사용 버전)에 `logseq.beforeunload` API가 없어, `window.addEventListener('beforeunload')`만 사용합니다. 향후 SDK에 해당 API가 추가되면 이중 등록으로 전환합니다.

리소스 정리는 `02-architecture.md` §14의 `IDisposable` 패턴과 정합되게, 구독 해제·타이머 정리 순서를 명시합니다.

### 8. 30초 주기 백업 (TimerService)

- 타이머가 **실행 중**일 때만 **30초 간격**으로 `ActiveTimerState.accumulated_ms`를 갱신하고, Sqlite 경로가 활성이면 필요 시 `persist()`를 호출합니다(설계 문서의 "주기 백업" 정의와 일치).
- `setInterval`로 스케줄하고, **`IDisposable.dispose()`**에서 반드시 `clearInterval`하여 플러그인 언로드·테스트 teardown 시 누수를 방지합니다.

### 사용자 알림 요소

| 상황 | UI 타입 | 내용 |
|------|---------|------|
| SQLite → Memory 전환 | 영구 배너 (warning) | "임시 모드: 데이터가 영구 저장되지 않습니다. [재시도] [보내기]" |
| 재시도 성공 | 토스트 (success) | "저장소가 복구되었습니다" |
| 재시도 실패 | 토스트 (error) | "저장소 복구에 실패했습니다. 데이터보내기를 권장합니다" |
| 읽기 전용 모드 | 영구 배너 (info) | "다른 탭에서 실행 중 - 읽기 전용 모드" |
| 읽기 전용 해제 | 토스트 (success) | "전체 기능이 복원되었습니다" |

코어는 UI 문자열을 직접 하드코딩하기보다, 콜백·이벤트 페이로드로 상황 코드를 넘기고 플러그인 레이어에서 i18n을 적용하는 구성을 권장합니다.

---

## 완료 기준

- [x] `StorageState` 상태 머신 구현 (`StorageStateMachine`, 타입은 `types/settings.ts`)
- [x] 초기화 실패 → Memory fallback (`StorageManager.initialize`; 로그·상태 머신은 코어, **배너 UI는 미연동**)
- [x] 런타임 쓰기 실패 3회 → Memory fallback (`executeWithFallback` + `RUNTIME_RETRY` 500ms×3회)
- [x] 복구: Memory → SQLite 데이터 마이그레이션 (`tryRecover`)
- [x] Web Locks API 래퍼 구현 (`web_locks.ts`, `initialize` 옵션으로 연동)
- [x] Lock 실패 시 읽기 전용 모드 (`is_readonly` + `_startLockRetryPolling` 5초 재시도)
- [x] `beforeunload` 연동 지원: `utils/before_unload.ts`의 `registerTimerBeforeUnload` → `TimerService.flushBeforeUnload()` → `persistActiveTimerState()`(UoW 트랜잭션·Sqlite 경로에서는 커밋 시 `persist`). 앱/플러그인에서 리스너 등록 필요
- [x] 30초 주기 백업: `TIMER_BACKUP_INTERVAL_MS`(30_000)·`TimerService` `setInterval` + `dispose`에서 `clearInterval`
- [x] 사용자 알림 UI(배너, 토스트) 연동 (`App.svelte` subscribe + storage_banner)

---

## 다음 단계

→ Phase 2F: Phase 2 서비스 (`2f-services.md`)
