import { light_theme, dark_theme } from '@personal/uikit/design';

const STORAGE_KEY = 'theme';

export type Theme = 'light' | 'dark' | 'auto';

let current_theme = $state<Theme>('auto');
let media_query: MediaQueryList | null = null;

function applyTheme(): void {
    const resolved =
        current_theme === 'auto'
            ? typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
            : current_theme;

    if (typeof document !== 'undefined') {
        document.body.className = resolved === 'dark' ? dark_theme : light_theme;
    }
}

function handleSystemPreferenceChange(): void {
    if (current_theme === 'auto') {
        applyTheme();
    }
}

function isValidTheme(value: unknown): value is Theme {
    return value === 'light' || value === 'dark' || value === 'auto';
}

function setupMediaQuery(): void {
    if (typeof window === 'undefined') return;
    media_query = window.matchMedia('(prefers-color-scheme: dark)');
    media_query.addEventListener('change', handleSystemPreferenceChange);
}

export function initializeThemeSync(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (isValidTheme(stored)) {
        current_theme = stored;
    }

    applyTheme();
}

export async function initializeTheme(): Promise<void> {
    try {
        const result = await chrome.storage.sync.get(STORAGE_KEY);
        const synced = result[STORAGE_KEY];

        if (isValidTheme(synced)) {
            current_theme = synced;
            applyTheme();
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, synced);
            }
        } else {
            const local = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
            if (isValidTheme(local)) {
                current_theme = local;
                await chrome.storage.sync.set({ [STORAGE_KEY]: local });
            }
        }
    } catch {
        // sync 실패 시 localStorage 값 유지
    }

    applyTheme();
    setupMediaQuery();
}

export function getTheme(): Theme {
    return current_theme;
}

export async function setTheme(theme: Theme): Promise<void> {
    current_theme = theme;
    applyTheme();

    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, theme);
    }

    try {
        await chrome.storage.sync.set({ [STORAGE_KEY]: theme });
    } catch {
        // sync 저장 실패해도 localStorage에는 저장됨
    }
}

export async function resetTheme(): Promise<void> {
    current_theme = 'auto';
    if (media_query) {
        media_query.removeEventListener('change', handleSystemPreferenceChange);
        media_query = null;
    }
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
    }
    try {
        await chrome.storage.sync.set({ [STORAGE_KEY]: 'auto' });
    } catch {
        // 무시
    }
    applyTheme();
}
