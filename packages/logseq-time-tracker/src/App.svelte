<script lang="ts">
    import { SvelteMap } from 'svelte/reactivity';
    import type { AppContext, TimeEntry } from '@personal/time-tracker-core';
    import {
        Timer,
        JobList,
        ToastContainer,
        EmptyState,
        ReasonModal,
        MAX_TITLE_LENGTH,
        formatDuration,
        formatLocalDateTime,
    } from '@personal/time-tracker-core';

    let { ctx }: { ctx: AppContext } = $props();

    const services = $derived(ctx.services);
    const timer_store = $derived(ctx.stores.timer_store);
    const job_store = $derived(ctx.stores.job_store);
    const toast_store = $derived(ctx.stores.toast_store);

    const time_totals = new SvelteMap<string, number>();

    async function loadTimeTotals() {
        const entries = await ctx.uow.timeEntryRepo.getTimeEntries();
        time_totals.clear();
        for (const entry of entries) {
            time_totals.set(entry.job_id, (time_totals.get(entry.job_id) ?? 0) + entry.duration_seconds);
        }
    }

    $effect(() => {
        void ctx;
        void loadTimeTotals();
    });

    let show_reason_modal = $state(false);
    let reason_modal_config = $state<{
        title: string;
        description?: string;
        placeholder?: string;
        max_length?: number;
        action: (reason: string) => Promise<void>;
    } | null>(null);

    function openReasonModal(
        title: string,
        action: (reason: string) => Promise<void>,
        description?: string,
        placeholder?: string,
        max_length?: number,
    ) {
        reason_modal_config = {
            title,
            action,
            ...(description !== undefined ? { description } : {}),
            ...(placeholder !== undefined ? { placeholder } : {}),
            ...(max_length !== undefined ? { max_length } : {}),
        };
        show_reason_modal = true;
    }

    function closeReasonModal() {
        show_reason_modal = false;
        reason_modal_config = null;
    }

    async function handleStart() {
        const job = job_store.selected_job;
        if (!job) return;
        const categories = await services.category_service.getCategories();
        const category = categories[0];
        if (!category) return;
        try {
            await services.timer_service.start(job, category);
            timer_store.startTimer(job, category);
            const jobs = await services.job_service.getJobs();
            job_store.setJobs(jobs);
            await loadTimeTotals();
        } catch (e) {
            toast_store.addToast('error', String(e));
        }
    }

    function handlePause() {
        openReasonModal('일시정지 사유', async (reason) => {
            try {
                await services.timer_service.pause(reason);
                timer_store.pauseTimer();
                const jobs = await services.job_service.getJobs();
                job_store.setJobs(jobs);
                closeReasonModal();
            } catch (e) {
                toast_store.addToast('error', String(e));
            }
        });
    }

    function handleResume() {
        openReasonModal('재개 사유', async (reason) => {
            try {
                await services.timer_service.resume(reason);
                timer_store.resumeTimer();
                const jobs = await services.job_service.getJobs();
                job_store.setJobs(jobs);
                closeReasonModal();
            } catch (e) {
                toast_store.addToast('error', String(e));
            }
        });
    }

    function handleStop() {
        openReasonModal('완료 사유', async (reason) => {
            try {
                await services.timer_service.stop(reason);
                timer_store.stopTimer();
                const jobs = await services.job_service.getJobs();
                job_store.setJobs(jobs);
                await loadTimeTotals();
                closeReasonModal();
            } catch (e) {
                toast_store.addToast('error', String(e));
            }
        });
    }

    function handleCancel() {
        openReasonModal('취소 사유', async (reason) => {
            try {
                await services.timer_service.cancel(reason);
                timer_store.cancelTimer();
                const jobs = await services.job_service.getJobs();
                job_store.setJobs(jobs);
                await loadTimeTotals();
                closeReasonModal();
            } catch (e) {
                toast_store.addToast('error', String(e));
            }
        });
    }

    function handleCreateJob() {
        openReasonModal(
            '새 작업',
            async (job_title) => {
                try {
                    const job = await services.job_service.createJob({ title: job_title });
                    job_store.addJob(job);
                    job_store.selectJob(job.id);
                    toast_store.addToast('success', `'${job.title}' 작업이 생성되었습니다`);
                    closeReasonModal();
                } catch (e) {
                    toast_store.addToast('error', String(e));
                }
            },
            undefined,
            '작업 이름을 입력하세요 (최소 1글자)',
            MAX_TITLE_LENGTH,
        );
    }

    function handleSelectJob(id: string) {
        job_store.selectJob(id);
    }

    function handleClose() {
        logseq.hideMainUI();
    }

    let show_debug_modal = $state(false);
    let debug_entries = $state<TimeEntry[]>([]);

    function getJobTitle(job_id: string): string {
        const job = job_store.jobs.find((j) => j.id === job_id);
        return job?.title ?? job_id;
    }

    async function openDebugModal() {
        const entries = await ctx.uow.timeEntryRepo.getTimeEntries();
        debug_entries = entries.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
        show_debug_modal = true;
    }

    function closeDebugModal() {
        show_debug_modal = false;
        debug_entries = [];
    }
</script>

<div class="shell">
    <button type="button" class="backdrop-hit" aria-label="닫기" onclick={handleClose}></button>
    <div class="panel">
        <button type="button" class="debug-btn" onclick={openDebugModal} aria-label="기록 보기" title="시간 기록 보기"
            >🕐</button
        >
        <button type="button" class="close-btn" onclick={handleClose} aria-label="닫기">✕</button>
        <main>
            <Timer
                {timer_store}
                {job_store}
                onstart={handleStart}
                onpause={handlePause}
                onresume={handleResume}
                onstop={handleStop}
                oncancel={handleCancel}
                onswitch={handleStart}
            />

            {#if job_store.jobs.length === 0}
                <EmptyState oncreate={handleCreateJob} />
            {:else}
                <JobList
                    jobs={job_store.jobs}
                    selected_job_id={job_store.selected_job_id}
                    {time_totals}
                    onselect={handleSelectJob}
                />
                <div class="add-job-area">
                    <button type="button" class="add-job-btn" onclick={handleCreateJob}>+ 새 작업</button>
                </div>
            {/if}

            <ToastContainer {toast_store} />

            {#if show_reason_modal && reason_modal_config}
                <ReasonModal
                    title={reason_modal_config.title}
                    {...reason_modal_config.description !== undefined
                        ? { description: reason_modal_config.description }
                        : {}}
                    {...reason_modal_config.placeholder !== undefined
                        ? { placeholder: reason_modal_config.placeholder }
                        : {}}
                    {...reason_modal_config.max_length !== undefined
                        ? { max_length: reason_modal_config.max_length }
                        : {}}
                    onconfirm={reason_modal_config.action}
                    oncancel={closeReasonModal}
                />
            {/if}
        </main>

        {#if show_debug_modal}
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
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
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

    .add-job-area {
        padding: 8px 16px;
    }

    .add-job-btn {
        width: 100%;
        padding: 8px;
        border: 1px dashed #ccc;
        border-radius: 4px;
        background: transparent;
        cursor: pointer;
        color: #666;
        font-size: 0.875rem;
    }

    .add-job-btn:hover {
        border-color: #999;
        color: #333;
        background: rgba(0, 0, 0, 0.02);
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
</style>
