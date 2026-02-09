import App from './components/App/App.svelte';
import { light_theme } from '@personal/uikit/design';
import '@personal/uikit/design';

// Apply theme to body
document.body.className = light_theme;

// Mount Svelte app
const app = new App({
    target: document.getElementById('app')!,
});

export default app;
