import type { Preview } from '@storybook/svelte-vite';
import { light_theme } from '../packages/uikit/src/design/theme/light.css';

let storybook_tab_url = 'https://zeus01ba1.ecount.com/ec5/view/erp?__v3domains=ba1';
let storybook_storage: Record<string, unknown> = {};

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
        storage: {
            sync: {
                get: async (key: string) => {
                    if (typeof key === 'string') {
                        return { [key]: storybook_storage[key] };
                    }
                    return { ...storybook_storage };
                },
                set: async (items: Record<string, unknown>) => {
                    Object.assign(storybook_storage, items);
                },
            },
        },
    };
}

(globalThis as Record<string, unknown>).__storybook_set_tab_url = (url: string) => {
    storybook_tab_url = url;
};

(globalThis as Record<string, unknown>).__storybook_set_storage = (
    data: Record<string, unknown>,
) => {
    storybook_storage = { ...data };
};

(globalThis as Record<string, unknown>).__storybook_reset_storage = () => {
    storybook_storage = {};
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
