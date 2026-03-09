import { mount } from 'svelte';
import '@personal/uikit/design';
import { initializeTheme } from './stores/theme.svelte';
import { initializeUserScripts } from './stores/user_scripts.svelte';
import EditorPage from '#components/EditorPage';

// Apply theme before mount
initializeTheme();

// Initialize user scripts store
await initializeUserScripts();

// Mount Svelte app
const app = mount(EditorPage, {
    target: document.getElementById('app')!,
});

export default app;
