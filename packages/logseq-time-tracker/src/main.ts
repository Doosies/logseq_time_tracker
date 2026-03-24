import '@logseq/libs';
import { mount } from 'svelte';
import App from './App.svelte';
import { initializeApp, ConsoleLogger, registerTimerBeforeUnload } from '@personal/time-tracker-core';
import type { AppContext } from '@personal/time-tracker-core';

let app_context: AppContext | null = null;
let unregister_before_unload: (() => void) | null = null;

function disposeTimerOnBeforeUnload() {
    app_context?.services.timer_service.dispose();
    unregister_before_unload?.();
    unregister_before_unload = null;
}

async function renderApp() {
    const app_root = document.getElementById('app');
    if (!app_root) return;

    const ctx = await initializeApp({
        logger: new ConsoleLogger(),
        storage_mode: 'sqlite',
        sqlite_options: { wasm_url: './assets', db_name: 'time-tracker.db' },
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

        logseq.provideModel({
            togglePluginUI() {
                logseq.toggleMainUI();
            },
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
