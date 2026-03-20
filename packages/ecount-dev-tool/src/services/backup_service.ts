import { SECTION_REGISTRY } from '#sections';
import type { BackupData, BackupPayload } from '#types/backup';
import { getAccountsSnapshot, restoreAccounts } from '#stores/accounts.svelte';
import { getActiveAccountKey, restoreActiveAccount } from '#stores/active_account.svelte';
import { getScriptsSnapshot, restoreUserScripts } from '#stores/user_scripts.svelte';
import { getSectionOrder, setSectionOrder } from '#stores/section_order.svelte';
import { getVisibilityState, restoreVisibility } from '#stores/section_visibility.svelte';
import { getTheme, setTheme } from '#stores/theme.svelte';
import { getPreferences, restorePreferences } from '#stores/preferences.svelte';

const BACKUP_VERSION = 1;

export function exportAllSettings(): BackupData {
    const payload: BackupPayload = {
        accounts: getAccountsSnapshot(),
        active_account: getActiveAccountKey(),
        user_scripts: getScriptsSnapshot(),
        section_order: [...getSectionOrder()],
        section_visibility: getVisibilityState(),
        theme: getTheme(),
        preferences: getPreferences(),
    };
    return {
        version: BACKUP_VERSION,
        exported_at: new Date().toISOString(),
        data: payload,
    };
}

export function downloadBackup(): void {
    const backup = exportAllSettings();
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `ecount-dev-tool-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export async function importAllSettings(json: string): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    let parsed: unknown;
    try {
        parsed = JSON.parse(json);
    } catch {
        return { success: false, errors: ['JSON 파싱 실패'] };
    }

    if (typeof parsed !== 'object' || parsed === null) {
        return { success: false, errors: ['잘못된 백업 형식'] };
    }

    const backup = parsed as BackupData;
    if (typeof backup.version !== 'number' || backup.version > BACKUP_VERSION) {
        return { success: false, errors: [`지원하지 않는 백업 버전: ${backup.version}`] };
    }

    const data = backup.data ?? {};

    if (data.accounts !== undefined) {
        const ok = await restoreAccounts(data.accounts);
        if (!ok) errors.push('계정 복원 실패');
    }

    if (data.active_account !== undefined) {
        const ok = await restoreActiveAccount(data.active_account);
        if (!ok) errors.push('활성 계정 복원 실패');
    }

    if (data.user_scripts !== undefined) {
        const ok = await restoreUserScripts(data.user_scripts);
        if (!ok) errors.push('사용자 스크립트 복원 실패');
    }

    if (data.section_order !== undefined) {
        const known_ids = new Set<string>(SECTION_REGISTRY.map((s) => s.id));
        const valid_order = data.section_order.filter((id) => known_ids.has(id));
        const missing_ids = SECTION_REGISTRY.map((s) => s.id).filter((id) => !valid_order.includes(id));
        const merged_order = [...valid_order, ...missing_ids];
        const ok = await setSectionOrder(merged_order);
        if (!ok) errors.push('섹션 순서 복원 실패');
    }

    if (data.section_visibility !== undefined) {
        const ok = await restoreVisibility(data.section_visibility);
        if (!ok) errors.push('섹션 가시성 복원 실패');
    }

    if (data.theme !== undefined) {
        if (data.theme === 'light' || data.theme === 'dark' || data.theme === 'auto') {
            await setTheme(data.theme);
        }
    }

    if (data.preferences !== undefined) {
        const ok = await restorePreferences(data.preferences);
        if (!ok) errors.push('설정 복원 실패');
    }

    return {
        success: errors.length === 0,
        errors,
    };
}

const MAX_BACKUP_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function readBackupFile(file: File): Promise<{ success: boolean; errors: string[] }> {
    if (file.size > MAX_BACKUP_FILE_SIZE_BYTES) {
        return { success: false, errors: ['파일 크기가 너무 큽니다. 5MB 이하의 파일만 가져올 수 있습니다.'] };
    }

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async () => {
            const result = await importAllSettings(reader.result as string);
            resolve(result);
        };
        reader.onerror = () => resolve({ success: false, errors: ['파일 읽기 실패'] });
        reader.readAsText(file);
    });
}
