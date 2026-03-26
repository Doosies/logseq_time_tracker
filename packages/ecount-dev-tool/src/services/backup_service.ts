import { SECTION_REGISTRY } from '#sections';
import type { BackupData, BackupPayload } from '#types/backup';
import { getAccountsSnapshot, restoreAccounts, resetAccounts } from '#stores/accounts.svelte';
import { getActiveAccountKey, restoreActiveAccount, resetActiveAccount } from '#stores/active_account.svelte';
import { getScriptsSnapshot, restoreUserScripts, clearUserScriptsFromStorage } from '#stores/user_scripts.svelte';
import { getSectionOrder, setSectionOrder, resetSectionOrder } from '#stores/section_order.svelte';
import { getVisibilityState, restoreVisibility, resetVisibility } from '#stores/section_visibility.svelte';
import { getTheme, setTheme, resetTheme } from '#stores/theme.svelte';
import { getPreferences, restorePreferences, resetPreferences } from '#stores/preferences.svelte';

const BACKUP_VERSION = 1;

/** 현재 스토어 상태를 백업 스키마(`BackupData`)로 직렬화해 반환합니다. */
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

/** `exportAllSettings` 결과를 JSON 파일로 브라우저에서 다운로드합니다. */
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

/** 백업 페이로드를 각 스토어에 적용합니다. 실패한 항목은 `errors`에 누적됩니다. */
export async function importFromPayload(data: BackupPayload): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

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

/** 백업 JSON 문자열을 파싱·검증한 뒤 `importFromPayload`로 복원합니다. */
export async function importAllSettings(json: string): Promise<{ success: boolean; errors: string[] }> {
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

    return importFromPayload(backup.data ?? {});
}

/** 계정·스크립트·섹션·테마·환경설정 등 앱 설정을 기본값으로 되돌립니다. */
export async function resetAllSettings(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    const ok_accounts = await resetAccounts();
    if (!ok_accounts) errors.push('계정 초기화 실패');

    const ok_active = await resetActiveAccount();
    if (!ok_active) errors.push('활성 계정 초기화 실패');

    const ok_scripts = await clearUserScriptsFromStorage();
    if (!ok_scripts) errors.push('사용자 스크립트 초기화 실패');

    const ok_order = await resetSectionOrder();
    if (!ok_order) errors.push('섹션 순서 초기화 실패');

    const ok_vis = await resetVisibility();
    if (!ok_vis) errors.push('섹션 가시성 초기화 실패');

    await resetTheme();
    await resetPreferences();

    return { success: errors.length === 0, errors };
}

const MAX_BACKUP_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/** 사용자가 선택한 백업 파일(최대 5MB)을 읽어 `importAllSettings`로 가져옵니다. */
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
