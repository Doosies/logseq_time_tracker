/**
 * 노드를 `document.body`에 렌더링하는 Svelte action.
 * 모달, 툴팁, 드롭다운 등 body 최상위에 배치해야 하는 요소에 사용합니다.
 *
 * @param node - body에 포탈할 대상 HTMLElement
 * @returns destroy 시 노드를 DOM에서 제거하는 ActionReturn
 *
 * @example
 * ```svelte
 * <div use:portal>
 *   모달 콘텐츠
 * </div>
 * ```
 */
export function portal(node: HTMLElement) {
    const target = document.body;
    target.appendChild(node);

    return {
        destroy() {
            node.remove();
        },
    };
}
