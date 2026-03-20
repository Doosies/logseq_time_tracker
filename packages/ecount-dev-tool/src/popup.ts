import { mount } from 'svelte';
import '@personal/uikit/design';
import { initializeThemeSync } from './stores/theme.svelte';
import App from './components/App';

// 동기적 테마 초기화 (FOUC 방지)
initializeThemeSync();

// Mount Svelte app
const app = mount(App, {
    target: document.getElementById('app')!,
});

export default app;
