import type { Preview } from '@storybook/svelte-vite';
import { light_theme } from '../packages/uikit/src/design/theme/light.css';

let storybook_tab_url = 'https://zeus01ba1.ecount.com/ec5/view/erp?__v3domains=ba1';

if (typeof globalThis.chrome === 'undefined') {
    (globalThis as Record<string, unknown>).chrome = {
        tabs: {
            query: async () => [{ id: 1, url: storybook_tab_url }],
            update: async () => ({}),
            onActivated: { addListener: () => {} },
            onUpdated: { addListener: () => {} },
        },
        scripting: {
            executeScript: async () => [{ result: undefined }],
        },
    };
}

(globalThis as Record<string, unknown>).__storybook_set_tab_url = (url: string) => {
    storybook_tab_url = url;
};

document.body.classList.add(light_theme);

const preview: Preview = {
    tags: ['autodocs'],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        a11y: {
            config: {},
            options: {
                restoreScroll: true,
            },
        },
    },
};

export default preview;
