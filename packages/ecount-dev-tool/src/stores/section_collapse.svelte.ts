const STORAGE_KEY = 'section_collapse_state';

type CollapseState = Record<string, boolean>;

let state = $state<CollapseState>({});
let is_loaded = $state(false);

function isValidState(value: unknown): value is CollapseState {
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

export function getSectionCollapsed(section_id: string): boolean {
    return state[section_id] ?? false;
}

export async function initializeSectionState(): Promise<void> {
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

export async function toggleSection(section_id: string): Promise<boolean> {
    if (!is_loaded) return false;

    const prev = { ...state };
    state = { ...state, [section_id]: !getSectionCollapsed(section_id) };

    try {
        await syncToStorage();
        return true;
    } catch (e) {
        state = prev;
        console.error('섹션 상태 저장 실패:', e);
        return false;
    }
}
