import type { UserScript } from '#types/user_script';

const STORAGE_KEY = 'user_scripts_data';

let scripts = $state<UserScript[]>([]);
let is_loaded = $state(false);

function isValidScripts(value: unknown): value is UserScript[] {
    return (
        Array.isArray(value) &&
        value.every(
            (item) =>
                typeof item === 'object' &&
                item !== null &&
                typeof item.id === 'string' &&
                typeof item.name === 'string' &&
                typeof item.code === 'string',
        )
    );
}

async function syncToStorage(): Promise<void> {
    await chrome.storage.local.set({
        [STORAGE_KEY]: $state.snapshot(scripts),
    });
}

export function getScripts(): UserScript[] {
    return scripts;
}

export function getScriptById(id: string): UserScript | undefined {
    return scripts.find((s) => s.id === id);
}

export function getEnabledScripts(): UserScript[] {
    return scripts.filter((s) => s.enabled);
}

export async function initializeUserScripts(): Promise<void> {
    try {
        const result = await chrome.storage.local.get(STORAGE_KEY);
        const stored = result[STORAGE_KEY];
        scripts = isValidScripts(stored) ? stored : [];
    } catch {
        scripts = [];
    } finally {
        is_loaded = true;
    }
}

export async function addScript(input: Omit<UserScript, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    if (!is_loaded) return null;

    const now = Date.now();
    const new_script: UserScript = {
        ...input,
        id: crypto.randomUUID(),
        created_at: now,
        updated_at: now,
    };

    const prev = [...scripts];
    scripts = [...scripts, new_script];

    try {
        await syncToStorage();
        return new_script.id;
    } catch (e) {
        scripts = prev;
        console.error('스크립트 추가 실패:', e);
        return null;
    }
}

export async function updateScript(id: string, updates: Partial<UserScript>): Promise<boolean> {
    if (!is_loaded) return false;

    const index = scripts.findIndex((s) => s.id === id);
    if (index === -1) return false;

    const prev = [...scripts];
    scripts = scripts.map((s) => (s.id === id ? { ...s, ...updates, updated_at: Date.now() } : s));

    try {
        await syncToStorage();
        return true;
    } catch (e) {
        scripts = prev;
        console.error('스크립트 수정 실패:', e);
        return false;
    }
}

export async function deleteScript(id: string): Promise<boolean> {
    if (!is_loaded) return false;

    const index = scripts.findIndex((s) => s.id === id);
    if (index === -1) return false;

    const prev = [...scripts];
    scripts = scripts.filter((s) => s.id !== id);

    try {
        await syncToStorage();
        return true;
    } catch (e) {
        scripts = prev;
        console.error('스크립트 삭제 실패:', e);
        return false;
    }
}

export async function toggleScript(id: string): Promise<boolean> {
    if (!is_loaded) return false;

    const script = scripts.find((s) => s.id === id);
    if (!script) return false;

    return updateScript(id, { enabled: !script.enabled });
}
