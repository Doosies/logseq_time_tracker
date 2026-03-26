<script lang="ts">
    import type { AppContext } from '../../app/context';
    import type { Job } from '../../types/job';
    import type { Category } from '../../types/category';
    import TimerDisplay from '../Timer/TimerDisplay.svelte';
    import ReasonModal from '../ReasonModal/ReasonModal.svelte';
    import * as css from './toolbar.css';

    const TOOLBAR_RESUME_REASON = '툴바 재개';

    let {
        context,
        on_open_full_view = () => {},
        inline = false,
    }: {
        context: AppContext;
        on_open_full_view?: () => void;
        inline?: boolean;
    } = $props();

    const timer_store = $derived(context.stores.timer_store);
    const job_store = $derived(context.stores.job_store);
    const toast_store = $derived(context.stores.toast_store);

    const has_jobs = $derived(job_store.jobs.length > 0);

    const switchable_jobs = $derived.by(() => {
        const active_id = timer_store.active_job_id;
        const pending = job_store.pending_jobs.filter((j) => j.id !== active_id);
        const paused = job_store.paused_jobs.filter((j) => j.id !== active_id);
        return [...pending, ...paused].slice(0, 5);
    });

    let dropdown_open = $state(false);
    let trigger_el: HTMLButtonElement | undefined = $state();
    let panel_el: HTMLDivElement | undefined = $state();
    let last_focus_el: Element | null = null;

    let show_reason_modal = $state(false);
    let reason_modal_config = $state<{
        title: string;
        action: (reason: string) => void | Promise<void>;
        allow_empty?: boolean;
    } | null>(null);

    function openReasonModal(
        title: string,
        action: (reason: string) => void | Promise<void>,
        allow_empty?: boolean,
    ): void {
        reason_modal_config = allow_empty === undefined ? { title, action } : { title, action, allow_empty };
        show_reason_modal = true;
    }

    function closeReasonModal(): void {
        show_reason_modal = false;
        reason_modal_config = null;
    }

    async function resolveCategoryForJob(job_id: string): Promise<Category> {
        const links = await context.services.job_category_service.getJobCategories(job_id);
        const def = links.find((l) => l.is_default);
        const categories = await context.services.category_service.getCategories();
        const cat = (def ? categories.find((c) => c.id === def.category_id) : undefined) ?? categories[0];
        if (!cat) {
            throw new Error('사용 가능한 카테고리가 없습니다');
        }
        return cat;
    }

    async function refreshJobs(): Promise<void> {
        const jobs = await context.services.job_service.getJobs();
        job_store.setJobs(jobs);
    }

    function collectFocusables(root: HTMLElement): HTMLElement[] {
        const selector =
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
            (el) => el.offsetParent !== null || el === root,
        );
    }

    function closeDropdown(): void {
        dropdown_open = false;
    }

    function toggleDropdown(): void {
        dropdown_open = !dropdown_open;
    }

    $effect(() => {
        if (inline) return;
        if (!dropdown_open) return;

        last_focus_el = document.activeElement;

        const handle_doc_mousedown = (e: MouseEvent) => {
            const t = e.target;
            if (!(t instanceof Node)) return;
            if (panel_el?.contains(t) || trigger_el?.contains(t)) return;
            closeDropdown();
        };

        const handle_keydown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeDropdown();
                trigger_el?.focus();
                return;
            }
            if (e.key !== 'Tab' || !panel_el) return;
            const focusables = collectFocusables(panel_el);
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (!first || !last) return;
            const active = document.activeElement;
            if (e.shiftKey) {
                if (active === first || !panel_el.contains(active)) {
                    e.preventDefault();
                    last.focus();
                }
            } else if (active === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('mousedown', handle_doc_mousedown, true);
        document.addEventListener('keydown', handle_keydown, true);

        queueMicrotask(() => {
            const focusables = panel_el ? collectFocusables(panel_el) : [];
            (focusables[0] ?? panel_el)?.focus();
        });

        return () => {
            document.removeEventListener('mousedown', handle_doc_mousedown, true);
            document.removeEventListener('keydown', handle_keydown, true);
            if (last_focus_el instanceof HTMLElement) {
                last_focus_el.focus();
            }
        };
    });

    function handlePause(): void {
        openReasonModal('일시정지 사유', async (reason) => {
            try {
                await context.services.timer_service.pause(reason);
                timer_store.pauseTimer();
                await refreshJobs();
                closeReasonModal();
            } catch (e) {
                toast_store.addToast('error', String(e));
            }
        });
    }

    async function handleResume(): Promise<void> {
        try {
            await context.services.timer_service.resume(TOOLBAR_RESUME_REASON);
            timer_store.resumeTimer();
            await refreshJobs();
        } catch (e) {
            toast_store.addToast('error', String(e));
        }
    }

    function handleStop(): void {
        openReasonModal('완료 사유', async (reason) => {
            try {
                await context.services.timer_service.stop(reason);
                timer_store.stopTimer();
                await refreshJobs();
                closeReasonModal();
            } catch (e) {
                toast_store.addToast('error', String(e));
            }
        });
    }

    function handleToolbarSwitchToJob(job: Job): void {
        openReasonModal(
            '작업 전환 사유',
            async (reason) => {
                try {
                    const category = await resolveCategoryForJob(job.id);
                    const trimmed = reason.trim();
                    await context.services.timer_service.start(job, category, trimmed.length > 0 ? trimmed : undefined);
                    timer_store.startTimer(job, category);
                    await refreshJobs();
                    closeReasonModal();
                    if (!inline) closeDropdown();
                } catch (e) {
                    toast_store.addToast('error', String(e));
                }
            },
            true,
        );
    }

    function handleToolbarCompleteJob(job: Job): void {
        openReasonModal('완료 사유', async (reason) => {
            try {
                await context.services.job_service.transitionStatus(job.id, 'completed', reason);
                await refreshJobs();
                closeReasonModal();
            } catch (e) {
                toast_store.addToast('error', String(e));
            }
        });
    }

    function handleToolbarCancelJob(job: Job): void {
        openReasonModal('취소 사유', async (reason) => {
            try {
                await context.services.job_service.transitionStatus(job.id, 'cancelled', reason);
                await refreshJobs();
                closeReasonModal();
            } catch (e) {
                toast_store.addToast('error', String(e));
            }
        });
    }

    function handleOpenFullView(): void {
        if (!inline) closeDropdown();
        on_open_full_view();
    }

    const show_running_controls = $derived(timer_store.state.active_job !== null && !timer_store.state.is_paused);
    const show_paused_controls = $derived(timer_store.state.active_job !== null && timer_store.state.is_paused);
</script>

<div class={css.toolbar_root}>
    {#snippet toolbar_content()}
        {#if has_jobs}
            {#if timer_store.state.active_job}
                <div class={css.dropdown_header}>
                    {timer_store.state.active_job.title}
                </div>
                {#if timer_store.state.active_category}
                    <div class={css.dropdown_sub}>{timer_store.state.active_category.name}</div>
                {/if}
                <TimerDisplay
                    accumulated_ms={timer_store.state.accumulated_ms}
                    current_segment_start={timer_store.state.current_segment_start}
                    is_paused={timer_store.state.is_paused}
                />
            {:else}
                <div class={css.dropdown_header}>활성 작업 없음</div>
            {/if}

            <div class={css.button_row}>
                {#if show_running_controls}
                    <button type="button" class={css.toolbar_btn_pause} onclick={() => void handlePause()}>
                        일시정지
                    </button>
                    <button type="button" class={css.toolbar_btn_stop} onclick={() => void handleStop()}> 완료 </button>
                {:else if show_paused_controls}
                    <button type="button" class={css.toolbar_btn_resume} onclick={() => void handleResume()}>
                        재개
                    </button>
                    <button type="button" class={css.toolbar_btn_stop} onclick={() => void handleStop()}> 완료 </button>
                {/if}
            </div>

            {#if switchable_jobs.length > 0}
                <div class={css.job_list_heading} id="toolbar-waiting-heading">대기 / 일시정지</div>
                <ul class={css.job_list} role="list" aria-labelledby="toolbar-waiting-heading">
                    {#each switchable_jobs as job (job.id)}
                        <li class={css.job_list_item} role="listitem">
                            <div class={css.job_list_row}>
                                <span class={css.job_list_title}>{job.title}</span>
                                <div class={css.job_list_actions}>
                                    {#if timer_store.state.active_job}
                                        <button
                                            type="button"
                                            class={css.action_btn_switch}
                                            onclick={() => void handleToolbarSwitchToJob(job)}>전환</button
                                        >
                                    {:else if job.status === 'paused'}
                                        <button
                                            type="button"
                                            class={css.action_btn_resume}
                                            onclick={() => void handleToolbarSwitchToJob(job)}>재개</button
                                        >
                                    {:else}
                                        <button
                                            type="button"
                                            class={css.action_btn_start}
                                            onclick={() => void handleToolbarSwitchToJob(job)}>시작</button
                                        >
                                    {/if}
                                    <button
                                        type="button"
                                        class={css.action_btn_complete}
                                        onclick={() => void handleToolbarCompleteJob(job)}>완료</button
                                    >
                                    <button
                                        type="button"
                                        class={css.action_btn_cancel}
                                        onclick={() => void handleToolbarCancelJob(job)}>취소</button
                                    >
                                </div>
                            </div>
                        </li>
                    {/each}
                </ul>
            {/if}
        {:else}
            <div class={css.dropdown_header}>등록된 작업이 없습니다</div>
        {/if}

        <button type="button" class={css.full_view_btn} onclick={handleOpenFullView}> 전체 화면 열기 </button>
    {/snippet}

    {#if inline}
        <div class={css.inline_panel} role="region" aria-label="타이머 툴바">
            {@render toolbar_content()}
        </div>
    {:else}
        <button
            type="button"
            class={css.toolbar_trigger}
            bind:this={trigger_el}
            aria-haspopup="dialog"
            aria-expanded={dropdown_open}
            aria-label="타이머 툴바 열기"
            onclick={toggleDropdown}
        >
            ⏱
        </button>

        {#if dropdown_open}
            <div class={css.dropdown_panel} bind:this={panel_el} role="dialog" aria-label="타이머 툴바" tabindex="-1">
                {@render toolbar_content()}
            </div>
        {/if}
    {/if}

    {#if show_reason_modal && reason_modal_config}
        <ReasonModal
            title={reason_modal_config.title}
            onconfirm={reason_modal_config.action}
            oncancel={closeReasonModal}
            {...reason_modal_config.allow_empty !== undefined ? { allow_empty: reason_modal_config.allow_empty } : {}}
        />
    {/if}
</div>
