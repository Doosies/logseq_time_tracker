import '@logseq/libs';
import { mount } from 'svelte';
import App from './App.svelte';
import { initializeApp, ConsoleLogger } from '@personal/time-tracker-core';
import type { AppContext } from '@personal/time-tracker-core';

let app_context: AppContext | null = null;

async function renderApp() {
    const app_root = document.getElementById('app');
    if (!app_root) return;

    const ctx = await initializeApp({ logger: new ConsoleLogger() });
    app_context = ctx;

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
    });
}

window.addEventListener('beforeunload', () => {
    app_context?.services.timer_service.dispose();
});

main();
