import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { blockDragFromInteractive } from '../block_drag_from_interactive';

describe('blockDragFromInteractive', () => {
    beforeEach(() => {
        document.body.replaceChildren();
    });

    afterEach(() => {
        document.body.replaceChildren();
    });

    it('interactive 요소에서 mousedown 시 stopPropagation 호출', () => {
        const root = document.createElement('div');
        const btn = document.createElement('button');
        btn.textContent = 'action';
        root.appendChild(btn);
        document.body.appendChild(root);

        blockDragFromInteractive(root, { dragHandleSelector: '[data-drag-handle]' });

        const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        const stop_spy = vi.spyOn(event, 'stopPropagation');
        btn.dispatchEvent(event);

        expect(stop_spy).toHaveBeenCalled();
    });

    it('dragHandle 내 요소에서는 stopPropagation 미호출', () => {
        const root = document.createElement('div');
        const handle = document.createElement('div');
        handle.setAttribute('data-drag-handle', '');
        const grip = document.createElement('span');
        grip.textContent = '⋮';
        handle.appendChild(grip);
        root.appendChild(handle);
        document.body.appendChild(root);

        blockDragFromInteractive(root, { dragHandleSelector: '[data-drag-handle]' });

        const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        const stop_spy = vi.spyOn(event, 'stopPropagation');
        grip.dispatchEvent(event);

        expect(stop_spy).not.toHaveBeenCalled();
    });

    it('비-interactive 요소에서 mousedown 시 stopPropagation 미호출', () => {
        const root = document.createElement('div');
        const plain = document.createElement('div');
        plain.className = 'plain';
        plain.textContent = 'text';
        root.appendChild(plain);
        document.body.appendChild(root);

        blockDragFromInteractive(root, { dragHandleSelector: '[data-drag-handle]' });

        const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        const stop_spy = vi.spyOn(event, 'stopPropagation');
        plain.dispatchEvent(event);

        expect(stop_spy).not.toHaveBeenCalled();
    });

    it('dragHandleSelector 미설정 시 아무 동작 안함', () => {
        const root = document.createElement('div');
        const btn = document.createElement('button');
        root.appendChild(btn);
        document.body.appendChild(root);

        blockDragFromInteractive(root, {});

        const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        const stop_spy = vi.spyOn(event, 'stopPropagation');
        btn.dispatchEvent(event);

        expect(stop_spy).not.toHaveBeenCalled();
    });

    it('update로 옵션 변경 확인', () => {
        const root = document.createElement('div');
        const handle = document.createElement('div');
        handle.setAttribute('data-drag-handle', '');
        const btn = document.createElement('button');
        root.appendChild(handle);
        root.appendChild(btn);
        document.body.appendChild(root);

        const action = blockDragFromInteractive(root, { dragHandleSelector: '[data-drag-handle]' });

        const event_on_button = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        const spy_before = vi.spyOn(event_on_button, 'stopPropagation');
        btn.dispatchEvent(event_on_button);
        expect(spy_before).toHaveBeenCalled();

        action.update(undefined);

        const event_after = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        const spy_after = vi.spyOn(event_after, 'stopPropagation');
        btn.dispatchEvent(event_after);
        expect(spy_after).not.toHaveBeenCalled();
    });

    it('destroy 후 리스너 제거 확인', () => {
        const root = document.createElement('div');
        const btn = document.createElement('button');
        root.appendChild(btn);
        document.body.appendChild(root);

        const action = blockDragFromInteractive(root, { dragHandleSelector: '[data-drag-handle]' });

        const event_before = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        const spy_before = vi.spyOn(event_before, 'stopPropagation');
        btn.dispatchEvent(event_before);
        expect(spy_before).toHaveBeenCalled();

        action.destroy();

        const event_after = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        const spy_after = vi.spyOn(event_after, 'stopPropagation');
        btn.dispatchEvent(event_after);
        expect(spy_after).not.toHaveBeenCalled();
    });
});
