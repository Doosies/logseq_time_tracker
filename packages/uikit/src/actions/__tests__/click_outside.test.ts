import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clickOutside } from '../click_outside';

describe('clickOutside', () => {
    beforeEach(() => {
        document.body.replaceChildren();
    });

    afterEach(() => {
        document.body.replaceChildren();
    });

    it('외부 클릭 시 콜백 호출', () => {
        const callback = vi.fn();
        const popup = document.createElement('div');
        const inner = document.createElement('span');
        popup.appendChild(inner);
        document.body.appendChild(popup);

        clickOutside(popup, callback);

        const outside = document.createElement('button');
        document.body.appendChild(outside);
        outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('내부 클릭 시 콜백 미호출', () => {
        const callback = vi.fn();
        const popup = document.createElement('div');
        const inner = document.createElement('button');
        popup.appendChild(inner);
        document.body.appendChild(popup);

        clickOutside(popup, callback);

        inner.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(callback).not.toHaveBeenCalled();
    });

    it('Escape 키 누름 시 콜백 호출', () => {
        const callback = vi.fn();
        const popup = document.createElement('div');
        document.body.appendChild(popup);

        clickOutside(popup, callback);

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('update로 콜백 교체 확인', () => {
        const first = vi.fn();
        const second = vi.fn();
        const popup = document.createElement('div');
        document.body.appendChild(popup);

        const action = clickOutside(popup, first);
        action.update(second);

        const outside = document.createElement('div');
        document.body.appendChild(outside);
        outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });

    it('destroy 후 리스너 제거 확인', () => {
        const callback = vi.fn();
        const popup = document.createElement('div');
        document.body.appendChild(popup);

        const action = clickOutside(popup, callback);
        action.destroy();

        const outside = document.createElement('div');
        document.body.appendChild(outside);
        outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(callback).not.toHaveBeenCalled();
    });
});
