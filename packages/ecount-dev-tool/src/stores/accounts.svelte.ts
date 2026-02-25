import type { LoginAccount } from '#types/server';

const STORAGE_KEY = 'login_accounts';

let accounts = $state<LoginAccount[]>([]);
let is_loaded = $state(false);

function getDefaultAccounts(): LoginAccount[] {
    try {
        const raw = import.meta.env.VITE_LOGIN_ACCOUNTS ?? '[]';
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function isValidAccountArray(value: unknown): value is LoginAccount[] {
    return (
        Array.isArray(value) &&
        value.every(
            (item) =>
                typeof item === 'object' &&
                item !== null &&
                typeof item.company === 'string' &&
                typeof item.id === 'string' &&
                typeof item.password === 'string',
        )
    );
}

function getAccountKey(account: LoginAccount): string {
    return `${account.company}§${account.id}`;
}

export function isDuplicate(account: LoginAccount): boolean {
    const key = getAccountKey(account);
    return accounts.some((a) => getAccountKey(a) === key);
}

function deduplicateAccounts(list: LoginAccount[]): LoginAccount[] {
    const seen = new Set<string>();
    return list.filter((a) => {
        const key = getAccountKey(a);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

async function syncToStorage(): Promise<void> {
    await chrome.storage.sync.set({
        [STORAGE_KEY]: $state.snapshot(accounts),
    });
}

async function withSync(updater: () => void, error_label: string): Promise<boolean> {
    const prev = accounts;
    updater();
    try {
        await syncToStorage();
        return true;
    } catch (e) {
        accounts = prev;
        console.error(error_label, e);
        return false;
    }
}

export function getAccounts(): LoginAccount[] {
    return accounts;
}

export function isAccountsLoaded(): boolean {
    return is_loaded;
}

/**
 * chrome.storage.sync에서 계정 목록을 로드합니다.
 * 저장된 데이터가 없으면 환경변수 시드를 사용합니다.
 */
export async function initializeAccounts(): Promise<void> {
    try {
        const result = await chrome.storage.sync.get(STORAGE_KEY);
        const stored = result[STORAGE_KEY];

        if (isValidAccountArray(stored) && stored.length > 0) {
            accounts = deduplicateAccounts(stored);
        } else {
            accounts = deduplicateAccounts(getDefaultAccounts());
            try {
                await syncToStorage();
            } catch {
                // 시드 저장 실패는 무시 - 다음 초기화 시 재시도
            }
        }
    } catch {
        accounts = deduplicateAccounts(getDefaultAccounts());
    } finally {
        is_loaded = true;
    }
}

export async function addAccount(account: LoginAccount): Promise<boolean> {
    if (!is_loaded) return false;
    if (isDuplicate(account)) return false;

    return withSync(() => {
        accounts = [...accounts, account];
    }, '계정 추가 실패:');
}

export async function removeAccount(index: number): Promise<boolean> {
    if (!is_loaded) return false;
    if (index < 0 || index >= accounts.length) return false;

    return withSync(() => {
        accounts = accounts.filter((_, i) => i !== index);
    }, '계정 제거 실패:');
}
