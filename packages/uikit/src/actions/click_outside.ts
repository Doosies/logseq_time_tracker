export type ClickOutsideCallback = () => void;

/**
 * 요소 외부 클릭 또는 `Escape` 키 시 콜백을 실행하는 Svelte action.
 * 팝업·드롭다운 등 외부 클릭으로 닫기에 사용합니다.
 *
 * @param node - 감시할 루트 DOM 요소
 * @param callback - 외부 클릭 또는 Escape 시 호출되는 함수
 * @returns `update`로 콜백 교체, `destroy`로 리스너 해제
 *
 * @example
 * ```svelte
 * <div use:clickOutside={() => { is_open = false }}>
 *   ...popup content...
 * </div>
 * ```
 */
export function clickOutside(node: HTMLElement, callback: ClickOutsideCallback) {
    let _callback = callback;

    function handleClick(event: MouseEvent): void {
        const target = event.target as Node;
        if (!node.contains(target)) {
            _callback();
        }
    }

    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            _callback();
        }
    }

    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeydown, true);

    return {
        update(new_callback: ClickOutsideCallback) {
            _callback = new_callback;
        },
        destroy() {
            document.removeEventListener('click', handleClick, true);
            document.removeEventListener('keydown', handleKeydown, true);
        },
    };
}
