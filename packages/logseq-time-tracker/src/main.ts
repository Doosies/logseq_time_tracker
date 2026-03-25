import '@logseq/libs';
import { mount } from 'svelte';
import App from './App.svelte';
import {
    initializeApp,
    ConsoleLogger,
    registerTimerBeforeUnload,
    generateId,
    sanitizeText,
    ValidationError,
    StorageError,
    MAX_TITLE_LENGTH,
} from '@personal/time-tracker-core';
import type { AppContext, Job, Category } from '@personal/time-tracker-core';

const LOGSEQ_SYSTEM_KEY = 'logseq';
const INLINE_START_REASON = '페이지에서 시작';

let app_context: AppContext | null = null;
let unregister_before_unload: (() => void) | null = null;

function disposeTimerOnBeforeUnload() {
    app_context?.dispose();
    unregister_before_unload?.();
    unregister_before_unload = null;
}

async function renderApp() {
    const app_root = document.getElementById('app');
    if (!app_root) return;

    const ctx = await initializeApp({
        logger: new ConsoleLogger(),
        storage_mode: 'sqlite',
        sqlite_options: {
            wasm_url: new URL('./assets/', document.baseURI).href,
            db_name: 'time-tracker.db',
        },
    });
    app_context = ctx;

    const unreg_flush = registerTimerBeforeUnload(ctx.services.timer_service);
    unregister_before_unload = () => {
        unreg_flush();
        window.removeEventListener('beforeunload', disposeTimerOnBeforeUnload);
    };
    window.addEventListener('beforeunload', disposeTimerOnBeforeUnload);

    mount(App, { target: app_root, props: { ctx } });
}

function main() {
    logseq.ready(() => {
        logseq.App.registerUIItem('toolbar', {
            key: 'time-tracker-toolbar',
            template: `<a data-on-click="togglePluginUI" class="button" title="Time Tracker"><i class="ti ti-box"></i></a>`,
        });

        logseq.Editor.registerSlashCommand('Time Tracker', async () => {
            logseq.toggleMainUI();
        });

        logseq.provideModel({
            togglePluginUI() {
                logseq.setMainUIInlineStyle({
                    position: 'fixed',
                    top: '3.5rem',
                    right: '1rem',
                    width: '360px',
                    maxHeight: '80vh',
                    zIndex: '11',
                });
                logseq.toggleMainUI();
            },
            async startTimerFromPage() {
                if (!app_context) return;
                const page = await logseq.Editor.getCurrentPage();
                if (!page) return;

                const page_uuid = page.uuid;
                const page_title =
                    (page as { originalName?: string; name?: string }).originalName ??
                    (page as { originalName?: string; name?: string }).name ??
                    '무제 페이지';
                const ctx = app_context;
                const timer_store = ctx.stores.timer_store;
                const job_store = ctx.stores.job_store;
                const toast_store = ctx.stores.toast_store;

                try {
                    let started_job: Job | null = null;
                    let started_category: Category | null = null;

                    await ctx.uow.transaction(async () => {
                        const existing_ref = await ctx.uow.externalRefRepo.getExternalRefBySystemAndValue(
                            LOGSEQ_SYSTEM_KEY,
                            page_uuid,
                        );
                        let job: Job;
                        if (existing_ref) {
                            const j = await ctx.uow.jobRepo.getJobById(existing_ref.job_id);
                            if (!j) {
                                throw new ValidationError('연결된 작업을 찾을 수 없습니다', 'job_id');
                            }
                            job = j;
                        } else {
                            const now = new Date().toISOString();
                            const stripped = page_title.replace(/<[^>]*>/g, '').trim();
                            const base = stripped.length === 0 ? '무제 페이지' : stripped;
                            const clipped = base.length > MAX_TITLE_LENGTH ? base.slice(0, MAX_TITLE_LENGTH) : base;
                            const title = sanitizeText(clipped, MAX_TITLE_LENGTH);
                            job = {
                                id: generateId(),
                                title,
                                description: '',
                                status: 'pending',
                                custom_fields: '{}',
                                created_at: now,
                                updated_at: now,
                            };
                            await ctx.uow.jobRepo.upsertJob(job);
                            await ctx.uow.externalRefRepo.upsertExternalRef({
                                id: generateId(),
                                job_id: job.id,
                                system_key: LOGSEQ_SYSTEM_KEY,
                                ref_value: page_uuid,
                                created_at: now,
                                updated_at: now,
                            });
                            const categories = await ctx.uow.categoryRepo.getCategories();
                            const first_cat = categories[0];
                            if (!first_cat) {
                                throw new ValidationError('카테고리가 없습니다', 'category');
                            }
                            await ctx.services.job_category_service.linkJobCategory(job.id, first_cat.id, true);
                        }
                        const links = await ctx.services.job_category_service.getJobCategories(job.id);
                        const def = links.find((l) => l.is_default);
                        const categories = await ctx.services.category_service.getCategories();
                        const category =
                            (def ? categories.find((c) => c.id === def.category_id) : undefined) ?? categories[0];
                        if (!category) {
                            throw new ValidationError('카테고리가 없습니다', 'category');
                        }
                        await ctx.services.timer_service.start(job, category, INLINE_START_REASON);
                        started_job = job;
                        started_category = category;
                    });

                    if (started_job && started_category) {
                        timer_store.startTimer(started_job, started_category);
                    }
                    const jobs = await ctx.services.job_service.getJobs();
                    job_store.setJobs(jobs);
                } catch (e) {
                    if (e instanceof StorageError) {
                        toast_store.addToast('error', '이 저장소에서는 페이지 연동(ExternalRef)을 사용할 수 없습니다.');
                    } else {
                        toast_store.addToast('error', String(e));
                    }
                }
            },
        });

        logseq.App.onPageHeadActionsSlotted(({ slot }) => {
            logseq.provideUI({
                slot,
                key: 'inline-timer',
                template: `<a data-on-click="startTimerFromPage" class="button" title="이 페이지에서 시작"><i class="ti ti-player-play"></i></a>`,
            });
        });

        void renderApp();

        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                logseq.hideMainUI();
            }
        });
    });
}

main();
