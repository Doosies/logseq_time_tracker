<script lang="ts">
    import * as css from './job_selector.css';
    import type { Job } from '../../types/job';
    import type { StatusKind } from '../../types/job_status';

    let {
        jobs,
        selected_id,
        onSelect,
        status_filter,
    }: {
        jobs: Job[];
        selected_id: string | null;
        onSelect: (id: string) => void;
        status_filter?: StatusKind[];
    } = $props();

    const listbox_id = `job-lb-${Math.random().toString(36).slice(2, 11)}`;

    let container_ref: HTMLDivElement | undefined = $state(undefined);
    let trigger_ref: HTMLButtonElement | undefined = $state(undefined);
    let search_input_ref: HTMLInputElement | undefined = $state(undefined);

    let is_open = $state(false);
    let search_query = $state('');
    let active_index = $state(0);

    const search_trimmed = $derived(search_query.trim().toLowerCase());

    const filtered_jobs = $derived.by(() => {
        let list = jobs;
        if (status_filter !== undefined && status_filter.length > 0) {
            const allowed = new Set(status_filter);
            list = list.filter((j) => allowed.has(j.status));
        }
        if (search_trimmed.length > 0) {
            list = list.filter((j) => j.title.toLowerCase().includes(search_trimmed));
        }
        return list;
    });

    $effect(() => {
        if (filtered_jobs.length === 0) {
            active_index = 0;
        } else if (active_index >= filtered_jobs.length) {
            active_index = filtered_jobs.length - 1;
        }
    });

    $effect(() => {
        if (!is_open) {
            search_query = '';
            active_index = 0;
        }
    });

    $effect(() => {
        if (!is_open) {
            return;
        }
        const handler = (e: MouseEvent) => {
            if (container_ref && !container_ref.contains(e.target as Node)) {
                is_open = false;
            }
        };
        document.addEventListener('click', handler, true);
        return () => document.removeEventListener('click', handler, true);
    });

    const selected_job = $derived(selected_id === null ? null : (jobs.find((j) => j.id === selected_id) ?? null));

    const active_option_dom_id = $derived(filtered_jobs.length > 0 ? `${listbox_id}-opt-${active_index}` : undefined);

    function badgeClass(status: StatusKind): string {
        switch (status) {
            case 'pending':
                return css.badge_pending;
            case 'in_progress':
                return css.badge_in_progress;
            case 'paused':
                return css.badge_paused;
            case 'completed':
                return css.badge_completed;
            case 'cancelled':
                return css.badge_cancelled;
            default:
                return css.badge_pending;
        }
    }

    function statusLabel(status: StatusKind): string {
        switch (status) {
            case 'pending':
                return '대기';
            case 'in_progress':
                return '진행';
            case 'paused':
                return '일시정지';
            case 'completed':
                return '완료';
            case 'cancelled':
                return '취소';
            default:
                return status;
        }
    }

    function toggleOpen() {
        is_open = !is_open;
        if (is_open) {
            queueMicrotask(() => search_input_ref?.focus());
        }
    }

    function selectIndex(index: number) {
        if (index < 0 || index >= filtered_jobs.length) {
            return;
        }
        const job = filtered_jobs[index];
        if (!job) {
            return;
        }
        onSelect(job.id);
        is_open = false;
    }

    function handleTriggerKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape' && is_open) {
            e.preventDefault();
            is_open = false;
            trigger_ref?.focus();
            return;
        }
        if (!is_open && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            is_open = true;
            queueMicrotask(() => search_input_ref?.focus());
            return;
        }
        if (!is_open) {
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            active_index = Math.min(active_index + 1, Math.max(0, filtered_jobs.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            active_index = Math.max(active_index - 1, 0);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            selectIndex(active_index);
        }
    }

    function handleSearchKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            e.preventDefault();
            is_open = false;
            trigger_ref?.focus();
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            active_index = Math.min(active_index + 1, Math.max(0, filtered_jobs.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            active_index = Math.max(active_index - 1, 0);
        } else if (e.key === 'Enter' && filtered_jobs.length > 0) {
            e.preventDefault();
            selectIndex(active_index);
        }
    }

    function handleListKeydown(e: KeyboardEvent) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            active_index = Math.min(active_index + 1, Math.max(0, filtered_jobs.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            active_index = Math.max(active_index - 1, 0);
        } else if (e.key === 'Enter' && filtered_jobs.length > 0) {
            e.preventDefault();
            selectIndex(active_index);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            is_open = false;
            trigger_ref?.focus();
        }
    }

    function handleRowClick(index: number, e: MouseEvent) {
        e.preventDefault();
        active_index = index;
        selectIndex(index);
    }

    function handleRowMouseEnter(index: number) {
        active_index = index;
    }
</script>

<div class={css.root} bind:this={container_ref}>
    <button
        type="button"
        class={css.trigger}
        bind:this={trigger_ref}
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-expanded={is_open}
        aria-controls={listbox_id}
        aria-activedescendant={is_open ? active_option_dom_id : undefined}
        onclick={(e) => {
            e.stopPropagation();
            toggleOpen();
        }}
        onkeydown={handleTriggerKeydown}
    >
        <span>{selected_job?.title ?? '작업 선택'}</span>
        <span aria-hidden="true">{is_open ? '▴' : '▾'}</span>
    </button>

    {#if is_open}
        <div class={css.panel} role="presentation">
            <input
                class={css.search_input}
                type="search"
                placeholder="제목 검색"
                bind:this={search_input_ref}
                bind:value={search_query}
                onkeydown={handleSearchKeydown}
            />

            <ul
                id={listbox_id}
                class={css.listbox}
                role="listbox"
                aria-label="작업 목록"
                tabindex="-1"
                onkeydown={handleListKeydown}
            >
                {#if filtered_jobs.length === 0}
                    <li class={css.empty_hint} role="presentation">항목이 없습니다</li>
                {:else}
                    {#each filtered_jobs as job, index (job.id)}
                        <li role="presentation">
                            <button
                                type="button"
                                id="{listbox_id}-opt-{index}"
                                class={`${css.option}${index === active_index ? ` ${css.option_highlighted}` : ''}`}
                                role="option"
                                aria-selected={selected_id === job.id}
                                onclick={(e) => handleRowClick(index, e)}
                                onmouseenter={() => handleRowMouseEnter(index)}
                            >
                                <span class={css.option_title}>{job.title}</span>
                                <span class={badgeClass(job.status)}>{statusLabel(job.status)}</span>
                            </button>
                        </li>
                    {/each}
                {/if}
            </ul>
        </div>
    {/if}
</div>
