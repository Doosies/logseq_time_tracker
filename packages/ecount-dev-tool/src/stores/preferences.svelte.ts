interface Preferences {
    enable_animations: boolean;
}

const STORAGE_KEY = 'user_preferences';
const DEFAULTS: Preferences = { enable_animations: true };

let preferences = $state<Preferences>({ ...DEFAULTS });

function isValidPreferences(value: unknown): value is Partial<Preferences> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function initializePreferences(): Promise<void> {
    try {
        const result = await chrome.storage.sync.get(STORAGE_KEY);
        const synced = result[STORAGE_KEY];

        if (isValidPreferences(synced)) {
            preferences = { ...DEFAULTS, ...synced };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        } else {
            const local_raw = localStorage.getItem(STORAGE_KEY);
            if (local_raw) {
                try {
                    const local_parsed = JSON.parse(local_raw) as Partial<Preferences>;
                    preferences = { ...DEFAULTS, ...local_parsed };
                    await chrome.storage.sync.set({ [STORAGE_KEY]: $state.snapshot(preferences) });
                } catch {
                    // 잘못된 JSON은 무시, 기본값 유지
                }
            }
        }
    } catch {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                preferences = { ...DEFAULTS, ...(JSON.parse(stored) as Partial<Preferences>) };
            }
        } catch {
            // 기본값 유지
        }
    }
}

export function getPreferences(): Preferences {
    return preferences;
}

export async function setEnableAnimations(enabled: boolean): Promise<void> {
    preferences = { ...preferences, enable_animations: enabled };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    try {
        await chrome.storage.sync.set({ [STORAGE_KEY]: $state.snapshot(preferences) });
    } catch {
        // sync 실패해도 localStorage에는 저장됨
    }
}

export async function resetPreferences(): Promise<void> {
    preferences = { ...DEFAULTS };
    localStorage.removeItem(STORAGE_KEY);
    try {
        await chrome.storage.sync.set({ [STORAGE_KEY]: DEFAULTS });
    } catch {
        // 무시
    }
}

export async function restorePreferences(new_prefs: Partial<Preferences>): Promise<boolean> {
    try {
        preferences = { ...DEFAULTS, ...new_prefs };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        await chrome.storage.sync.set({ [STORAGE_KEY]: $state.snapshot(preferences) });
        return true;
    } catch (e) {
        console.error('설정 복원 실패:', e);
        return false;
    }
}
