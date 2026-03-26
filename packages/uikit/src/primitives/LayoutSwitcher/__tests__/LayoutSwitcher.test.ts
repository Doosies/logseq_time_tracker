import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import LayoutSwitcherTestWrapper from './LayoutSwitcher.test.svelte';

type RoCallback = ResizeObserverCallback;

function create_mock_resize_observer_factory(trigger_width: number) {
    return class MockResizeObserver {
        constructor(private readonly cb: RoCallback) {}

        observe(target: Element) {
            const entry = {
                target,
                contentRect: { width: trigger_width, height: 0, top: 0, left: 0, bottom: 0, right: 0, x: 0, y: 0 },
            } as ResizeObserverEntry;
            queueMicrotask(() => {
                this.cb([entry], this as unknown as ResizeObserver);
            });
        }

        unobserve() {}

        disconnect() {}
    };
}

describe('LayoutSwitcher', () => {
    const OriginalResizeObserver = globalThis.ResizeObserver;

    afterEach(() => {
        globalThis.ResizeObserver = OriginalResizeObserver;
        vi.restoreAllMocks();
    });

    it('기본 렌더링 시 compact 모드', async () => {
        globalThis.ResizeObserver = class NoopRo {
            observe() {}
            unobserve() {}
            disconnect() {}
        } as unknown as typeof ResizeObserver;

        render(LayoutSwitcherTestWrapper);

        await waitFor(() => {
            expect(screen.getByTestId('content')).toHaveAttribute('data-mode', 'compact');
        });
    });

    it('ResizeObserver mock으로 넓은 너비 → full 전환', async () => {
        globalThis.ResizeObserver = create_mock_resize_observer_factory(800);

        render(LayoutSwitcherTestWrapper);

        await waitFor(() => {
            expect(screen.getByTestId('content')).toHaveAttribute('data-mode', 'full');
        });
        expect(screen.getByTestId('content')).toHaveTextContent('full');
    });

    it('커스텀 breakpoint prop', async () => {
        globalThis.ResizeObserver = create_mock_resize_observer_factory(700);

        render(LayoutSwitcherTestWrapper, { breakpoint: 800 });

        await waitFor(() => {
            expect(screen.getByTestId('content')).toHaveAttribute('data-mode', 'compact');
        });
    });
});
