import type { LoginAccount } from './server';
import type { UserScript } from './user_script';
import type { Theme } from '#stores/theme.svelte';

export interface BackupPayload {
    accounts?: LoginAccount[];
    active_account?: string | null;
    user_scripts?: UserScript[];
    section_order?: string[];
    section_visibility?: Record<string, boolean>;
    theme?: Theme;
    preferences?: { enable_animations: boolean };
}

export interface BackupData {
    version: number;
    exported_at: string;
    data: BackupPayload;
}
