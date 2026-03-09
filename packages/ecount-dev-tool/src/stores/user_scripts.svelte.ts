import type { RunAt, UserScript } from '#types/user_script';

const STORAGE_KEY = 'user_scripts_data';

let scripts = $state<UserScript[]>([]);
let is_loaded = $state(false);

function canMigrateItem(item: unknown): item is Record<string, unknown> {
    if (typeof item !== 'object' || item === null) return false;
    const raw = item as Record<string, unknown>;
    return typeof raw['id'] === 'string' && typeof raw['name'] === 'string' && typeof raw['code'] === 'string';
}

function migrateScript(raw: Record<string, unknown>): UserScript {
    const item = raw as Partial<UserScript>;
    const run_at: RunAt = item.run_at === 'document_start' ? 'document_start' : 'document_idle';
    return {
        id: item.id!,
        name: item.name!,
        enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
        url_patterns: Array.isArray(item.url_patterns)
            ? item.url_patterns.filter((p): p is string => typeof p === 'string')
            : [],
        code: item.code!,
        run_at,
        created_at: typeof item.created_at === 'number' ? item.created_at : Date.now(),
        updated_at: typeof item.updated_at === 'number' ? item.updated_at : Date.now(),
    };
}

function loadAndMigrateScripts(value: unknown): UserScript[] {
    if (!Array.isArray(value)) return [];
    return value.filter(canMigrateItem).map((item) => migrateScript(item));
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
        scripts = loadAndMigrateScripts(stored);
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

/**
 * Storybook용 초기화: 스토어 상태를 초기화합니다.
 * StoryWrapper onMount 시점에 호출하여 스토리 간 격리를 보장합니다.
 */
export function resetUserScripts(): void {
    scripts = [];
    is_loaded = false;
}
