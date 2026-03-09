interface Preferences {
    enable_animations: boolean;
}

const STORAGE_KEY = 'user_preferences';

let preferences = $state<Preferences>({
    enable_animations: true,
});

export function initializePreferences(): void {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            preferences = { ...preferences, ...(JSON.parse(stored) as Partial<Preferences>) };
        }
    } catch {
        // invalid JSON - keep defaults
    }
}

export function getPreferences(): Preferences {
    return preferences;
}

export async function setEnableAnimations(enabled: boolean): Promise<void> {
    preferences = { ...preferences, enable_animations: enabled };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
