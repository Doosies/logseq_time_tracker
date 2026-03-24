import '@logseq/libs';
import { mount } from 'svelte';
import { PocTest } from '@personal/time-tracker-core';

function renderApp() {
    const app_root = document.getElementById('app');
    if (app_root) {
        mount(PocTest, { target: app_root });
    }
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

        renderApp();
    });
}

main();
