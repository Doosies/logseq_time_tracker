<script lang="ts">
    import { SvelteMap } from 'svelte/reactivity';
    import type { Snippet } from 'svelte';
    import type { AppContext } from '../../app/context';
    import { Timer } from '../Timer';
    import { JobList } from '../JobList';
    import { EmptyState } from '../EmptyState';
    import { ReasonModal } from '../ReasonModal';
    import { MAX_TITLE_LENGTH, MAX_REASON_LENGTH } from '../../constants/config';
    import * as css from './full_view.css';

    let {
        context,
        layout_mode = 'compact',
        time_entry_section,
        settings_section,
    }: {
        context: AppContext;
        layout_mode?: 'compact' | 'full';
        time_entry_section?: Snippet;
        settings_section?: Snippet;
    } = $props();

    const services = $derived(context.services);
    const timer_store = $derived(context.stores.timer_store);
    const job_store = $derived(context.stores.job_store);
    const toast_store = $derived(context.stores.toast_store);

    const time_totals = new SvelteMap<string, number>();

    const selected_job_total_seconds = $derived(
        job_store.selected_job_id ? (time_totals.get(job_store.selected_job_id) ?? 0) : 0,
    );

    async function loadTimeTotals(): Promise<void> {
        const entries = await context.uow.timeEntryRepo.getTimeEntries();
        time_totals.clear();
        for (const entry of entries) {
            time_totals.set(entry.job_id, (time_totals.get(entry.job_id) ?? 0) + entry.duration_seconds);
        }
    }

    $effect(() => {
        void context;
        void loadTimeTotals();
    });

    let active_tab = $state<'jobs' | 'entries' | 'settings'>('jobs');

    let show_reason_modal = $state(false);
    let reason_modal_config = $state<{
        title: string;
        description?: string;
        placeholder?: string;
        max_length?: number;
        allow_empty?: boolean;
        action: (reason: string) => Promise<void>;
    } | null>(null);

    function openReasonModal(
        title: string,
        action: (reason: string) => Promise<void>,
        description?: string,
        placeholder?: string,
        max_length?: number,
        allow_empty?: boolean,
    ): void {
        reason_modal_config = {
            title,
            action,
            ...(description !== undefined ? { description } : {}),
            ...(placeholder !== undefined ? { placeholder } : {}),
            ...(max_length !== undefined ? { max_length } : {}),
            ...(allow_empty !== undefined ? { allow_empty } : {}),
        };
        show_reason_modal = true;
    }

    function closeReasonModal(): void {
        show_reason_modal = false;
        reason_modal_config = null;
    }

    async function refreshJobs(): Promise<void> {
        const jobs = await services.job_service.getJobs();
        job_store.setJobs(jobs);
    }

    async function handleStart(): Promise<void> {
        const job = job_store.selected_job;
        if (!job) return;
        const categories = await services.category_service.getCategories();
        const category = categories[0];
        if (!category) return;
        try {
            await services.timer_service.start(job, category);
            timer_store.startTimer(job, category);
            await refreshJobs();
            await loadTimeTotals();
        } catch (e) {
            toast_store.addToast('error', String(e));
        }
    }

    function handlePause(): void {
        openReasonModal('일시정지 사유', async (reason) => {
            try {
                await services.timer_service.pause(reason);
                timer_store.pauseTimer();
                await refreshJobs();
                closeReasonModal();
            } catch (e) {
                toast_store.addToast('error', String(e));
            }
        });
    }

    function handleResume(): void {
        openReasonModal('재개 사유', async (reason) => {
            try {
                await services.timer_service.resume(reason);
                timer_store.resumeTimer();
                await refreshJobs();
                closeReasonModal();
            } catch (e) {
                toast_store.addToast('error', String(e));
            }
        });
    }

    function handleStop(): void {
        openReasonModal('완료 사유', async (reason) => {
            try {
                await services.timer_service.stop(reason);
                timer_store.stopTimer();
                await refreshJobs();
                await loadTimeTotals();
                closeReasonModal();
            } catch (e) {
                toast_store.addToast('error', String(e));
            }
        });
    }

    function handleCancel(): void {
        openReasonModal('취소 사유', async (reason) => {
            try {
                await services.timer_service.cancel(reason);
                timer_store.cancelTimer();
                await refreshJobs();
                await loadTimeTotals();
                closeReasonModal();
            } catch (e) {
                toast_store.addToast('error', String(e));
            }
        });
    }

    function handleSwitch(): void {
        const job = job_store.selected_job;
        if (!job) return;
        openReasonModal(
            '작업 전환 사유',
            async (reason) => {
                const trimmed = reason.trim();
                const categories = await services.category_service.getCategories();
                const category = categories[0];
                if (!category) return;
                try {
                    await services.timer_service.start(job, category, trimmed.length > 0 ? trimmed : undefined);
                    timer_store.startTimer(job, category);
                    await refreshJobs();
                    await loadTimeTotals();
                    closeReasonModal();
                } catch (e) {
                    toast_store.addToast('error', String(e));
                }
            },
            undefined,
            `입력하지 않으면 기본 사유(작업 전환: ${job.title})가 적용됩니다`,
            MAX_REASON_LENGTH,
            true,
        );
    }

    function handleCreateJob(): void {
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

    function handleSelectJob(id: string): void {
        job_store.selectJob(id);
    }

    const jobs_panel_id = 'fullview-panel-jobs';
    const entries_panel_id = 'fullview-panel-entries';
    const settings_panel_id = 'fullview-panel-settings';
</script>

<div class={css.full_view_root}>
    {#if layout_mode === 'compact'}
        <div class={css.tablist} role="tablist" aria-label="화면 구역">
            <button
                type="button"
                class={css.tab_button}
                role="tab"
                id="fullview-tab-jobs"
                aria-selected={active_tab === 'jobs'}
                aria-controls={jobs_panel_id}
                onclick={() => {
                    active_tab = 'jobs';
                }}
            >
                작업
            </button>
            <button
                type="button"
                class={css.tab_button}
                role="tab"
                id="fullview-tab-entries"
                aria-selected={active_tab === 'entries'}
                aria-controls={entries_panel_id}
                onclick={() => {
                    active_tab = 'entries';
                }}
            >
                기록
            </button>
            <button
                type="button"
                class={css.tab_button}
                role="tab"
                id="fullview-tab-settings"
                aria-selected={active_tab === 'settings'}
                aria-controls={settings_panel_id}
                onclick={() => {
                    active_tab = 'settings';
                }}
            >
                설정
            </button>
        </div>

        <div
            class={css.tab_panel}
            role="tabpanel"
            id={jobs_panel_id}
            aria-labelledby="fullview-tab-jobs"
            hidden={active_tab !== 'jobs'}
        >
            <Timer
                {timer_store}
                {job_store}
                {selected_job_total_seconds}
                onstart={handleStart}
                onpause={handlePause}
                onresume={handleResume}
                onstop={handleStop}
                oncancel={handleCancel}
                onswitch={handleSwitch}
            />
            {#if job_store.jobs.length === 0}
                <EmptyState oncreate={handleCreateJob} />
            {:else}
                <JobList
                    jobs={job_store.jobs}
                    selected_job_id={job_store.selected_job_id}
                    {time_totals}
                    active_job_id={timer_store.active_job_id}
                    running_since={timer_store.state.current_segment_start}
                    accumulated_ms={timer_store.state.accumulated_ms}
                    onselect={handleSelectJob}
                />
                <div class={css.add_job_area}>
                    <button type="button" class={css.add_job_btn} onclick={handleCreateJob}>+ 새 작업</button>
                </div>
            {/if}
        </div>

        <div
            class={css.tab_panel}
            role="tabpanel"
            id={entries_panel_id}
            aria-labelledby="fullview-tab-entries"
            hidden={active_tab !== 'entries'}
        >
            {#if time_entry_section}
                {@render time_entry_section()}
            {:else}
                <p class={css.placeholder_block}>기록 영역은 이후 단계에서 연결됩니다.</p>
            {/if}
        </div>

        <div
            class={css.tab_panel}
            role="tabpanel"
            id={settings_panel_id}
            aria-labelledby="fullview-tab-settings"
            hidden={active_tab !== 'settings'}
        >
            {#if settings_section}
                {@render settings_section()}
            {:else}
                <p class={css.placeholder_block}>설정 영역은 이후 단계에서 연결됩니다.</p>
            {/if}
        </div>
    {:else}
        <div class={css.full_layout}>
            <aside class={css.sidebar} aria-label="작업 목록">
                {#if job_store.jobs.length === 0}
                    <EmptyState oncreate={handleCreateJob} />
                {:else}
                    <JobList
                        jobs={job_store.jobs}
                        selected_job_id={job_store.selected_job_id}
                        {time_totals}
                        active_job_id={timer_store.active_job_id}
                        running_since={timer_store.state.current_segment_start}
                        accumulated_ms={timer_store.state.accumulated_ms}
                        onselect={handleSelectJob}
                    />
                    <div class={css.add_job_area}>
                        <button type="button" class={css.add_job_btn} onclick={handleCreateJob}>+ 새 작업</button>
                    </div>
                {/if}
            </aside>
            <div class={css.main_column}>
                <Timer
                    {timer_store}
                    {job_store}
                    {selected_job_total_seconds}
                    onstart={handleStart}
                    onpause={handlePause}
                    onresume={handleResume}
                    onstop={handleStop}
                    oncancel={handleCancel}
                    onswitch={handleSwitch}
                />
                <div>
                    <div class={css.section_label}>최근 기록</div>
                    {#if time_entry_section}
                        {@render time_entry_section()}
                    {:else}
                        <p class={css.placeholder_block}>요약은 이후 단계에서 표시됩니다.</p>
                    {/if}
                </div>
                <div class={css.settings_block}>
                    <div class={css.section_label}>설정</div>
                    {#if settings_section}
                        {@render settings_section()}
                    {:else}
                        <p class={css.placeholder_block}>설정은 이후 단계에서 연결됩니다.</p>
                    {/if}
                </div>
            </div>
        </div>
    {/if}

    {#if show_reason_modal && reason_modal_config}
        <ReasonModal
            title={reason_modal_config.title}
            {...reason_modal_config.description !== undefined ? { description: reason_modal_config.description } : {}}
            {...reason_modal_config.placeholder !== undefined ? { placeholder: reason_modal_config.placeholder } : {}}
            {...reason_modal_config.max_length !== undefined ? { max_length: reason_modal_config.max_length } : {}}
            {...reason_modal_config.allow_empty !== undefined ? { allow_empty: reason_modal_config.allow_empty } : {}}
            onconfirm={reason_modal_config.action}
            oncancel={closeReasonModal}
        />
    {/if}
</div>
