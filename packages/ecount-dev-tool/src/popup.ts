import { mount } from 'svelte';
import '@personal/uikit/design';
import { initializeTheme } from './stores/theme.svelte';
import App from './components/App';

// Apply theme before mount (reads localStorage, system preference)
initializeTheme();

// Mount Svelte app
const app = mount(App, {
    target: document.getElementById('app')!,
});

export default app;
