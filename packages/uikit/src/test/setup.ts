import '@testing-library/jest-dom/vitest';
import { setProjectAnnotations } from '@storybook/svelte-vite';

// @dnd-kit/dom jsdom compatibility: ResizeObserver polyfill
if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
}

setProjectAnnotations({
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
});
