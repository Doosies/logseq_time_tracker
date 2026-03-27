import { mount } from 'svelte';
import App from '../src/App.svelte';
import { ConsoleLogger, initializeApp } from '@personal/time-tracker-core';
import { light_theme } from '@personal/uikit/design';

const app_el = () => document.getElementById('app');

const logseq_stub = {
    hideMainUI: () => {
        app_el()?.style.setProperty('display', 'none');
    },
    showMainUI: () => {
        app_el()?.style.removeProperty('display');
    },
    toggleMainUI: () => {
        const el = app_el();
        if (!el) return;
        if (el.style.display === 'none') {
            el.style.removeProperty('display');
        } else {
            el.style.setProperty('display', 'none');
        }
    },
};

(globalThis as unknown as { logseq: typeof logseq_stub }).logseq = logseq_stub;

document.getElementById('mock-toolbar-trigger')?.addEventListener('click', () => {
    logseq_stub.toggleMainUI();
});

async function main() {
    const ctx = await initializeApp({
        logger: new ConsoleLogger(),
        storage_mode: 'memory',
    });
    const app_root = document.getElementById('app');
    if (!app_root) {
        throw new Error('E2E harness: #app not found');
    }
    app_root.classList.add(light_theme);
    document.documentElement.style.overflow = 'hidden';
    mount(App, { target: app_root, props: { ctx } });
}

void main();
