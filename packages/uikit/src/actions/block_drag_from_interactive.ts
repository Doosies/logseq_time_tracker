export interface BlockDragOptions {
    dragHandleSelector?: string;
    interactiveSelector?: string;
}

const DEFAULT_INTERACTIVE_SELECTOR =
    'button, a, input, select, textarea, label, ' + '[role="button"], [contenteditable="true"]';

export function blockDragFromInteractive(node: HTMLElement, options?: BlockDragOptions) {
    let current = options;

    function handler(e: Event): void {
        if (!current?.dragHandleSelector) return;
        const target = e.target as HTMLElement;
        if (target.closest(current.dragHandleSelector)) return;

        const selector = current.interactiveSelector ?? DEFAULT_INTERACTIVE_SELECTOR;
        if (target.closest(selector)) {
            e.stopPropagation();
        }
    }

    node.addEventListener('mousedown', handler, true);
    node.addEventListener('touchstart', handler, true);

    return {
        update(new_options?: BlockDragOptions) {
            current = new_options;
        },
        destroy() {
            node.removeEventListener('mousedown', handler, true);
            node.removeEventListener('touchstart', handler, true);
        },
    };
}
