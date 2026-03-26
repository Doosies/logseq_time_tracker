<script lang="ts">
    import type { AppContext } from '../../app/context';
    import type { Job } from '../../types/job';
    import type { Category } from '../../types/category';
    import { ValidationError, StorageError } from '../../errors';
    import { generateId, sanitizeText } from '../../utils';
    import { MAX_TITLE_LENGTH } from '../../constants/config';
    import { ElapsedTimer } from '@personal/uikit';
    import * as css from './inline_view.css';

    const LOGSEQ_SYSTEM_KEY = 'logseq';
    const INLINE_START_REASON = '페이지에서 시작';

    let {
        context,
        page_uuid,
        page_title,
    }: {
        context: AppContext;
        page_uuid: string;
        page_title: string;
    } = $props();

    const services = $derived(context.services);
    const timer_store = $derived(context.stores.timer_store);
    const job_store = $derived(context.stores.job_store);
    const toast_store = $derived(context.stores.toast_store);

    let page_job = $state<Job | null>(null);
    let display_category = $state<Category | null>(null);
    let all_categories = $state<Category[]>([]);
    let is_resolving = $state(false);
    let is_starting = $state(false);

    function sanitize_title_for_job(raw: string): string {
        const stripped = raw.replace(/<[^>]*>/g, '').trim();
        const base = stripped.length === 0 ? '무제 페이지' : stripped;
        const clipped = base.length > MAX_TITLE_LENGTH ? base.slice(0, MAX_TITLE_LENGTH) : base;
        return sanitizeText(clipped, MAX_TITLE_LENGTH);
    }

    async function refreshJobs(): Promise<void> {
        const jobs = await services.job_service.getJobs();
        job_store.setJobs(jobs);
    }

    async function resolve_category_for_job(job_id: string): Promise<Category> {
        const links = await context.uow.jobCategoryRepo.getJobCategories(job_id);
        const def = links.find((l) => l.is_default);
        const categories = await context.uow.categoryRepo.getCategories();
        const cat = (def ? categories.find((c) => c.id === def.category_id) : undefined) ?? categories[0];
        if (!cat) {
            throw new ValidationError('카테고리가 없습니다', 'category');
        }
        return cat;
    }

    async function load_page_mapping(): Promise<void> {
        is_resolving = true;
        try {
            const ref = await context.uow.externalRefRepo.getExternalRefBySystemAndValue(LOGSEQ_SYSTEM_KEY, page_uuid);
            if (!ref) {
                page_job = null;
                display_category = null;
                return;
            }
            const job = await services.job_service.getJobById(ref.job_id);
            page_job = job;
            if (job) {
                display_category = await resolve_category_for_job(job.id);
            } else {
                display_category = null;
            }
        } catch (e) {
            if (e instanceof StorageError) {
                page_job = null;
                display_category = null;
                context.logger.warn('InlineView: external ref storage unavailable', { error: String(e) });
            } else {
                toast_store.addToast('error', String(e));
                page_job = null;
                display_category = null;
            }
        } finally {
            is_resolving = false;
        }
    }

    async function load_categories(): Promise<void> {
        try {
            all_categories = await services.category_service.getCategories();
        } catch (e) {
            toast_store.addToast('error', String(e));
            all_categories = [];
        }
    }

    $effect(() => {
        void page_uuid;
        void load_page_mapping();
    });

    $effect(() => {
        void context;
        void load_categories();
    });

    const is_page_timer_active = $derived(
        page_job !== null && timer_store.state.active_job !== null && timer_store.state.active_job.id === page_job.id,
    );

    async function handle_page_start(): Promise<void> {
        if (is_starting) return;
        is_starting = true;
        let started_job: Job | null = null;
        let started_category: Category | null = null;
        try {
            await context.uow.transaction(async () => {
                const existing_ref = await context.uow.externalRefRepo.getExternalRefBySystemAndValue(
                    LOGSEQ_SYSTEM_KEY,
                    page_uuid,
                );
                let job: Job;
                if (existing_ref) {
                    const j = await context.uow.jobRepo.getJobById(existing_ref.job_id);
                    if (!j) {
                        throw new ValidationError('연결된 작업을 찾을 수 없습니다', 'job_id');
                    }
                    job = j;
                } else {
                    const now = new Date().toISOString();
                    const title = sanitize_title_for_job(page_title);
                    job = {
                        id: generateId(),
                        title,
                        description: '',
                        status: 'pending',
                        custom_fields: '{}',
                        created_at: now,
                        updated_at: now,
                    };
                    await context.uow.jobRepo.upsertJob(job);
                    await context.uow.externalRefRepo.upsertExternalRef({
                        id: generateId(),
                        job_id: job.id,
                        system_key: LOGSEQ_SYSTEM_KEY,
                        ref_value: page_uuid,
                        created_at: now,
                        updated_at: now,
                    });
                    const categories = await context.uow.categoryRepo.getCategories();
                    const first_cat = categories[0];
                    if (!first_cat) {
                        throw new ValidationError('카테고리가 없습니다', 'category');
                    }
                    await services.job_category_service.linkJobCategory(job.id, first_cat.id, true);
                }
                const category = await resolve_category_for_job(job.id);
                await services.timer_service.start(job, category, INLINE_START_REASON);
                started_job = job;
                started_category = category;
            });

            if (started_job && started_category) {
                timer_store.startTimer(started_job, started_category);
            }
            await refreshJobs();
            await load_page_mapping();
        } catch (e) {
            if (e instanceof StorageError) {
                toast_store.addToast('error', '이 저장소에서는 페이지 연동(ExternalRef)을 사용할 수 없습니다.');
            } else {
                toast_store.addToast('error', String(e));
            }
        } finally {
            is_starting = false;
        }
    }

    async function handle_category_badge_click(): Promise<void> {
        if (!page_job || all_categories.length === 0) return;
        const current_id = display_category?.id ?? all_categories[0]!.id;
        const idx = all_categories.findIndex((c) => c.id === current_id);
        const next = all_categories[(idx + 1) % all_categories.length]!;
        try {
            await services.job_category_service.setDefaultCategory(page_job.id, next.id);
            display_category = next;
        } catch (e) {
            toast_store.addToast('error', String(e));
        }
    }
</script>

<div class={css.inline_root}>
    <div class={css.row}>
        <button
            type="button"
            class={css.start_btn}
            disabled={is_starting || is_resolving}
            onclick={() => void handle_page_start()}
        >
            {is_starting ? '시작 중…' : '이 페이지에서 시작'}
        </button>
        {#if page_job && display_category}
            <button
                type="button"
                class={css.category_badge}
                title="클릭하여 카테고리 전환"
                onclick={() => void handle_category_badge_click()}
            >
                {display_category.name}
            </button>
        {/if}
    </div>

    {#if is_page_timer_active && timer_store.state.active_job}
        <div class={css.active_block} aria-live="polite">
            <span class={css.muted}>진행 중</span>
            <strong>{timer_store.state.active_job.title}</strong>
            <ElapsedTimer
                accumulated_ms={timer_store.state.accumulated_ms}
                segment_start={timer_store.state.current_segment_start}
                is_paused={timer_store.state.is_paused}
            />
        </div>
    {/if}
</div>
