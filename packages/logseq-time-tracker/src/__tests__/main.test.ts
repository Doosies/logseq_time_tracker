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

describe('renderApp initialization', () => {
    beforeAll(async () => {
        vi.resetModules();
        document.body.innerHTML = '<div id="app"></div>';
        document.documentElement.style.overflow = '';
        vi.clearAllMocks();
        await import('../main');
        const core_module = await import('@personal/time-tracker-core');
        for (let i = 0; i < 50; i++) {
            if (vi.mocked(core_module.initializeApp).mock.calls.length > 0) {
                const first_result = vi.mocked(core_module.initializeApp).mock.results[0];
                if (first_result?.value instanceof Promise) {
                    await first_result.value;
                }
                break;
            }
            await Promise.resolve();
        }
    });

    it('UC-PLUGIN-009: initializeApp이 SQLite 모드와 wasm_url·db_name 인자로 호출된다', async () => {
        const { initializeApp } = await import('@personal/time-tracker-core');
        expect(initializeApp).toHaveBeenCalledWith(
            expect.objectContaining({
                storage_mode: 'sqlite',
                sqlite_options: expect.objectContaining({
                    wasm_url: new URL('./assets/', document.baseURI).href,
                    db_name: 'time-tracker.db',
                }),
                logger: expect.anything(),
            }),
        );
    });

    it('UC-PLUGIN-010: registerTimerBeforeUnload가 timer_service와 함께 호출된다', async () => {
        const { initializeApp, registerTimerBeforeUnload } = await import('@personal/time-tracker-core');
        const init_result = vi.mocked(initializeApp).mock.results[0];
        expect(init_result).toBeDefined();
        const ctx = await init_result!.value;
        expect(registerTimerBeforeUnload).toHaveBeenCalledWith(ctx.services.timer_service);
    });

    it('UC-PLUGIN-011: mount가 App과 올바른 target·props로 호출된다', async () => {
        const { mount } = await import('svelte');
        const { initializeApp } = await import('@personal/time-tracker-core');
        const { default: App_component } = await import('../App.svelte');
        const init_result = vi.mocked(initializeApp).mock.results[0];
        expect(init_result).toBeDefined();
        const ctx = await init_result!.value;
        const app_root = document.getElementById('app');
        expect(vi.mocked(mount)).toHaveBeenCalledWith(App_component, {
            target: app_root,
            props: { ctx },
        });
    });

    it('UC-PLUGIN-012: provideModel이 togglePluginUI 모델을 등록한다', () => {
        expect(mock_provide_model).toHaveBeenCalledWith(
            expect.objectContaining({
                togglePluginUI: expect.any(Function),
            }),
        );
        const provide_call = mock_provide_model.mock.calls[0];
        expect(provide_call).toBeDefined();
        const model = provide_call![0] as { togglePluginUI: () => void };
        const toggle_main_ui = globalThis.logseq?.toggleMainUI;
        expect(toggle_main_ui).toBeDefined();
        vi.mocked(toggle_main_ui!).mockClear();
        model.togglePluginUI();
        expect(toggle_main_ui).toHaveBeenCalled();
    });

    it('UC-PLUGIN-013: 슬래시 커맨드 콜백이 logseq.toggleMainUI를 호출한다', async () => {
        const slash_call = mock_register_slash_command.mock.calls[0];
        expect(slash_call).toBeDefined();
        const slash_callback = slash_call![1] as () => Promise<void>;
        const toggle_main_ui = globalThis.logseq?.toggleMainUI;
        expect(toggle_main_ui).toBeDefined();
        vi.mocked(toggle_main_ui!).mockClear();
        await slash_callback();
        expect(toggle_main_ui).toHaveBeenCalled();
    });

    it('UC-PLUGIN-015: beforeunload 이벤트 시 dispose와 unregister 체인이 실행된다', async () => {
        const { initializeApp, registerTimerBeforeUnload } = await import('@personal/time-tracker-core');
        const init_entry = vi.mocked(initializeApp).mock.results[0];
        const reg_entry = vi.mocked(registerTimerBeforeUnload).mock.results[0];
        expect(init_entry).toBeDefined();
        expect(reg_entry).toBeDefined();
        const ctx = await init_entry!.value;
        const unreg_flush = reg_entry!.value as ReturnType<typeof vi.fn>;
        vi.mocked(ctx.dispose).mockClear();
        vi.mocked(unreg_flush).mockClear();
        window.dispatchEvent(new Event('beforeunload'));
        expect(ctx.dispose).toHaveBeenCalled();
        expect(unreg_flush).toHaveBeenCalled();
    });
});

describe('main entry without #app', () => {
    beforeAll(async () => {
        vi.resetModules();
        document.body.innerHTML = '';
        document.documentElement.style.overflow = '';
        vi.clearAllMocks();
        await import('../main');
    });

    it('UC-PLUGIN-014: #app 미존재 시 mount가 호출되지 않는다', async () => {
        const { mount } = await import('svelte');
        expect(vi.mocked(mount)).not.toHaveBeenCalled();
    });
});
