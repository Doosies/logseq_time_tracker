const STORAGE_KEY = 'section_visibility_state';

type VisibilityState = Record<string, boolean>;

let state = $state<VisibilityState>({});
let is_loaded = $state(false);

function isValidState(value: unknown): value is VisibilityState {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        Object.values(value).every((v) => typeof v === 'boolean')
    );
}

async function syncToStorage(): Promise<void> {
    await chrome.storage.sync.set({
        [STORAGE_KEY]: $state.snapshot(state),
    });
}

export function isSectionVisible(section_id: string): boolean {
    return state[section_id] ?? true;
}

export async function initializeVisibility(): Promise<void> {
    try {
        const result = await chrome.storage.sync.get(STORAGE_KEY);
        const stored = result[STORAGE_KEY];

        state = isValidState(stored) ? stored : {};
    } catch {
        state = {};
    } finally {
        is_loaded = true;
    }
}

export async function toggleVisibility(
    section_id: string,
    visible_ids: string[],
): Promise<boolean> {
    if (!is_loaded) return false;

    const current = isSectionVisible(section_id);
    if (current) {
        const visible_count = visible_ids.filter((id) =>
            isSectionVisible(id),
        ).length;
        if (visible_count <= 1) return false;
    }

    const prev = { ...state };
    state = { ...state, [section_id]: !current };

    try {
        await syncToStorage();
        return true;
    } catch (e) {
        state = prev;
        console.error('섹션 가시성 저장 실패:', e);
        return false;
    }
}
