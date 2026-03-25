<script lang="ts">
    import type { AppContext, TimeEntry, JobHistory, PocResult } from '@personal/time-tracker-core';
    import {
        FullView,
        Toolbar,
        LayoutSwitcher,
        ToastContainer,
        STRINGS,
        formatDuration,
        formatLocalDateTime,
        runAllPocTests,
    } from '@personal/time-tracker-core';

    let { ctx }: { ctx: AppContext } = $props();

    const job_store = $derived(ctx.stores.job_store);
    const toast_store = $derived(ctx.stores.toast_store);

    const storage_mode_label = $derived.by(() => {
        if (!ctx.storage_manager) return 'Memory (기본)';
        const state = ctx.storage_manager.getStorageState();
        if (state.mode === 'sqlite') return 'SQLite';
        return `Memory Fallback (${state.fallback_reason ?? '알 수 없음'})`;
    });

    let storage_banner = $state<{ type: 'warning' | 'info'; message: string } | null>(null);

    $effect(() => {
        const sm = ctx.storage_manager;
        if (!sm) return;
        const unsub = sm.subscribe((state) => {
            if (state.mode === 'memory_fallback') {
                storage_banner = {
                    type: 'warning',
                    message: '임시 모드: 데이터가 영구 저장되지 않습니다.',
                };
            } else {
                if (storage_banner?.type === 'warning') {
                    toast_store.addToast('success', '저장소가 복구되었습니다');
                }
                storage_banner = null;
            }
        });
        return unsub;
    });

    $effect(() => {
        const sm = ctx.storage_manager;
        if (!sm) return;
        const unsub = sm.subscribeReadonly((readonly_mode) => {
            if (readonly_mode) {
                storage_banner = {
                    type: 'info',
                    message: '다른 탭에서 실행 중 - 읽기 전용 모드',
                };
            } else {
                if (storage_banner?.type === 'info') {
                    toast_store.addToast('success', '전체 기능이 복원되었습니다');
                }
                storage_banner = null;
            }
        });
        return unsub;
    });

    function handleClose() {
        show_full_view = false;
        logseq.hideMainUI();
    }

    let show_full_view = $state(false);

    function handleOpenFullView() {
        show_full_view = true;
    }

    function handleBackToToolbar() {
        show_full_view = false;
    }

    let show_debug_modal = $state(false);

    $effect(() => {
        const handle_keydown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !show_debug_modal) {
                logseq.hideMainUI();
            }
        };
        document.addEventListener('keydown', handle_keydown);
        return () => document.removeEventListener('keydown', handle_keydown);
    });

    let debug_entries = $state<TimeEntry[]>([]);
    let debug_history = $state<JobHistory[]>([]);
    let poc_results = $state<PocResult[]>([]);
    let poc_running = $state(false);

    async function handleRunPocTests() {
        poc_running = true;
        poc_results = [];
        try {
            poc_results = await runAllPocTests(new URL('./assets/', document.baseURI).href);
        } catch (e) {
            poc_results = [{ test_name: 'runAllPocTests', success: false, error: String(e) }];
        } finally {
            poc_running = false;
        }
    }

    function getJobTitle(job_id: string): string {
        const job = job_store.jobs.find((j) => j.id === job_id);
        return job?.title ?? job_id;
    }

    function getStatusLabel(status: string | null): string {
        if (!status) return '-';
        return (STRINGS.job.status as Record<string, string>)[status] ?? status;
    }

    async function openDebugModal() {
        const entries = await ctx.uow.timeEntryRepo.getTimeEntries();
        debug_entries = entries.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
        const history = await ctx.uow.historyRepo.getJobHistoryByPeriod({});
        debug_history = history.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
        poc_results = [];
        show_debug_modal = true;
    }

    function closeDebugModal() {
        show_debug_modal = false;
        debug_entries = [];
        debug_history = [];
    }
</script>

{#if show_full_view}
    <!-- FullView: 기존 shell + backdrop + panel 구조 -->
    <div class="shell">
        <button type="button" class="backdrop-hit" aria-label="닫기" onclick={handleClose}></button>
        <div class="panel panel--fullview">
            <button type="button" class="back-btn" onclick={handleBackToToolbar} aria-label="돌아가기">←</button>
            <button
                type="button"
                class="debug-btn"
                onclick={openDebugModal}
                aria-label="기록 보기"
                title="시간 기록 보기">🕐</button
            >
            <button type="button" class="close-btn" onclick={handleClose} aria-label="닫기">✕</button>
            <main class="panel-main">
                {#if storage_banner}
                    <div class="storage-banner storage-banner--{storage_banner.type}">
                        <span>{storage_banner.message}</span>
                        {#if storage_banner.type === 'warning'}
                            <button
                                type="button"
                                class="storage-banner-retry"
                                onclick={() => {
                                    void ctx.storage_manager?.tryRecover();
                                }}
                            >
                                재시도
                            </button>
                        {/if}
                    </div>
                {/if}
                <LayoutSwitcher>
                    {#snippet children({ layout_mode })}
                        <FullView context={ctx} {layout_mode} />
                    {/snippet}
                </LayoutSwitcher>
                <ToastContainer {toast_store} />
            </main>
        </div>
    </div>
{:else}
    <!-- Toolbar: 드롭다운 모드 -->
    <div class="dropdown-backdrop">
        <button type="button" class="dropdown-backdrop-hit" aria-label="닫기" onclick={handleClose}></button>
        <div class="dropdown-shell">
            {#if storage_banner}
                <div class="storage-banner storage-banner--{storage_banner.type}">
                    <span>{storage_banner.message}</span>
                    {#if storage_banner.type === 'warning'}
                        <button
                            type="button"
                            class="storage-banner-retry"
                            onclick={() => {
                                void ctx.storage_manager?.tryRecover();
                            }}
                        >
                            재시도
                        </button>
                    {/if}
                </div>
            {/if}
            <Toolbar context={ctx} on_open_full_view={handleOpenFullView} inline={true} />
            <ToastContainer {toast_store} />
        </div>
    </div>
{/if}

{#if show_debug_modal}
    <!-- debug modal은 모드와 무관하게 항상 사용 가능 -->
    <div class="debug-overlay" role="dialog" aria-label="시간 기록">
        <div class="debug-modal">
            <div class="debug-header">
                <h2 class="debug-title">시간 기록 (Debug)</h2>
                <button type="button" class="debug-close" onclick={closeDebugModal} aria-label="닫기">✕</button>
            </div>
            <div class="debug-body">
                {#if debug_entries.length === 0}
                    <p class="debug-empty">기록이 없습니다.</p>
                {:else}
                    <table class="debug-table">
                        <thead>
                            <tr>
                                <th>작업</th>
                                <th>시작</th>
                                <th>종료</th>
                                <th>소요</th>
                                <th>노트</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each debug_entries as entry (entry.id)}
                                <tr>
                                    <td>{getJobTitle(entry.job_id)}</td>
                                    <td>{formatLocalDateTime(entry.started_at)}</td>
                                    <td>{formatLocalDateTime(entry.ended_at)}</td>
                                    <td class="debug-duration">{formatDuration(entry.duration_seconds)}</td>
                                    <td>{entry.note || '-'}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {/if}
                {#if debug_history.length > 0}
                    <h3 class="debug-subtitle">상태 전환 이력</h3>
                    <table class="debug-table">
                        <thead>
                            <tr>
                                <th>작업</th>
                                <th>시각</th>
                                <th>전환</th>
                                <th>사유</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each debug_history as h (h.id)}
                                <tr>
                                    <td>{getJobTitle(h.job_id)}</td>
                                    <td>{formatLocalDateTime(h.occurred_at)}</td>
                                    <td>{getStatusLabel(h.from_status)} → {getStatusLabel(h.to_status)}</td>
                                    <td>{h.reason || '-'}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {/if}

                <h3 class="debug-subtitle">스토리지 상태</h3>
                <p class="storage-mode-badge">
                    현재 모드: <strong>{storage_mode_label}</strong>
                </p>

                <button type="button" class="poc-test-btn" onclick={handleRunPocTests} disabled={poc_running}>
                    {poc_running ? '검증 중...' : 'Storage PoC 검증 실행'}
                </button>

                {#if poc_results.length > 0}
                    <table class="debug-table">
                        <thead>
                            <tr>
                                <th>테스트</th>
                                <th>결과</th>
                                <th>상세</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each poc_results as result (result.test_name)}
                                <tr>
                                    <td>{result.test_name}</td>
                                    <td class={result.success ? 'poc-pass' : 'poc-fail'}>
                                        {result.success ? 'PASS' : 'FAIL'}
                                    </td>
                                    <td>{result.details ?? result.error ?? '-'}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .dropdown-backdrop {
        position: fixed;
        inset: 0;
        z-index: 10;
    }

    .dropdown-backdrop-hit {
        position: fixed;
        inset: 0;
        background: transparent;
        border: none;
        padding: 0;
        margin: 0;
        cursor: default;
    }

    .dropdown-shell {
        position: absolute;
        top: 3.5rem;
        right: 1rem;
        width: 360px;
        max-height: 80vh;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        overflow-y: auto;
        z-index: 11;
    }

    .shell {
        position: fixed;
        inset: 0;
        display: flex;
        justify-content: flex-end;
        align-items: stretch;
    }

    .backdrop-hit {
        flex: 1;
        min-width: 0;
        border: none;
        padding: 0;
        margin: 0;
        background: rgba(0, 0, 0, 0.3);
        cursor: pointer;
        align-self: stretch;
    }

    .panel {
        position: relative;
        width: 360px;
        height: 100vh;
        background: white;
        overflow-y: auto;
        box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
        transition: width 0.2s ease;
    }

    .panel--fullview {
        width: min(calc(100vw - 64px), 800px);
    }

    .panel-main {
        /* 우상단 absolute 헤더 버튼과 FullView 탭바 겹침 완화 */
        padding-top: 40px;
    }

    .back-btn {
        position: absolute;
        top: 8px;
        left: 8px;
        width: 28px;
        height: 28px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 16px;
        color: #666;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .back-btn:hover {
        background: rgba(0, 0, 0, 0.08);
        color: #333;
    }

    .close-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 28px;
        height: 28px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 16px;
        color: #666;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .close-btn:hover {
        background: rgba(0, 0, 0, 0.08);
        color: #333;
    }

    .debug-btn {
        position: absolute;
        top: 8px;
        right: 40px;
        width: 28px;
        height: 28px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 16px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .debug-btn:hover {
        background: rgba(0, 0, 0, 0.08);
    }

    .debug-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
    }

    .debug-modal {
        background: white;
        border-radius: 8px;
        width: 90%;
        max-width: 700px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
    }

    .debug-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid #e5e7eb;
    }

    .debug-title {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
    }

    .debug-close {
        width: 28px;
        height: 28px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 16px;
        color: #666;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .debug-close:hover {
        background: rgba(0, 0, 0, 0.08);
        color: #333;
    }

    .debug-body {
        padding: 16px;
        overflow-y: auto;
        flex: 1;
    }

    .debug-empty {
        text-align: center;
        color: #999;
        padding: 24px 0;
    }

    .debug-subtitle {
        margin: 16px 0 8px;
        font-size: 0.875rem;
        font-weight: 600;
        color: #333;
    }

    .debug-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.75rem;
    }

    .debug-table th,
    .debug-table td {
        padding: 6px 8px;
        text-align: left;
        border-bottom: 1px solid #f0f0f0;
        white-space: nowrap;
    }

    .debug-table th {
        font-weight: 600;
        color: #666;
        position: sticky;
        top: 0;
        background: white;
    }

    .debug-duration {
        font-family: monospace;
        font-variant-numeric: tabular-nums;
    }

    .storage-mode-badge {
        font-size: 0.8rem;
        color: #555;
        margin: 4px 0 8px;
    }

    .poc-test-btn {
        padding: 6px 12px;
        border: 1px solid #1d4ed8;
        border-radius: 4px;
        background: #1d4ed8;
        color: white;
        cursor: pointer;
        font-size: 0.8rem;
        margin-bottom: 8px;
    }

    .poc-test-btn:hover:not(:disabled) {
        background: #2563eb;
    }

    .poc-test-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .poc-pass {
        color: #16a34a;
        font-weight: 600;
    }

    .poc-fail {
        color: #dc2626;
        font-weight: 600;
    }

    .storage-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 16px;
        font-size: 0.8rem;
        border-bottom: 1px solid;
    }

    .storage-banner--warning {
        background: #fef3cd;
        color: #856404;
        border-color: #ffc107;
    }

    .storage-banner--info {
        background: #cce5ff;
        color: #004085;
        border-color: #b8daff;
    }

    .storage-banner-retry {
        padding: 2px 8px;
        border: 1px solid currentColor;
        border-radius: 4px;
        background: transparent;
        color: inherit;
        cursor: pointer;
        font-size: 0.75rem;
    }

    .storage-banner-retry:hover {
        background: rgba(0, 0, 0, 0.05);
    }
</style>
