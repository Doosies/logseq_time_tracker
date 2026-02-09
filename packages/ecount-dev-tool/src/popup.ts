import { mount } from 'svelte';
import App from './components/App';
import { light_theme } from '@personal/uikit/design';
import '@personal/uikit/design';

// Apply theme to body
document.body.className = light_theme;

// Mount Svelte app
const app = mount(App, {
    target: document.getElementById('app')!,
});

export default app;
