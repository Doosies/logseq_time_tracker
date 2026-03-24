import { describe, it, expect, beforeEach } from 'vitest';
import { initializeSetupState, isFirstLaunch, markSetupCompleted, resetSetupState } from '../setup_state.svelte';
import { asMock } from '#test/mock_helpers';

function setLocalStorageItem(key: string, value: unknown): void {
    (
        globalThis as unknown as { __storybook_set_local_storage?: (k: string, v: unknown) => void }
    ).__storybook_set_local_storage?.(key, value);
}

describe('setup_state store', () => {
    beforeEach(() => {
        resetSetupState();
    });

    describe('initializeSetupState', () => {
        it('setup_completed 플래그가 없으면 isFirstLaunch()가 true를 반환한다', async () => {
            await initializeSetupState();
            expect(isFirstLaunch()).toBe(true);
        });

        it('setup_completed 플래그가 있으면 isFirstLaunch()가 false를 반환한다', async () => {
            setLocalStorageItem('setup_completed', true);
            await initializeSetupState();
            expect(isFirstLaunch()).toBe(false);
        });

        it('chrome.storage.local 에러 시 isFirstLaunch()가 false를 반환한다', async () => {
            asMock(chrome.storage.local.get).mockRejectedValueOnce(new Error('storage error'));
            await initializeSetupState();
            expect(isFirstLaunch()).toBe(false);
        });
    });

    describe('markSetupCompleted', () => {
        it('isFirstLaunch()를 false로 변경한다', async () => {
            await initializeSetupState();
            expect(isFirstLaunch()).toBe(true);

            await markSetupCompleted();
            expect(isFirstLaunch()).toBe(false);
        });

        it('chrome.storage.local에 setup_completed: true를 저장한다', async () => {
            await markSetupCompleted();
            expect(chrome.storage.local.set).toHaveBeenCalledWith({ setup_completed: true });
        });

        it('저장 실패해도 isFirstLaunch()는 false를 유지한다', async () => {
            await initializeSetupState();
            expect(isFirstLaunch()).toBe(true);

            asMock(chrome.storage.local.set).mockRejectedValueOnce(new Error('write failed'));
            await markSetupCompleted();
            expect(isFirstLaunch()).toBe(false);
        });
    });

    describe('resetSetupState', () => {
        it('isFirstLaunch()를 false로 초기화한다', async () => {
            await initializeSetupState();
            expect(isFirstLaunch()).toBe(true);

            resetSetupState();
            expect(isFirstLaunch()).toBe(false);
        });
    });
});
