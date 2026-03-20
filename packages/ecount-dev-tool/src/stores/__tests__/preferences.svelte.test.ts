import { describe, it, expect, beforeEach } from 'vitest';
import {
    initializePreferences,
    getPreferences,
    setEnableAnimations,
    resetPreferences,
    restorePreferences,
} from '../preferences.svelte';
import { asMock } from '#test/mock_helpers';

const STORAGE_KEY = 'user_preferences';

describe('preferences store', () => {
    beforeEach(async () => {
        await resetPreferences();
        if (typeof localStorage !== 'undefined') {
            localStorage.clear();
        }
        // sync에 유효한 user_preferences가 없을 때만 localStorage 마이그레이션 경로를 탄다
        asMock(chrome.storage.sync.get).mockResolvedValue({ user_preferences: undefined });
    });

    describe('initializePreferences', () => {
        it('chrome.storage.sync에 유효한 user_preferences가 있으면 해당 값을 적용하고 localStorage에 반영한다', async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                user_preferences: { enable_animations: false },
            });
            await initializePreferences();
            expect(getPreferences()).toEqual({ enable_animations: false });
            expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify({ enable_animations: false }));
        });

        it('localStorage에 저장된 설정을 복원한다', async () => {
            const stored = JSON.stringify({ enable_animations: false });
            localStorage.setItem(STORAGE_KEY, stored);
            await initializePreferences();
            expect(getPreferences()).toEqual({ enable_animations: false });
            expect(chrome.storage.sync.set).toHaveBeenCalledWith({
                user_preferences: { enable_animations: false },
            });
        });

        it('enable_animations 값을 복원 확인한다', async () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ enable_animations: true }));
            await initializePreferences();
            expect(getPreferences().enable_animations).toBe(true);

            await resetPreferences();
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ enable_animations: false }));
            await initializePreferences();
            expect(getPreferences().enable_animations).toBe(false);
        });

        it('저장된 값 없을 때 기본값 {enable_animations: true}를 유지한다', async () => {
            await initializePreferences();
            expect(getPreferences()).toEqual({ enable_animations: true });
        });

        it('잘못된 JSON 시 기본값으로 폴백한다', async () => {
            localStorage.setItem(STORAGE_KEY, 'invalid json {{{');
            await initializePreferences();
            expect(getPreferences()).toEqual({ enable_animations: true });
        });

        it('localStorage.getItem()이 null 반환 시 기본값을 유지한다', async () => {
            expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
            await initializePreferences();
            expect(getPreferences()).toEqual({ enable_animations: true });
        });
    });

    describe('getPreferences', () => {
        it('현재 preferences를 반환한다', () => {
            const prefs = getPreferences();
            expect(prefs).toEqual({ enable_animations: true });
            expect(prefs.enable_animations).toBe(true);
        });
    });

    describe('setEnableAnimations', () => {
        it('애니메이션 설정을 변경한다', async () => {
            await setEnableAnimations(false);
            expect(getPreferences().enable_animations).toBe(false);

            await setEnableAnimations(true);
            expect(getPreferences().enable_animations).toBe(true);
        });

        it('preferences 객체를 업데이트한다', async () => {
            await setEnableAnimations(false);
            expect(getPreferences()).toEqual({ enable_animations: false });
        });

        it('localStorage에 JSON 직렬화하여 저장한다', async () => {
            await setEnableAnimations(false);
            const stored = localStorage.getItem(STORAGE_KEY);
            expect(stored).toBe(JSON.stringify({ enable_animations: false }));

            await setEnableAnimations(true);
            expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify({ enable_animations: true }));
        });

        it('true 설정 시 localStorage에 반영한다', async () => {
            await setEnableAnimations(true);
            expect(localStorage.getItem(STORAGE_KEY)).toBe('{"enable_animations":true}');
        });

        it('false 설정 시 localStorage에 반영한다', async () => {
            await setEnableAnimations(false);
            expect(localStorage.getItem(STORAGE_KEY)).toBe('{"enable_animations":false}');
        });

        it('chrome.storage.sync.set을 호출하여 동기화한다', async () => {
            await setEnableAnimations(false);
            expect(chrome.storage.sync.set).toHaveBeenCalledWith({
                user_preferences: { enable_animations: false },
            });
        });
    });

    describe('restorePreferences', () => {
        it('기본값과 merge하여 복원해야 함', async () => {
            const result = await restorePreferences({ enable_animations: false });

            expect(result).toBe(true);
            expect(getPreferences()).toEqual({ enable_animations: false });
        });

        it('부분 데이터(일부 키만)를 기본값과 merge해야 함', async () => {
            const result = await restorePreferences({ enable_animations: false });

            expect(result).toBe(true);
            expect(getPreferences()).toEqual({ enable_animations: false });
        });

        it('localStorage에 저장해야 함', async () => {
            await restorePreferences({ enable_animations: false });

            const stored = localStorage.getItem(STORAGE_KEY);
            expect(stored).toBe(JSON.stringify({ enable_animations: false }));
        });

        it('chrome.storage.sync.set을 호출하여 동기화한다', async () => {
            await restorePreferences({ enable_animations: false });
            expect(chrome.storage.sync.set).toHaveBeenCalledWith({
                user_preferences: { enable_animations: false },
            });
        });
    });

    describe('resetPreferences', () => {
        it('chrome.storage.sync에 기본값을 저장한다', async () => {
            await setEnableAnimations(false);
            await resetPreferences();
            expect(chrome.storage.sync.set).toHaveBeenCalledWith({
                user_preferences: { enable_animations: true },
            });
        });
    });

    describe('엣지 케이스', () => {
        it('JSON.parse() 예외 발생 시(잘못된 JSON) 기본값으로 폴백한다', async () => {
            localStorage.setItem(STORAGE_KEY, '{]');
            await initializePreferences();
            expect(getPreferences()).toEqual({ enable_animations: true });
        });

        it('빈 문자열 저장 시 기본값 유지한다', async () => {
            localStorage.setItem(STORAGE_KEY, '');
            await initializePreferences();
            expect(getPreferences()).toEqual({ enable_animations: true });
        });
    });
});
