# Phase 3C: UI 모드 시스템

## 목표

Toolbar / FullView / InlineView 세 가지 UI 모드를 구현하고, 풀화면 패널의 반응형 레이아웃(Compact / Full)을 `ResizeObserver`로 전환합니다. Logseq 플러그인(`App.svelte`)에서 각 모드를 통합합니다.

---

## 선행 조건

- Phase 2 완료 — 기본 컴포넌트(Timer, JobList, ReasonModal, Toast, EmptyState) 동작

---

## 참조 설계 문서

| 문서 | 섹션 | 참조 |
| --- | --- | --- |
| `06-ui-ux.md` | §1 Toolbar | 상단 슬롯바 — 현재 타이머 요약 + 빠른 제어 |
| `06-ui-ux.md` | §2 FullView + 반응형 레이아웃 | 메인 패널 — Compact/Full 모드 |
| `06-ui-ux.md` | §3 InlineView | 인페이지 인라인 UI |
| `06-ui-ux.md` | §빈 상태 UI | 각 모드별 빈 상태 표시 |
| `09-user-flows.md` | UF-16~17 | UI 모드 전환 사용자 플로우 |

---

## 생성/변경 파일 목록

모든 경로는 `packages/time-tracker-core/src` 기준(컴포넌트) 또는 `packages/logseq-time-tracker/src` 기준(앱 통합).

| 파일 | 역할 | 변경 유형 |
| --- | --- | --- |
| `components/Toolbar/Toolbar.svelte` | 상단 슬롯바 UI | 신규 |
| `components/Toolbar/toolbar.css.ts` | 스타일 | 신규 |
| `components/FullView/FullView.svelte` | 메인 패널 UI | 신규 |
| `components/FullView/full_view.css.ts` | 스타일 | 신규 |
| `components/InlineView/InlineView.svelte` | 인라인 UI | 신규 |
| `components/InlineView/inline_view.css.ts` | 스타일 | 신규 |
| `components/LayoutSwitcher/LayoutSwitcher.svelte` | 반응형 전환 | 신규 |
| `components/index.ts` | barrel export 추가 | 변경 |
| `logseq-time-tracker/src/App.svelte` | 모드 통합 | 변경 |

---

## 상세 구현 내용

### 1. Toolbar.svelte (`06-ui-ux.md` §1)

**Props**

```svelte
<script lang="ts">
  import type { AppContext } from '../../app/context';

  interface Props {
    context: AppContext;
  }

  let { context }: Props = $props();
</script>
```

**기능**

- 현재 진행 중 Job 표시: `title`, 경과 시간(기존 Timer 스토어/서비스와 동기)
- 빠른 제어:
  - 진행 중: 일시정지 · 종료 버튼
  - 일시정지: 재개 버튼
- 대기/보류 작업 목록 요약: 최대 5개, 항목 클릭 시 해당 Job으로 전환(스위칭)
- 풀화면 열기 버튼(또는 동등한 진입 액션) — 앱 레이어에서 풀화면 패널 표시와 연결
- **빈 상태**: Job이 없으면 **아이콘만** 노출. 시작/제어/풀화면 등 버튼은 노출하지 않음(`06-ui-ux.md` 제약: "개념만 두고 버튼 노출하지 말자")

**와이어프레임** (`06-ui-ux.md`와 동일)

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

**동작 메모**

- 드롭다운/팝오버 열림 시 포커스 트랩 및 `aria-expanded` 관리(`06-ui-ux.md` §접근성 가이드라인과 정합)
- Job 목록 영역은 `role="list"` / 항목 `role="listitem"` 권장

---

### 2. FullView.svelte (`06-ui-ux.md` §2 + §반응형 레이아웃 모드)

**Props**

```svelte
<script lang="ts">
  import type { AppContext } from '../../app/context';
  import type { Snippet } from 'svelte';

  interface Props {
    context: AppContext;
    /** Phase 3E에서 구현할 TimeEntry 목록 영역 */
    time_entry_section?: Snippet;
    /** Phase 3F에서 구현할 설정(카테고리·커스텀 필드) 영역 */
    settings_section?: Snippet;
  }

  let { context, time_entry_section, settings_section }: Props = $props();
</script>
```

**레이아웃 모드** (부모 `LayoutSwitcher`가 감지한 값을 context 또는 prop으로 수신)

| 모드 | 조건 | 레이아웃 |
| --- | --- | --- |
| **Compact** | 컨테이너 폭 `< 600px` | 단일 컬럼, 탭 네비게이션 `[작업]` `[기록]` `[설정]` |
| **Full** | 컨테이너 폭 `>= 600px` | 사이드바(Job 목록) + 메인(타이머 + 최근 기록 요약 등) 2컬럼 |

**섹션**

- **작업** 탭: `JobList` + 타이머 + 상태 필터(기존 Phase 2 컴포넌트 재사용)
- **기록** 탭: `TimeEntryList` — Phase 3E에서 구현. 본 단계에서는 `{@render time_entry_section?.()}` 등으로 **슬롯(스니펫)만 배치**
- **설정** 탭: 카테고리 관리 + 커스텀 필드 관리 — Phase 3F에서 구현. 동일하게 `{@render settings_section?.()}` 로 슬롯만 배치

**반응형 와이어프레임 참고** (`06-ui-ux.md`)

- Compact: 상단 탭 + 단일 컬럼 본문
- Full: 좌측 작업 목록 + 우측 타이머/기록 영역

**동작 메모**

- 탭 전환 시 선택된 탭에 `aria-selected`, 패널에 `role="tabpanel"` 및 `id` 연결

---

### 3. InlineView.svelte (`06-ui-ux.md` §3)

**Props**

```svelte
<script lang="ts">
  import type { AppContext } from '../../app/context';

  interface Props {
    context: AppContext;
    page_uuid: string;
    page_title: string;
  }

  let { context, page_uuid, page_title }: Props = $props();
</script>
```

**기능**

- 현재 페이지 기준 **시작** 버튼(원클릭 시작 정책은 `06-ui-ux.md` §원클릭 시작 시 카테고리 자동 선택 정책 준수)
- **페이지→Job 매핑** (`ExternalRef`, `06-ui-ux.md` §페이지→Job 매핑 플로우):
  1. `IExternalRefRepository.getExternalRefBySystemAndValue('logseq', page_uuid)` 호출
  2. 있으면 해당 `job_id`로 기존 Job에 타이머 연동
  3. 없으면 새 Job 생성(`title`: `page_title`) + ExternalRef 생성(`system_key: 'logseq'`, `ref_value: page_uuid`) 후 `TimerService.start()` 등
  4. Job 생성 + ExternalRef + 타이머 전환은 **단일 UoW 트랜잭션**으로 원자성 보장
- 카테고리 뱃지 + 클릭 시 셀렉터(또는 모달)로 변경
- 중앙에 진행 중 Job이 있으면 해당 Job 정보 표시; 없으면 위 매핑/생성 플로우로 시작

---

### 4. LayoutSwitcher.svelte

**역할**: `ResizeObserver`로 래퍼 요소의 폭을 관찰하고, `compact` / `full` 레이아웃 모드를 결정해 자식에 전달합니다.

```svelte
<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';

  const LAYOUT_MODE_KEY = Symbol('layout_mode');

  interface Props {
    children: Snippet<[{ layout_mode: 'compact' | 'full' }]>;
  }

  let { children }: Props = $props();

  let container_el: HTMLDivElement | undefined = $state();
  let layout_mode = $state<'compact' | 'full'>('compact');

  $effect(() => {
    const el = container_el;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      layout_mode = width >= 600 ? 'full' : 'compact';
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  setContext(LAYOUT_MODE_KEY, () => layout_mode);
</script>

<div bind:this={container_el} class="layout-switcher-root">
  {@render children({ layout_mode })}
</div>
```

**동작**

- 임계값 `600`은 `06-ui-ux.md` §반응형 레이아웃 모드와 동일
- 마운트 직후 `ResizeObserver` 콜백이 늦게 오는 경우가 있으므로, `container_el`이 바인딩된 뒤 `contentRect` 또는 `getBoundingClientRect().width`로 **초기 1회** `layout_mode`를 맞추는 것을 권장합니다
- 자식이 snippet 인자 대신 `getContext`만 쓰도록 할 경우, `setContext`에 읽기 함수·`$derived`·스토어 패턴 중 하나로 통일(팀 컨벤션에 맞게 고정)

---

### 5. `components/index.ts` · `App.svelte` 통합

- `components/index.ts`: `Toolbar`, `FullView`, `InlineView`, `LayoutSwitcher` export
- `logseq-time-tracker/src/App.svelte`:
  - Logseq UI 슬롯별로 Toolbar / FullView(를 `LayoutSwitcher`로 감쌈) / InlineView 마운트
  - 동일 `AppContext`를 각 모드에 전달
  - 풀화면 열기/닫기 상태는 앱 레이어 state로 관리하고 Toolbar와 FullView가 공유

---

## 완료 기준

- [ ] Toolbar.svelte: 진행 중 Job 표시, 빠른 제어(일시정지/종료/재개), 대기 작업 목록, 풀화면 열기
- [ ] Toolbar 빈 상태: Job 없을 때 아이콘만 노출
- [ ] FullView.svelte: Compact(`< 600px`) / Full(`>= 600px`) 반응형 레이아웃
- [ ] FullView 탭: 작업/기록/설정 탭 네비게이션(기록/설정은 슬롯으로 준비)
- [ ] InlineView.svelte: 페이지 기반 시작 버튼, ExternalRef 매핑
- [ ] LayoutSwitcher.svelte: ResizeObserver 기반 Compact/Full 전환
- [ ] App.svelte 모드 통합
- [ ] a11y: 키보드 내비게이션, aria 속성

---

## 다음 단계

→ **3G: 테스트** (UI 모드 전환 컴포넌트 테스트)
