# Phase 1F: UI 컴포넌트

## 목표

Phase 1 최소 UI 를 구현합니다: 타이머 표시/제어, Job 목록, ReasonModal. 모든 스타일은 vanilla-extract `.css.ts` 로 작성합니다.

---

## 선행 조건

- Phase 1E 완료 — 3개 스토어 구현됨
- Phase 0 PoC — vanilla-extract + Svelte 5 빌드 검증됨

---

## 참조 설계 문서

| 문서                     | 섹션                                 | 참조 내용                                             |
| ------------------------ | ------------------------------------ | ----------------------------------------------------- |
| `06-ui-ux.md`            | §Phase 1 UI 범위                     | 기본 인페이지 UI (타이머 + Job 목록)                  |
| `06-ui-ux.md`            | §Timer 표시용 tick (컴포넌트 레이어) | requestAnimationFrame + getElapsedMs()                |
| `06-ui-ux.md`            | §ReasonModal                         | 스펙: 최소 10자, 최대 500자, 로딩 상태, 키보드 접근성 |
| `06-ui-ux.md`            | §에러 및 알림 UI                     | Toast 컴포넌트, UI → Service 에러 전파 패턴           |
| `06-ui-ux.md`            | §Empty State UI                      | Job이 0개일 때 안내 UI                                |
| `06-ui-ux.md`            | §접근성 (a11y) 가이드라인            | aria-label, aria-live, role, 키보드 내비게이션        |
| `04-state-management.md` | §timer_store                         | 스토어와 UI 연결 패턴                                 |
| `09-user-flows.md`       | UF-01~UF-06                          | 타이머 시작/정지/일시정지/전환/취소/목록보기          |

---

## 생성 파일 목록

### `packages/time-tracker-core/src/components/`

| 파일                    | 역할                                              |
| ----------------------- | ------------------------------------------------- |
| `Timer.svelte`          | 타이머 컨테이너 (TimerDisplay + TimerButton 조합) |
| `Timer.css.ts`          | Timer 스타일                                      |
| `TimerDisplay.svelte`   | 경과 시간 표시 (requestAnimationFrame)            |
| `TimerDisplay.css.ts`   | TimerDisplay 스타일                               |
| `TimerButton.svelte`    | 시작/정지/일시정지/재개/취소 버튼 그룹            |
| `TimerButton.css.ts`    | TimerButton 스타일                                |
| `JobList.svelte`        | Job 목록 렌더링 + 상태 뱃지 + 선택                |
| `JobList.css.ts`        | JobList 스타일                                    |
| `JobListItem.svelte`    | 개별 Job 항목 (상태별 아이콘, 선택 하이라이트)    |
| `JobListItem.css.ts`    | JobListItem 스타일                                |
| `ReasonModal.svelte`    | 상태 전환 사유 입력 모달                          |
| `ReasonModal.css.ts`    | ReasonModal 스타일                                |
| `ToastContainer.svelte` | 토스트 알림 목록 렌더링                           |
| `ToastContainer.css.ts` | ToastContainer 스타일                             |
| `ToastItem.svelte`      | 개별 토스트 (success/error/warning/info)          |
| `ToastItem.css.ts`      | ToastItem 스타일                                  |
| `EmptyState.svelte`     | Job이 0개일 때 안내 UI                            |
| `EmptyState.css.ts`     | EmptyState 스타일                                 |

---

## 구현 상세

### TimerDisplay — requestAnimationFrame tick

```svelte
<script lang="ts">
    import { getElapsedMs, formatDuration } from '../utils/time';

    interface Props {
        accumulated_ms: number;
        current_segment_start: string | null;
        is_paused: boolean;
    }

    let { accumulated_ms, current_segment_start, is_paused }: Props = $props();

    let display_text = $state('00:00:00');
    let raf_id: number | null = null;

    function tick() {
        const elapsed_ms = getElapsedMs(accumulated_ms, current_segment_start, is_paused);
        display_text = formatDuration(Math.floor(elapsed_ms / 1000));
        raf_id = requestAnimationFrame(tick);
    }

    $effect(() => {
        if (current_segment_start && !is_paused) {
            raf_id = requestAnimationFrame(tick);
        }
        return () => {
            if (raf_id !== null) cancelAnimationFrame(raf_id);
        };
    });
</script>

<span class={styles.display} aria-live="polite" role="timer">
    {display_text}
</span>
```

**핵심**: store에 setInterval 없이, 컴포넌트가 자체적으로 requestAnimationFrame으로 매 프레임 `getElapsedMs()`를 계산합니다.

### TimerButton — 상태별 버튼

| 조건                | 표시 버튼                   |
| ------------------- | --------------------------- |
| active_job === null | 시작 (disabled, Job 미선택) |
| is_running === true | 일시정지 / 완료 / 취소      |
| is_paused === true  | 재개 / 완료 / 취소          |

- 각 버튼 클릭 시 ReasonModal 오픈 (완료/취소 시 사유 입력 필요)
- 시작 버튼은 job_store.selected_job이 null이면 disabled
- 버튼별 loading state: 클릭 → 서비스 호출 중 disabled + 스피너

### ReasonModal — 사양

| 항목           | 값                                                |
| -------------- | ------------------------------------------------- |
| 최소 글자      | 10자                                              |
| 최대 글자      | 500자 (MAX_REASON_LENGTH)                         |
| 실시간 글자 수 | "{현재}/{최대}" 표시                              |
| 확인 버튼      | 로딩 상태 표시 (서비스 호출 중 disabled + 스피너) |
| 키보드         | Esc: 취소, Enter (Ctrl+Enter): 확인               |
| 포커스         | 열리면 textarea 자동 포커스                       |
| a11y           | role="dialog", aria-modal="true", aria-labelledby |

**ReasonModal 시나리오** (06-ui-ux.md 참조):

- 타이머 정지 시 → 완료 사유 입력
- 타이머 취소 시 → 취소 사유 입력
- 작업 전환 시 → 기존 작업 정지 사유 입력 (새 작업은 시스템 자동 reason)
- 상태 수동 전환 시 → 전환 사유 입력

### ToastContainer — 토스트 레이아웃

- 화면 상단 우측 고정 (position: fixed)
- 최대 3개 표시 (toast_store 연동)
- 새 토스트는 아래에서 위로 쌓임
- 닫기 버튼 (수동 해제) + auto_dismiss 타이머
- `aria-live="polite"` 영역

### EmptyState

- Job이 0개일 때 표시
- "아직 등록된 작업이 없습니다" + 안내 메시지
- 추후 Phase 4에서 "새 작업 만들기" 버튼 추가

---

## 완료 기준

- [ ] TimerDisplay: requestAnimationFrame 기반 실시간 표시
- [ ] TimerButton: 상태별 조건부 렌더링 + loading state
- [ ] ReasonModal: 10~500자 검증, 키보드 접근성, 로딩 상태
- [ ] JobList: 목록 렌더링, 상태 뱃지, 선택 하이라이트
- [ ] ToastContainer: FIFO 표시, 닫기, auto_dismiss
- [ ] EmptyState: Job 0개 시 표시
- [ ] 모든 스타일 `.css.ts`로 작성
- [ ] a11y: aria-label, role, 키보드 내비게이션
- [ ] `pnpm type-check` + `pnpm build` 성공

---

## 다음 단계

→ Phase 1G: 앱 통합 (`1g-app-integration.md`)
