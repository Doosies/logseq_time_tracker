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
