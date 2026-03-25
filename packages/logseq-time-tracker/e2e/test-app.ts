import { mount } from 'svelte';
import App from '../src/App.svelte';
import { ConsoleLogger, initializeApp } from '@personal/time-tracker-core';

const logseq_stub = {
    hideMainUI: () => {},
    toggleMainUI: () => {},
    setMainUIInlineStyle: (_style: Record<string, string>) => {},
};

(globalThis as unknown as { logseq: typeof logseq_stub }).logseq = logseq_stub;

async function main() {
    const ctx = await initializeApp({
        logger: new ConsoleLogger(),
        storage_mode: 'memory',
    });
    const app_root = document.getElementById('app');
    if (!app_root) {
        throw new Error('E2E harness: #app not found');
    }
    mount(App, { target: app_root, props: { ctx } });
}

void main();
