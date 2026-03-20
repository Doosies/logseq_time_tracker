import { mount } from 'svelte';
import '@personal/uikit/design';
import { initializeThemeSync } from './stores/theme.svelte';
import { initializeUserScripts } from './stores/user_scripts.svelte';
import EditorPage from '#components/EditorPage';

// 동기적 테마 초기화 (FOUC 방지)
initializeThemeSync();

// Initialize user scripts store
await initializeUserScripts();

// Mount Svelte app
const app = mount(EditorPage, {
    target: document.getElementById('app')!,
});

export default app;
