import { mount } from 'svelte';
import { light_theme } from '@personal/uikit/design';
import '@personal/uikit/design';
import App from './components/App';

// Apply theme to body
document.body.className = light_theme;

// Mount Svelte app
const app = mount(App, {
    target: document.getElementById('app')!,
});

export default app;
