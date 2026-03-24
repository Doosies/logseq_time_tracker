<script lang="ts">
    import type { AppContext } from '@personal/time-tracker-core';
    import {
        Timer,
        JobList,
        ToastContainer,
        EmptyState,
        ReasonModal,
        MAX_TITLE_LENGTH,
    } from '@personal/time-tracker-core';

    let { ctx }: { ctx: AppContext } = $props();

    const services = $derived(ctx.services);
    const timer_store = $derived(ctx.stores.timer_store);
    const job_store = $derived(ctx.stores.job_store);
    const toast_store = $derived(ctx.stores.toast_store);

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
</script>

<div class="shell">
    <button type="button" class="backdrop-hit" aria-label="닫기" onclick={handleClose}></button>
    <div class="panel">
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
            />

            {#if job_store.jobs.length === 0}
                <EmptyState oncreate={handleCreateJob} />
            {:else}
                <JobList jobs={job_store.jobs} selected_job_id={job_store.selected_job_id} onselect={handleSelectJob} />
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
</style>
