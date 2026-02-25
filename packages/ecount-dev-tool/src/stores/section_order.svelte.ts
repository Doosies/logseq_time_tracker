const STORAGE_KEY = 'section_order_state';

export const DEFAULT_ORDER = ['quick-login', 'server-manager', 'action-bar'] as const;

let order = $state<string[]>([...DEFAULT_ORDER]);
let is_loaded = $state(false);

function isValidOrder(value: unknown): value is string[] {
    return Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === 'string');
}

function mergeWithDefault(stored: string[]): string[] {
    const known_ids = new Set<string>(DEFAULT_ORDER);
    const valid_stored = stored.filter((id) => known_ids.has(id));
    const missing_ids = DEFAULT_ORDER.filter((id) => !valid_stored.includes(id));
    return [...valid_stored, ...missing_ids];
}

async function syncToStorage(): Promise<void> {
    await chrome.storage.sync.set({
        [STORAGE_KEY]: $state.snapshot(order),
    });
}

export function getSectionOrder(): string[] {
    return order;
}

export async function initializeSectionOrder(): Promise<void> {
    try {
        const result = await chrome.storage.sync.get(STORAGE_KEY);
        const stored = result[STORAGE_KEY];

        if (isValidOrder(stored)) {
            order = mergeWithDefault(stored);
        } else {
            order = [...DEFAULT_ORDER];
        }
    } catch {
        order = [...DEFAULT_ORDER];
    } finally {
        is_loaded = true;
    }
}

export async function moveSectionUp(section_id: string): Promise<boolean> {
    if (!is_loaded) return false;

    const idx = order.indexOf(section_id);
    if (idx <= 0) return false;

    const prev = [...order];
    const new_order = [...order];
    const prev_val = new_order[idx - 1]!;
    const curr_val = new_order[idx]!;
    new_order[idx - 1] = curr_val;
    new_order[idx] = prev_val;
    order = new_order;

    try {
        await syncToStorage();
        return true;
    } catch (e) {
        order = prev;
        console.error('섹션 순서 저장 실패:', e);
        return false;
    }
}

export async function setSectionOrder(new_order: string[]): Promise<boolean> {
    if (!is_loaded) return false;

    const prev = [...order];
    order = [...new_order];

    try {
        await syncToStorage();
        return true;
    } catch (e) {
        order = prev;
        console.error('섹션 순서 저장 실패:', e);
        return false;
    }
}

export async function moveSectionDown(section_id: string): Promise<boolean> {
    if (!is_loaded) return false;

    const idx = order.indexOf(section_id);
    if (idx < 0 || idx === order.length - 1) return false;

    const prev = [...order];
    const new_order = [...order];
    const curr_val = new_order[idx]!;
    const next_val = new_order[idx + 1]!;
    new_order[idx] = next_val;
    new_order[idx + 1] = curr_val;
    order = new_order;

    try {
        await syncToStorage();
        return true;
    } catch (e) {
        order = prev;
        console.error('섹션 순서 저장 실패:', e);
        return false;
    }
}
