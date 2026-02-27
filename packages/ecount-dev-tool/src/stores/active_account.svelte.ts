import type { LoginAccount } from '#types/server';

const STORAGE_KEY = 'active_account';

let active_key = $state<string | null>(null);

function toKey(account: LoginAccount): string {
    return `${account.company}§${account.id}`;
}

export function getActiveAccountKey(): string | null {
    return active_key;
}

export function isActiveAccount(account: LoginAccount): boolean {
    return active_key !== null && active_key === toKey(account);
}

export async function setActiveAccount(account: LoginAccount): Promise<void> {
    const key = toKey(account);
    active_key = key;
    try {
        await chrome.storage.sync.set({ [STORAGE_KEY]: key });
    } catch (e) {
        console.error('활성 계정 저장 실패:', e);
    }
}

export async function initializeActiveAccount(): Promise<void> {
    try {
        const result = await chrome.storage.sync.get(STORAGE_KEY);
        const stored = result[STORAGE_KEY];
        active_key = typeof stored === 'string' ? stored : null;
    } catch {
        active_key = null;
    }
}
