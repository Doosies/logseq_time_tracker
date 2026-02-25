import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    initializeAccounts,
    getAccounts,
    isAccountsLoaded,
    addAccount,
    removeAccount,
    isDuplicate,
} from '#stores/accounts.svelte';
import type { LoginAccount } from '#types/server';
import { asMock } from '#test/mock_helpers';

const DEFAULT_ACCOUNTS = [
    { company: 'company1', id: 'user1', password: 'pw1' },
    { company: 'company2', id: 'user2', password: 'pw2' },
];

describe('accounts 스토어', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('initializeAccounts', () => {
        it('저장된 데이터가 없으면 환경변수 시드를 사용해야 함', async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                login_accounts: undefined,
            });

            await initializeAccounts();

            expect(getAccounts()).toEqual(DEFAULT_ACCOUNTS);
            expect(isAccountsLoaded()).toBe(true);
            expect(chrome.storage.sync.set).toHaveBeenCalledWith({
                login_accounts: DEFAULT_ACCOUNTS,
            });
        });

        it('저장된 데이터가 있으면 해당 데이터를 사용해야 함', async () => {
            const stored = [{ company: 'stored', id: 'saved', password: 'pw' }];
            asMock(chrome.storage.sync.get).mockResolvedValue({
                login_accounts: stored,
            });

            await initializeAccounts();

            expect(getAccounts()).toEqual(stored);
            expect(isAccountsLoaded()).toBe(true);
        });

        it('빈 배열이 저장되어 있으면 환경변수 시드를 사용해야 함', async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                login_accounts: [],
            });

            await initializeAccounts();

            expect(getAccounts()).toEqual(DEFAULT_ACCOUNTS);
        });

        it('chrome.storage 에러 시 환경변수 시드로 폴백해야 함', async () => {
            asMock(chrome.storage.sync.get).mockRejectedValue(new Error('Storage error'));

            await initializeAccounts();

            expect(getAccounts()).toEqual(DEFAULT_ACCOUNTS);
            expect(isAccountsLoaded()).toBe(true);
        });

        it('손상된 데이터(문자열)가 저장되어 있으면 시드로 폴백해야 함', async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                login_accounts: 'corrupted_string',
            });

            await initializeAccounts();

            expect(getAccounts()).toEqual(DEFAULT_ACCOUNTS);
        });

        it('손상된 데이터(객체)가 저장되어 있으면 시드로 폴백해야 함', async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                login_accounts: { not: 'an array' },
            });

            await initializeAccounts();

            expect(getAccounts()).toEqual(DEFAULT_ACCOUNTS);
        });

        it('필드가 누락된 배열이 저장되어 있으면 시드로 폴백해야 함', async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                login_accounts: [{ company: 'co1' }],
            });

            await initializeAccounts();

            expect(getAccounts()).toEqual(DEFAULT_ACCOUNTS);
        });

        it('숫자가 포함된 배열이 저장되어 있으면 시드로 폴백해야 함', async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                login_accounts: [1, 2, 3],
            });

            await initializeAccounts();

            expect(getAccounts()).toEqual(DEFAULT_ACCOUNTS);
        });

        it('저장된 데이터에 중복이 있으면 제거해야 함', async () => {
            const duplicated = [
                { company: 'co', id: 'u1', password: 'p1' },
                { company: 'co', id: 'u1', password: 'p2' },
                { company: 'co', id: 'u2', password: 'p3' },
            ];
            asMock(chrome.storage.sync.get).mockResolvedValue({
                login_accounts: duplicated,
            });

            await initializeAccounts();

            const result = getAccounts();
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                company: 'co',
                id: 'u1',
                password: 'p1',
            });
            expect(result[1]).toEqual({
                company: 'co',
                id: 'u2',
                password: 'p3',
            });
        });
    });

    describe('isDuplicate', () => {
        beforeEach(async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                login_accounts: undefined,
            });
            await initializeAccounts();
        });

        it('같은 company와 id를 가진 계정이 있으면 true를 반환해야 함', () => {
            expect(isDuplicate({ company: 'company1', id: 'user1', password: 'any' })).toBe(true);
        });

        it('같은 company와 id가 없으면 false를 반환해야 함', () => {
            expect(isDuplicate({ company: 'company3', id: 'user3', password: 'pw' })).toBe(false);
        });

        it('같은 company 다른 id는 중복이 아니어야 함', () => {
            expect(isDuplicate({ company: 'company1', id: 'other_id', password: 'pw' })).toBe(false);
        });

        it('같은 id 다른 company는 중복이 아니어야 함', () => {
            expect(isDuplicate({ company: 'other_co', id: 'user1', password: 'pw' })).toBe(false);
        });

        it('company와 id에 특수문자(§)가 포함되어도 중복 검사가 올바르게 동작해야 함', async () => {
            await addAccount({
                company: 'co§1',
                id: 'user§1',
                password: 'pw',
            });
            expect(isDuplicate({ company: 'co§1', id: 'user§1', password: 'different' })).toBe(true);
            expect(isDuplicate({ company: 'co§2', id: 'user§2', password: 'pw' })).toBe(false);
        });
    });

    describe('addAccount', () => {
        beforeEach(async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                login_accounts: undefined,
            });
            await initializeAccounts();
            vi.clearAllMocks();
        });

        it('새 계정을 추가하고 storage에 동기화해야 함', async () => {
            const new_account = {
                company: 'newco',
                id: 'newuser',
                password: 'newpw',
            };
            await addAccount(new_account);

            const result = getAccounts();
            expect(result).toHaveLength(DEFAULT_ACCOUNTS.length + 1);
            expect(result[result.length - 1]).toEqual(new_account);
            expect(chrome.storage.sync.set).toHaveBeenCalled();
        });

        it('9개 이상의 계정을 추가할 수 있어야 함', async () => {
            const EXTRA_COUNT = 10;
            for (let i = 0; i < EXTRA_COUNT; i++) {
                await addAccount({
                    company: `co${i}`,
                    id: `user${i}`,
                    password: `pw${i}`,
                });
            }

            const result = getAccounts();
            expect(result).toHaveLength(DEFAULT_ACCOUNTS.length + EXTRA_COUNT);
            expect(chrome.storage.sync.set).toHaveBeenCalledTimes(EXTRA_COUNT);
        });

        it('연속 추가 시 모든 계정이 올바른 순서로 유지되어야 함', async () => {
            await addAccount({ company: 'A', id: 'a1', password: 'p1' });
            await addAccount({ company: 'B', id: 'b1', password: 'p2' });
            await addAccount({ company: 'C', id: 'c1', password: 'p3' });

            const result = getAccounts();
            const last_three = result.slice(-3);
            expect(last_three.map((a) => a.company)).toEqual(['A', 'B', 'C']);
        });

        it('storage 동기화에 plain object가 전달되어야 함', async () => {
            await addAccount({
                company: 'test',
                id: 'test',
                password: 'test',
            });

            const call_arg = asMock(chrome.storage.sync.set)?.mock?.calls[0]?.[0];
            const stored = call_arg.login_accounts;
            expect(Array.isArray(stored)).toBe(true);
            expect(JSON.stringify(stored)).toBe(JSON.stringify(getAccounts()));
        });

        it('storage 저장 실패 시 이전 상태로 롤백해야 함', async () => {
            const before = [...getAccounts()];
            asMock(chrome.storage.sync.set).mockRejectedValueOnce(new Error('QUOTA_BYTES_PER_ITEM quota exceeded'));

            const result = await addAccount({
                company: 'fail',
                id: 'fail',
                password: 'fail',
            });

            expect(result).toBe(false);
            expect(getAccounts()).toEqual(before);
        });

        it('storage 실패 후에도 다음 추가가 정상 동작해야 함', async () => {
            asMock(chrome.storage.sync.set).mockRejectedValueOnce(new Error('Quota exceeded'));
            await addAccount({
                company: 'fail',
                id: 'fail',
                password: 'fail',
            });

            asMock(chrome.storage.sync.set).mockResolvedValueOnce(undefined);
            const result = await addAccount({
                company: 'ok',
                id: 'ok',
                password: 'ok',
            });

            expect(result).toBe(true);
            expect(getAccounts().some((a) => a.company === 'ok')).toBe(true);
            expect(getAccounts().some((a) => a.company === 'fail')).toBe(false);
        });

        it('성공 시 true를 반환해야 함', async () => {
            const result = await addAccount({
                company: 'x',
                id: 'x',
                password: 'x',
            });

            expect(result).toBe(true);
        });

        it('중복 계정(같은 company+id)은 추가를 거부해야 함', async () => {
            const result = await addAccount({
                company: 'company1',
                id: 'user1',
                password: 'different_pw',
            });

            expect(result).toBe(false);
            expect(getAccounts()).toHaveLength(DEFAULT_ACCOUNTS.length);
            expect(chrome.storage.sync.set).not.toHaveBeenCalled();
        });

        it('같은 company 다른 id는 허용해야 함', async () => {
            const result = await addAccount({
                company: 'company1',
                id: 'different_user',
                password: 'pw',
            });

            expect(result).toBe(true);
            expect(getAccounts()).toHaveLength(DEFAULT_ACCOUNTS.length + 1);
        });

        it('같은 id 다른 company는 허용해야 함', async () => {
            const result = await addAccount({
                company: 'different_co',
                id: 'user1',
                password: 'pw',
            });

            expect(result).toBe(true);
            expect(getAccounts()).toHaveLength(DEFAULT_ACCOUNTS.length + 1);
        });

        it('제거 후 같은 계정을 다시 추가할 수 있어야 함', async () => {
            const target: LoginAccount = { ...DEFAULT_ACCOUNTS[0]! };
            await removeAccount(0);
            expect(getAccounts()).toHaveLength(DEFAULT_ACCOUNTS.length - 1);

            const result = await addAccount(target);

            expect(result).toBe(true);
            expect(getAccounts().some((a) => a.company === target.company && a.id === target.id)).toBe(true);
        });

        it('초기화 전에 호출하면 false를 반환해야 함', async () => {
            vi.resetModules();
            const { addAccount: addAccountFresh, initializeAccounts: initFresh } =
                await import('#stores/accounts.svelte');
            asMock(chrome.storage.sync.get).mockResolvedValue({ login_accounts: undefined });

            const result = await addAccountFresh({
                company: 'x',
                id: 'x',
                password: 'x',
            });

            expect(result).toBe(false);
            await initFresh();
        });
    });

    describe('removeAccount', () => {
        beforeEach(async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                login_accounts: undefined,
            });
            await initializeAccounts();
            vi.clearAllMocks();
        });

        it('인덱스로 계정을 제거하고 storage에 동기화해야 함', async () => {
            await removeAccount(0);

            const result = getAccounts();
            expect(result).toHaveLength(DEFAULT_ACCOUNTS.length - 1);
            expect(result[0]?.company).toBe('company2');
            expect(chrome.storage.sync.set).toHaveBeenCalled();
        });

        it('마지막 계정을 제거할 수 있어야 함', async () => {
            const last_index = DEFAULT_ACCOUNTS.length - 1;
            await removeAccount(last_index);

            const result = getAccounts();
            expect(result).toHaveLength(DEFAULT_ACCOUNTS.length - 1);
            expect(result.every((a) => a.company !== 'company2')).toBe(true);
        });

        it('모든 계정을 제거할 수 있어야 함', async () => {
            for (let i = DEFAULT_ACCOUNTS.length - 1; i >= 0; i--) {
                await removeAccount(0);
            }

            expect(getAccounts()).toHaveLength(0);
        });

        it('추가 후 제거가 올바르게 동작해야 함', async () => {
            await addAccount({
                company: 'X',
                id: 'x1',
                password: 'xp',
            });
            const length_after_add = getAccounts().length;

            await removeAccount(length_after_add - 1);

            expect(getAccounts()).toHaveLength(length_after_add - 1);
            expect(getAccounts().every((a) => a.company !== 'X')).toBe(true);
        });

        it('storage 저장 실패 시 이전 상태로 롤백해야 함', async () => {
            const before = [...getAccounts()];
            asMock(chrome.storage.sync.set).mockRejectedValueOnce(new Error('Storage error'));

            const result = await removeAccount(0);

            expect(result).toBe(false);
            expect(getAccounts()).toEqual(before);
        });

        it('성공 시 true를 반환해야 함', async () => {
            const result = await removeAccount(0);

            expect(result).toBe(true);
        });

        it('음수 인덱스는 거부해야 함', async () => {
            const before = [...getAccounts()];

            const result = await removeAccount(-1);

            expect(result).toBe(false);
            expect(getAccounts()).toEqual(before);
            expect(chrome.storage.sync.set).not.toHaveBeenCalled();
        });

        it('범위 초과 인덱스는 거부해야 함', async () => {
            const before = [...getAccounts()];

            const result = await removeAccount(999);

            expect(result).toBe(false);
            expect(getAccounts()).toEqual(before);
            expect(chrome.storage.sync.set).not.toHaveBeenCalled();
        });

        it('accounts.length와 같은 인덱스는 거부해야 함', async () => {
            const before = [...getAccounts()];

            const result = await removeAccount(DEFAULT_ACCOUNTS.length);

            expect(result).toBe(false);
            expect(getAccounts()).toEqual(before);
            expect(chrome.storage.sync.set).not.toHaveBeenCalled();
        });

        it('초기화 전에 호출하면 false를 반환해야 함', async () => {
            vi.resetModules();
            const { removeAccount: removeAccountFresh, initializeAccounts: initFresh } =
                await import('#stores/accounts.svelte');
            asMock(chrome.storage.sync.get).mockResolvedValue({ login_accounts: undefined });

            const result = await removeAccountFresh(0);

            expect(result).toBe(false);
            await initFresh();
        });

        it('storage 저장 실패 후에도 다음 제거가 정상 동작해야 함', async () => {
            asMock(chrome.storage.sync.set).mockRejectedValueOnce(new Error('Storage error'));
            const result_fail = await removeAccount(0);

            expect(result_fail).toBe(false);
            expect(getAccounts()).toHaveLength(DEFAULT_ACCOUNTS.length);

            asMock(chrome.storage.sync.set).mockResolvedValueOnce(undefined);
            const result_ok = await removeAccount(0);

            expect(result_ok).toBe(true);
            expect(getAccounts()).toHaveLength(DEFAULT_ACCOUNTS.length - 1);
        });
    });
});
