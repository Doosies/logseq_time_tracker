import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportAllSettings, importAllSettings, readBackupFile, downloadBackup } from '../backup_service';
import { initializeAccounts } from '#stores/accounts.svelte';
import { initializeActiveAccount } from '#stores/active_account.svelte';
import { initializeUserScripts } from '#stores/user_scripts.svelte';
import { initializeSectionOrder } from '#stores/section_order.svelte';
import { initializeVisibility } from '#stores/section_visibility.svelte';
import { initializeTheme, resetTheme } from '#stores/theme.svelte';
import { initializePreferences, resetPreferences } from '#stores/preferences.svelte';
import { asMock } from '#test/mock_helpers';

describe('backup_service', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        resetPreferences();
        resetTheme();
        if (typeof localStorage !== 'undefined') {
            localStorage.clear();
        }

        asMock(chrome.storage.sync.get).mockResolvedValue({
            login_accounts: [{ company: 'co1', id: 'u1', password: 'p1' }],
            active_account: 'co1§u1',
            section_order_state: ['quick-login', 'server-manager', 'action-bar', 'user-script'],
            section_visibility_state: { 'quick-login': true },
        });
        asMock(chrome.storage.local.get).mockResolvedValue({
            user_scripts_data: [
                {
                    id: 'script-1',
                    name: '테스트 스크립트',
                    enabled: true,
                    url_patterns: ['*://test.ecount.com/*'],
                    code: 'console.log("test")',
                    run_at: 'document_idle',
                    created_at: 1000,
                    updated_at: 1000,
                },
            ],
        });

        await initializeAccounts();
        await initializeActiveAccount();
        await initializeUserScripts();
        await initializeSectionOrder();
        await initializeVisibility();
        initializeTheme();
        initializePreferences();
    });

    describe('exportAllSettings', () => {
        it('올바른 BackupData 형태를 반환해야 함', () => {
            const result = exportAllSettings();

            expect(result).toMatchObject({
                version: 1,
                exported_at: expect.any(String),
                data: expect.any(Object),
            });
            expect(new Date(result.exported_at).getTime()).not.toBeNaN();
            expect(result.data.accounts).toBeDefined();
            expect(result.data.active_account).toBeDefined();
            expect(result.data.user_scripts).toBeDefined();
            expect(result.data.section_order).toBeDefined();
            expect(result.data.section_visibility).toBeDefined();
            expect(result.data.theme).toBeDefined();
            expect(result.data.preferences).toBeDefined();
        });

        it('accounts 스냅샷을 포함해야 함', () => {
            const result = exportAllSettings();
            expect(result.data.accounts).toEqual([{ company: 'co1', id: 'u1', password: 'p1' }]);
        });

        it('user_scripts 스냅샷을 포함해야 함', () => {
            const result = exportAllSettings();
            expect(result.data.user_scripts).toHaveLength(1);
            expect(result.data.user_scripts![0]).toMatchObject({
                id: 'script-1',
                name: '테스트 스크립트',
                enabled: true,
                code: 'console.log("test")',
            });
        });
    });

    describe('importAllSettings', () => {
        it('잘못된 JSON에 에러를 반환해야 함', async () => {
            const result = await importAllSettings('invalid json {{{');

            expect(result.success).toBe(false);
            expect(result.errors).toContain('JSON 파싱 실패');
        });

        it('지원하지 않는 버전에 에러를 반환해야 함', async () => {
            const backup = {
                version: 99,
                exported_at: new Date().toISOString(),
                data: {},
            };
            const result = await importAllSettings(JSON.stringify(backup));

            expect(result.success).toBe(false);
            expect(result.errors.some((e) => e.includes('지원하지 않는 백업 버전'))).toBe(true);
        });

        it('버전이 숫자가 아니면 에러를 반환해야 함', async () => {
            const backup = {
                version: '1',
                exported_at: new Date().toISOString(),
                data: {},
            };
            const result = await importAllSettings(JSON.stringify(backup));

            expect(result.success).toBe(false);
        });

        it('객체가 아니면 에러를 반환해야 함', async () => {
            const result = await importAllSettings('"string"');

            expect(result.success).toBe(false);
            expect(result.errors).toContain('잘못된 백업 형식');
        });

        it('null이면 에러를 반환해야 함', async () => {
            const result = await importAllSettings('null');

            expect(result.success).toBe(false);
        });

        it('부분 데이터(일부 키만 있는 경우)를 처리해야 함', async () => {
            const backup = {
                version: 1,
                exported_at: new Date().toISOString(),
                data: {
                    theme: 'dark',
                    preferences: { enable_animations: false },
                },
            };
            const result = await importAllSettings(JSON.stringify(backup));

            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('유효한 전체 JSON을 파싱하여 각 스토어에 복원해야 함', async () => {
            const backup = {
                version: 1,
                exported_at: new Date().toISOString(),
                data: {
                    accounts: [{ company: 'restored', id: 'r1', password: 'rp' }],
                    active_account: 'restored§r1',
                    user_scripts: [
                        {
                            id: 'restored-1',
                            name: '복원된 스크립트',
                            enabled: false,
                            url_patterns: [],
                            code: '// restored',
                            run_at: 'document_idle',
                            created_at: 2000,
                            updated_at: 2000,
                        },
                    ],
                    section_order: ['user-script', 'quick-login', 'server-manager', 'action-bar'],
                    section_visibility: { 'quick-login': false },
                    theme: 'light',
                    preferences: { enable_animations: false },
                },
            };
            const result = await importAllSettings(JSON.stringify(backup));

            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('readBackupFile', () => {
        it('File 객체에서 JSON을 읽어 복원해야 함', async () => {
            const backup = {
                version: 1,
                exported_at: new Date().toISOString(),
                data: { theme: 'dark' },
            };
            const file = new File([JSON.stringify(backup)], 'backup.json', {
                type: 'application/json',
            });

            const result = await readBackupFile(file);

            expect(result.success).toBe(true);
        });

        it('잘못된 JSON 파일에 에러를 반환해야 함', async () => {
            const file = new File(['not json'], 'backup.json', {
                type: 'application/json',
            });

            const result = await readBackupFile(file);

            expect(result.success).toBe(false);
            expect(result.errors).toContain('JSON 파싱 실패');
        });

        it('파일 읽기 실패 시 에러를 반환해야 함', async () => {
            const file = new File(['valid'], 'backup.json', { type: 'application/json' });
            const original_readAsText = FileReader.prototype.readAsText;
            FileReader.prototype.readAsText = function (this: FileReader) {
                setTimeout(() => {
                    if (this.onerror) {
                        this.onerror(new ProgressEvent('error') as ProgressEvent<FileReader>);
                    }
                }, 0);
            };

            const result = await readBackupFile(file);

            expect(result.success).toBe(false);
            expect(result.errors).toContain('파일 읽기 실패');

            FileReader.prototype.readAsText = original_readAsText;
        });
    });

    describe('downloadBackup', () => {
        it('에러 없이 실행되어야 함', () => {
            const click_spy = vi.fn();
            const original_create = document.createElement.bind(document);
            vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
                const el = original_create(tagName);
                if (tagName === 'a') {
                    (el as HTMLAnchorElement).click = click_spy;
                }
                return el;
            });
            vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
            vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

            downloadBackup();

            expect(click_spy).toHaveBeenCalled();
        });
    });
});
