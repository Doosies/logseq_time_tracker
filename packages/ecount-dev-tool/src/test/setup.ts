import { vi, beforeEach } from 'vitest';
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

// theme store: matchMedia polyfill for jsdom
if (typeof window !== 'undefined' && typeof window.matchMedia === 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }),
    });
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

vi.stubEnv(
    'VITE_LOGIN_ACCOUNTS',
    JSON.stringify([
        { company: 'company1', id: 'user1', password: 'pw1' },
        { company: 'company2', id: 'user2', password: 'pw2' },
    ]),
);

const storage_data: Record<string, unknown> = {};
const local_storage_data: Record<string, unknown> = {};

const chrome_mock = {
    tabs: {
        query: vi.fn().mockResolvedValue([]),
        update: vi.fn().mockResolvedValue({}),
        onActivated: { addListener: vi.fn() },
        onUpdated: { addListener: vi.fn() },
    },
    scripting: {
        executeScript: vi.fn().mockResolvedValue([{ result: undefined }]),
    },
    storage: {
        sync: {
            get: vi.fn().mockImplementation((key: string) => Promise.resolve({ [key]: storage_data[key] })),
            set: vi.fn().mockImplementation((items: Record<string, unknown>) => {
                Object.assign(storage_data, items);
                return Promise.resolve();
            }),
        },
        local: {
            get: vi.fn().mockImplementation((key: string) => Promise.resolve({ [key]: local_storage_data[key] })),
            set: vi.fn().mockImplementation((items: Record<string, unknown>) => {
                Object.assign(local_storage_data, items);
                return Promise.resolve();
            }),
        },
        onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
    },
};

vi.stubGlobal('chrome', chrome_mock);
vi.stubGlobal('close', vi.fn());

(globalThis as Record<string, unknown>)['__storybook_set_local_storage'] = (key: string, value: unknown) => {
    local_storage_data[key] = value;
};

beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(storage_data).forEach((key) => delete storage_data[key]);
    Object.keys(local_storage_data).forEach((key) => delete local_storage_data[key]);
});
