export type ShortcutConfig = {
    key: string;
    ctrl?: boolean;
    handler: () => void;
};

export function keyboardShortcut(
    _node: HTMLElement | Window,
    config: ShortcutConfig | ShortcutConfig[],
): { destroy: () => void } {
    const configs = Array.isArray(config) ? config : [config];

    function handleKeydown(e: KeyboardEvent): void {
        for (const c of configs) {
            if (e.key === c.key && (!c.ctrl || e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                c.handler();
                break;
            }
        }
    }

    window.addEventListener('keydown', handleKeydown);
    return {
        destroy: () => window.removeEventListener('keydown', handleKeydown),
    };
}
