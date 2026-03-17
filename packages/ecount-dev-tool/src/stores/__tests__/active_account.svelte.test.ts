import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    initializeActiveAccount,
    getActiveAccountKey,
    setActiveAccount,
    restoreActiveAccount,
} from '#stores/active_account.svelte';
import { initializeAccounts } from '#stores/accounts.svelte';
import { asMock } from '#test/mock_helpers';

describe('active_account 스토어', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        asMock(chrome.storage.sync.get).mockResolvedValue({
            login_accounts: [
                { company: 'co1', id: 'u1', password: 'p1' },
                { company: 'co2', id: 'u2', password: 'p2' },
            ],
            active_account: undefined,
        });
        await initializeAccounts();
        await initializeActiveAccount();
    });

    describe('restoreActiveAccount', () => {
        it('key를 설정하고 storage에 저장해야 함', async () => {
            const key = 'co1§u1';
            const result = await restoreActiveAccount(key);

            expect(result).toBe(true);
            expect(getActiveAccountKey()).toBe(key);
            expect(chrome.storage.sync.set).toHaveBeenCalledWith({
                active_account: key,
            });
        });

        it('null로 설정하여 활성 계정을 해제할 수 있어야 함', async () => {
            await setActiveAccount({ company: 'co1', id: 'u1', password: 'p1' });
            expect(getActiveAccountKey()).toBe('co1§u1');

            const result = await restoreActiveAccount(null);

            expect(result).toBe(true);
            expect(getActiveAccountKey()).toBeNull();
            expect(chrome.storage.sync.set).toHaveBeenCalledWith({
                active_account: null,
            });
        });

        it('storage 저장 실패 시 이전 상태로 롤백해야 함', async () => {
            await setActiveAccount({ company: 'co1', id: 'u1', password: 'p1' });
            const prev_key = getActiveAccountKey();

            asMock(chrome.storage.sync.set).mockRejectedValueOnce(new Error('Storage error'));

            const result = await restoreActiveAccount('co2§u2');

            expect(result).toBe(false);
            expect(getActiveAccountKey()).toBe(prev_key);
        });
    });
});
