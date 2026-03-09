import { describe, it, expect, beforeEach } from 'vitest';
import { initializePreferences, getPreferences, setEnableAnimations, resetPreferences } from '../preferences.svelte';

const STORAGE_KEY = 'user_preferences';

describe('preferences store', () => {
    beforeEach(() => {
        resetPreferences();
        if (typeof localStorage !== 'undefined') {
            localStorage.clear();
        }
    });

    describe('initializePreferences', () => {
        it('localStorage에 저장된 설정을 복원한다', () => {
            const stored = JSON.stringify({ enable_animations: false });
            localStorage.setItem(STORAGE_KEY, stored);
            initializePreferences();
            expect(getPreferences()).toEqual({ enable_animations: false });
        });

        it('enable_animations 값을 복원 확인한다', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ enable_animations: true }));
            initializePreferences();
            expect(getPreferences().enable_animations).toBe(true);

            resetPreferences();
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ enable_animations: false }));
            initializePreferences();
            expect(getPreferences().enable_animations).toBe(false);
        });

        it('저장된 값 없을 때 기본값 {enable_animations: true}를 유지한다', () => {
            initializePreferences();
            expect(getPreferences()).toEqual({ enable_animations: true });
        });

        it('잘못된 JSON 시 기본값으로 폴백한다', () => {
            localStorage.setItem(STORAGE_KEY, 'invalid json {{{');
            initializePreferences();
            expect(getPreferences()).toEqual({ enable_animations: true });
        });

        it('localStorage.getItem()이 null 반환 시 기본값을 유지한다', () => {
            expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
            initializePreferences();
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
    });

    describe('엣지 케이스', () => {
        it('JSON.parse() 예외 발생 시(잘못된 JSON) 기본값으로 폴백한다', () => {
            localStorage.setItem(STORAGE_KEY, '{]');
            initializePreferences();
            expect(getPreferences()).toEqual({ enable_animations: true });
        });

        it('빈 문자열 저장 시 기본값 유지한다', () => {
            localStorage.setItem(STORAGE_KEY, '');
            initializePreferences();
            expect(getPreferences()).toEqual({ enable_animations: true });
        });
    });
});
