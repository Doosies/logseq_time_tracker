import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { focusTrap } from '../focus_trap';

describe('focusTrap', () => {
    let raf_spy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        document.body.replaceChildren();
        raf_spy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
            cb(0);
            return 0;
        });
    });

    afterEach(() => {
        raf_spy.mockRestore();
        document.body.replaceChildren();
    });

    it('초기 포커스가 첫 번째 focusable 요소로 이동', () => {
        const trap = document.createElement('div');
        const first_btn = document.createElement('button');
        first_btn.textContent = 'first';
        const second_btn = document.createElement('button');
        second_btn.textContent = 'second';
        trap.appendChild(first_btn);
        trap.appendChild(second_btn);
        document.body.appendChild(trap);

        focusTrap(trap, {});

        expect(document.activeElement).toBe(first_btn);
    });

    it('Tab 키로 마지막 요소에서 첫 번째로 순환', () => {
        const trap = document.createElement('div');
        const first_btn = document.createElement('button');
        const last_btn = document.createElement('button');
        trap.appendChild(first_btn);
        trap.appendChild(last_btn);
        document.body.appendChild(trap);

        focusTrap(trap, {});
        last_btn.focus();
        expect(document.activeElement).toBe(last_btn);

        const tab_event = new KeyboardEvent('keydown', {
            key: 'Tab',
            bubbles: true,
            cancelable: true,
        });
        const prevent_default_spy = vi.spyOn(tab_event, 'preventDefault');
        trap.dispatchEvent(tab_event);

        expect(prevent_default_spy).toHaveBeenCalled();
        expect(document.activeElement).toBe(first_btn);
    });

    it('Shift+Tab으로 첫 번째 요소에서 마지막으로 순환', () => {
        const trap = document.createElement('div');
        const first_btn = document.createElement('button');
        const last_btn = document.createElement('button');
        trap.appendChild(first_btn);
        trap.appendChild(last_btn);
        document.body.appendChild(trap);

        focusTrap(trap, {});
        first_btn.focus();

        const tab_event = new KeyboardEvent('keydown', {
            key: 'Tab',
            shiftKey: true,
            bubbles: true,
            cancelable: true,
        });
        const prevent_default_spy = vi.spyOn(tab_event, 'preventDefault');
        trap.dispatchEvent(tab_event);

        expect(prevent_default_spy).toHaveBeenCalled();
        expect(document.activeElement).toBe(last_btn);
    });

    it('Escape 키로 onclose 콜백 호출', () => {
        const onclose = vi.fn();
        const trap = document.createElement('div');
        const btn = document.createElement('button');
        trap.appendChild(btn);
        document.body.appendChild(trap);

        focusTrap(trap, { onclose });

        trap.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

        expect(onclose).toHaveBeenCalledTimes(1);
    });

    it('destroy 시 이전 포커스 복원', () => {
        const trigger = document.createElement('button');
        trigger.textContent = 'outside';
        document.body.appendChild(trigger);
        trigger.focus();
        expect(document.activeElement).toBe(trigger);

        const trap = document.createElement('div');
        const inner_btn = document.createElement('button');
        trap.appendChild(inner_btn);
        document.body.appendChild(trap);

        const action = focusTrap(trap, {});
        expect(document.activeElement).toBe(inner_btn);

        action.destroy();
        expect(document.activeElement).toBe(trigger);
    });

    it('focusable 요소 없을 시 노드 자체에 포커스', () => {
        const trap = document.createElement('div');
        document.body.appendChild(trap);

        focusTrap(trap, {});

        expect(trap.getAttribute('tabindex')).toBe('-1');
        expect(document.activeElement).toBe(trap);
    });
});
