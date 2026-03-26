import '@testing-library/jest-dom/vitest';

/** jsdom에는 없음; @personal/uikit → @dnd-kit 로드 시 필요 */
class ResizeObserverMock {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
