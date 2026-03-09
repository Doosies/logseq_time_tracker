import type { UserScript } from '#types/user_script';
import { matchesUrl } from '#services/url_matcher';

const STORAGE_KEY = 'user_scripts_data';
const ECOUNT_DOMAIN_PATTERN = /\.ecount\.com$/;

let cached_scripts: UserScript[] = [];

async function loadScripts(): Promise<void> {
    try {
        const result = await chrome.storage.local.get(STORAGE_KEY);
        const stored = result[STORAGE_KEY];
        cached_scripts = Array.isArray(stored) ? stored : [];
    } catch {
        cached_scripts = [];
    }
}

function isEcountDomain(url: string): boolean {
    try {
        const parsed = new URL(url);
        return ECOUNT_DOMAIN_PATTERN.test(parsed.hostname);
    } catch {
        return false;
    }
}

function handleTabUpdated(tab_id: number, change_info: { status?: string }, tab: chrome.tabs.Tab): void {
    const status = change_info.status;
    if (!status) return;
    if (!tab.url || !isEcountDomain(tab.url)) return;

    const url = tab.url;

    const matching_scripts = cached_scripts.filter((script) => {
        if (!script.enabled) return false;
        if (!matchesUrl(url, script.url_patterns)) return false;

        if (script.run_at === 'document_start' && status !== 'loading') return false;
        if (script.run_at === 'document_idle' && status !== 'complete') return false;

        return true;
    });

    for (const script of matching_scripts) {
        chrome.scripting.executeScript({
            target: { tabId: tab_id },
            world: 'MAIN',
            func: (code: string) => {
                new Function(code)();
            },
            args: [script.code],
        });
    }
}

function handleStorageChanged(changes: Record<string, { newValue?: unknown }>, area: string): void {
    if (area === 'local' && STORAGE_KEY in changes) {
        loadScripts();
    }
}

loadScripts();
chrome.tabs.onUpdated.addListener(handleTabUpdated);
chrome.storage.onChanged.addListener(handleStorageChanged);
