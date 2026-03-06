const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not(:disabled)',
    'input:not(:disabled)',
    'select:not(:disabled)',
    'textarea:not(:disabled)',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

export interface FocusTrapOptions {
    onclose?: () => void;
}

export function focusTrap(node: HTMLElement, options: FocusTrapOptions) {
    let current_options = options;
    const previous_element = document.activeElement as HTMLElement | null;

    function getFocusableElements(): HTMLElement[] {
        return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    }

    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            current_options.onclose?.();
            return;
        }

        if (event.key !== 'Tab') return;

        const focusable = getFocusableElements();
        if (focusable.length === 0) return;

        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;

        if (event.shiftKey) {
            if (document.activeElement === first) {
                event.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    }

    node.addEventListener('keydown', handleKeydown);

    requestAnimationFrame(() => {
        const focusable = getFocusableElements();
        if (focusable.length > 0) {
            focusable[0]!.focus();
        } else {
            node.setAttribute('tabindex', '-1');
            node.focus();
        }
    });

    return {
        update(new_options: FocusTrapOptions) {
            current_options = new_options;
        },
        destroy() {
            node.removeEventListener('keydown', handleKeydown);
            previous_element?.focus();
        },
    };
}
