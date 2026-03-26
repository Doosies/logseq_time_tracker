import '@logseq/libs';
import { mount } from 'svelte';
import App from './App.svelte';
import { initializeApp, ConsoleLogger, registerTimerBeforeUnload } from '@personal/time-tracker-core';
import type { AppContext } from '@personal/time-tracker-core';

// [Phase 4 대기] InlineView 관련 상수
// const LOGSEQ_SYSTEM_KEY = 'logseq';
// const INLINE_START_REASON = '페이지에서 시작';

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
                logseq.toggleMainUI();
            },
            // [Phase 4 대기] InlineView: 페이지에서 타이머 시작 — 현재 비활성화
            async startTimerFromPage() {},
        });

        // [Phase 4 대기] InlineView: 페이지 헤더 시작 버튼 비활성화
        // logseq.App.onPageHeadActionsSlotted(({ slot }) => {
        //     logseq.provideUI({
        //         slot,
        //         key: 'inline-timer',
        //         template: `<a data-on-click="startTimerFromPage" class="button" title="이 페이지에서 시작"><i class="ti ti-player-play"></i></a>`,
        //     });
        // });

        void renderApp();
    });
}

main();
