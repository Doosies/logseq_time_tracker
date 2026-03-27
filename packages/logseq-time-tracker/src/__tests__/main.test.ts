/**
 * @vitest-environment jsdom
 */
import { beforeAll, describe, expect, it, vi } from 'vitest';

const SLASH_COMMAND_LABEL = 'Time Tracker';

const { mock_ready, mock_register_ui_item, mock_register_slash_command, mock_provide_model } = vi.hoisted(() => ({
    mock_ready: vi.fn((callback?: (e: unknown) => void | Record<string, unknown>) => {
        callback?.({} as unknown);
        return Promise.resolve();
    }),
    mock_register_ui_item: vi.fn(),
    mock_register_slash_command: vi.fn(),
    mock_provide_model: vi.fn(),
}));

const { MOCK_LIGHT_THEME_CLASS } = vi.hoisted(() => ({
    MOCK_LIGHT_THEME_CLASS: 'mock-light-theme',
}));

vi.mock('@logseq/libs', () => {
    globalThis.logseq = {
        ready: mock_ready,
        App: {
            registerUIItem: mock_register_ui_item,
            onPageHeadActionsSlotted: vi.fn(),
        },
        provideUI: vi.fn(),
        Editor: {
            registerSlashCommand: mock_register_slash_command,
        },
        provideModel: mock_provide_model,
        toggleMainUI: vi.fn(),
        hideMainUI: vi.fn(),
    } as unknown as typeof globalThis.logseq;
    return {};
});

vi.mock('@personal/time-tracker-core', () => ({
    initializeApp: vi.fn().mockResolvedValue({
        stores: {
            timer_store: {},
            job_store: {},
            toast_store: {},
        },
        services: {
            timer_service: {},
        },
        uow: {},
        dispose: vi.fn(),
    }),
    ConsoleLogger: vi.fn(),
    registerTimerBeforeUnload: vi.fn().mockReturnValue(vi.fn()),
}));

vi.mock('@personal/uikit/design', () => ({
    light_theme: MOCK_LIGHT_THEME_CLASS,
}));

vi.mock('svelte', async (importOriginal) => {
    const actual = await importOriginal<typeof import('svelte')>();
    return {
        ...actual,
        mount: vi.fn(),
    };
});

describe('main entry (Logseq plugin bootstrap)', () => {
    beforeAll(async () => {
        vi.clearAllMocks();
        await import('../main');
    });

    it('UC-PLUGIN-001: main: logseq.ready 호출 검증', () => {
        expect(mock_ready).toHaveBeenCalled();
        expect(mock_ready).toHaveBeenCalledWith(expect.any(Function));
    });

    it('UC-PLUGIN-002: main: registerUIItem 호출 검증', () => {
        expect(mock_register_ui_item).toHaveBeenCalledWith(
            'toolbar',
            expect.objectContaining({
                key: 'time-tracker-toolbar',
                template: expect.stringContaining('togglePluginUI'),
            }),
        );
    });

    it('UC-PLUGIN-003: main: registerCommandPalette 호출 검증', () => {
        expect(mock_register_slash_command).toHaveBeenCalledWith(SLASH_COMMAND_LABEL, expect.any(Function));
    });
});

describe('renderApp theme application', () => {
    beforeAll(async () => {
        vi.resetModules();
        document.body.innerHTML = '<div id="app"></div>';
        vi.clearAllMocks();
        await import('../main');
    });

    it('UC-PLUGIN-006: #app에 light_theme 클래스가 적용된다', () => {
        const app_root = document.getElementById('app');
        expect(app_root).not.toBeNull();
        expect(app_root!.classList.contains(MOCK_LIGHT_THEME_CLASS)).toBe(true);
    });

    it('UC-PLUGIN-007: light_theme 클래스가 body에는 적용되지 않는다', () => {
        expect(document.body.classList.contains(MOCK_LIGHT_THEME_CLASS)).toBe(false);
    });

    it('UC-PLUGIN-008: html의 overflow가 hidden으로 설정되어 스크롤바가 방지된다', () => {
        expect(document.documentElement.style.overflow).toBe('hidden');
    });
});
