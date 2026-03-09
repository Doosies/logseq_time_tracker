import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { keyboardShortcut } from '../keyboard_shortcut';

function createKeydownEvent(options: { key: string; ctrlKey?: boolean; metaKey?: boolean }): KeyboardEvent {
    return new KeyboardEvent('keydown', {
        key: options.key,
        ctrlKey: options.ctrlKey ?? false,
        metaKey: options.metaKey ?? false,
        bubbles: true,
    });
}

describe('keyboardShortcut', () => {
    let mock_node: HTMLElement;
    let last_destroy: (() => void) | null = null;

    beforeEach(() => {
        mock_node = document.createElement('div');
    });

    afterEach(() => {
        if (last_destroy) {
            last_destroy();
            last_destroy = null;
        }
    });

    describe('단일 단축키 등록 및 호출', () => {
        it('일반 키(a) 입력 시 handler가 호출되어야 함', () => {
            const handler = vi.fn();
            const result = keyboardShortcut(mock_node, { key: 'a', handler });
            last_destroy = result.destroy;

            const evt = createKeydownEvent({ key: 'a' });
            window.dispatchEvent(evt);

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('Ctrl+키 조합 입력 시 handler가 호출되어야 함 (ctrlKey)', () => {
            const handler = vi.fn();
            const result = keyboardShortcut(mock_node, { key: 's', ctrl: true, handler });
            last_destroy = result.destroy;

            const evt = createKeydownEvent({ key: 's', ctrlKey: true });
            window.dispatchEvent(evt);

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('Ctrl+키 조합 입력 시 handler가 호출되어야 함 (metaKey, Mac)', () => {
            const handler = vi.fn();
            const result = keyboardShortcut(mock_node, { key: 's', ctrl: true, handler });
            last_destroy = result.destroy;

            const evt = createKeydownEvent({ key: 's', metaKey: true });
            window.dispatchEvent(evt);

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('preventDefault가 호출되어야 함', () => {
            const handler = vi.fn();
            const result = keyboardShortcut(mock_node, { key: 'a', handler });
            last_destroy = result.destroy;

            const evt = createKeydownEvent({ key: 'a' });
            const prevent_spy = vi.spyOn(evt, 'preventDefault');
            window.dispatchEvent(evt);

            expect(prevent_spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('복수 단축키 배열 처리', () => {
        it('여러 단축키를 동시 등록할 수 있어야 함', () => {
            const handler_a = vi.fn();
            const handler_b = vi.fn();
            const result = keyboardShortcut(mock_node, [
                { key: 'a', handler: handler_a },
                { key: 'b', handler: handler_b },
            ]);
            last_destroy = result.destroy;

            window.dispatchEvent(createKeydownEvent({ key: 'a' }));
            expect(handler_a).toHaveBeenCalledTimes(1);
            expect(handler_b).not.toHaveBeenCalled();

            window.dispatchEvent(createKeydownEvent({ key: 'b' }));
            expect(handler_a).toHaveBeenCalledTimes(1);
            expect(handler_b).toHaveBeenCalledTimes(1);
        });

        it('각 단축키별 개별 handler가 호출되어야 함', () => {
            const handler_x = vi.fn();
            const handler_y = vi.fn();
            const result = keyboardShortcut(mock_node, [
                { key: 'x', handler: handler_x },
                { key: 'y', handler: handler_y },
            ]);
            last_destroy = result.destroy;

            window.dispatchEvent(createKeydownEvent({ key: 'x' }));
            window.dispatchEvent(createKeydownEvent({ key: 'y' }));

            expect(handler_x).toHaveBeenCalledTimes(1);
            expect(handler_y).toHaveBeenCalledTimes(1);
        });

        it('첫 매칭 시 break로 이후 handler가 호출되지 않아야 함', () => {
            const handler_first = vi.fn();
            const handler_second = vi.fn();
            const result = keyboardShortcut(mock_node, [
                { key: 'a', handler: handler_first },
                { key: 'a', handler: handler_second },
            ]);
            last_destroy = result.destroy;

            window.dispatchEvent(createKeydownEvent({ key: 'a' }));

            expect(handler_first).toHaveBeenCalledTimes(1);
            expect(handler_second).not.toHaveBeenCalled();
        });
    });

    describe('destroy 함수', () => {
        it('destroy 후 이벤트 리스너가 제거되어야 함', () => {
            const handler = vi.fn();
            const { destroy } = keyboardShortcut(mock_node, { key: 'a', handler });
            last_destroy = null;

            destroy();

            window.dispatchEvent(createKeydownEvent({ key: 'a' }));

            expect(handler).not.toHaveBeenCalled();
        });

        it('destroy 후 키 입력 시 handler가 호출되지 않아야 함', () => {
            const handler = vi.fn();
            const { destroy } = keyboardShortcut(mock_node, { key: 'x', handler });
            last_destroy = null;

            window.dispatchEvent(createKeydownEvent({ key: 'x' }));
            expect(handler).toHaveBeenCalledTimes(1);

            destroy();
            handler.mockClear();

            window.dispatchEvent(createKeydownEvent({ key: 'x' }));
            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe('엣지 케이스', () => {
        it('ctrl 옵션이 true인데 Ctrl/ meta 없이 키만 입력 시 미호출되어야 함', () => {
            const handler = vi.fn();
            const result = keyboardShortcut(mock_node, { key: 's', ctrl: true, handler });
            last_destroy = result.destroy;

            const evt = createKeydownEvent({ key: 's' });
            window.dispatchEvent(evt);

            expect(handler).not.toHaveBeenCalled();
        });

        it('다른 키 입력 시 handler가 미호출되어야 함', () => {
            const handler = vi.fn();
            const result = keyboardShortcut(mock_node, { key: 'a', handler });
            last_destroy = result.destroy;

            window.dispatchEvent(createKeydownEvent({ key: 'b' }));
            window.dispatchEvent(createKeydownEvent({ key: 'A' }));
            window.dispatchEvent(createKeydownEvent({ key: 'Enter' }));

            expect(handler).not.toHaveBeenCalled();
        });

        it('config가 배열이 아닌 단일 객체여도 정상 동작해야 함', () => {
            const handler = vi.fn();
            const result = keyboardShortcut(mock_node, { key: 'z', handler });
            last_destroy = result.destroy;

            window.dispatchEvent(createKeydownEvent({ key: 'z' }));

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('ctrl 옵션이 없을 때 일반 키 입력 시 handler가 호출되어야 함', () => {
            const handler = vi.fn();
            const result = keyboardShortcut(mock_node, { key: 'a', handler });
            last_destroy = result.destroy;

            window.dispatchEvent(createKeydownEvent({ key: 'a' }));

            expect(handler).toHaveBeenCalledTimes(1);
        });
    });
});
