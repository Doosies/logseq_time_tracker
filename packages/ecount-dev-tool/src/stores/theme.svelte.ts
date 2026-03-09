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

export function initializeTheme(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
        current_theme = stored;
    }

    applyTheme();

    media_query = window.matchMedia('(prefers-color-scheme: dark)');
    media_query.addEventListener('change', handleSystemPreferenceChange);
}

export function getTheme(): Theme {
    return current_theme;
}

export function setTheme(theme: Theme): void {
    current_theme = theme;
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, theme);
    }
    applyTheme();
}

export function resetTheme(): void {
    current_theme = 'auto';
    if (media_query) {
        media_query.removeEventListener('change', handleSystemPreferenceChange);
        media_query = null;
    }
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
    }
    applyTheme();
}
