import { vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { setProjectAnnotations } from '@storybook/svelte-vite';

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
            get: vi.fn().mockImplementation((key: string) =>
                Promise.resolve({ [key]: storage_data[key] }),
            ),
            set: vi.fn().mockImplementation((items: Record<string, unknown>) => {
                Object.assign(storage_data, items);
                return Promise.resolve();
            }),
        },
        local: {
            get: vi.fn().mockResolvedValue({}),
            set: vi.fn().mockResolvedValue(undefined),
        },
    },
};

vi.stubGlobal('chrome', chrome_mock);
vi.stubGlobal('close', vi.fn());

beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(storage_data).forEach((key) => delete storage_data[key]);
});
