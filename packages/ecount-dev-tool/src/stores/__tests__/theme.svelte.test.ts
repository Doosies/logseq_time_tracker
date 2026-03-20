import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initializeThemeSync, initializeTheme, getTheme, setTheme, resetTheme } from '../theme.svelte';
import { light_theme, dark_theme } from '@personal/uikit/design';
import { asMock } from '#test/mock_helpers';

const STORAGE_KEY = 'theme';

function createMatchMediaMock(matches: boolean) {
    const add_event_listener = vi.fn();
    const remove_event_listener = vi.fn();
    return {
        matches,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: add_event_listener,
        removeEventListener: remove_event_listener,
        dispatchEvent: vi.fn(),
    };
}

describe('theme store', () => {
    let match_media_mock: ReturnType<typeof createMatchMediaMock>;

    beforeEach(async () => {
        await resetTheme();
        if (typeof localStorage !== 'undefined') {
            localStorage.clear();
        }
        document.body.className = '';

        match_media_mock = createMatchMediaMock(false);
        vi.stubGlobal(
            'matchMedia',
            vi.fn(() => match_media_mock),
        );
        asMock(chrome.storage.sync.get).mockResolvedValue({});
        asMock(chrome.storage.sync.set).mockResolvedValue(undefined);
    });

    describe('initializeThemeSync', () => {
        it('localStorage에 저장된 테마(light)를 복원한다', () => {
            localStorage.setItem(STORAGE_KEY, 'light');
            initializeThemeSync();
            expect(getTheme()).toBe('light');
            expect(document.body.className).toBe(light_theme);
        });

        it('localStorage에 저장된 테마(dark)를 복원한다', () => {
            localStorage.setItem(STORAGE_KEY, 'dark');
            initializeThemeSync();
            expect(getTheme()).toBe('dark');
            expect(document.body.className).toBe(dark_theme);
        });

        it('localStorage에 저장된 테마(auto)를 복원한다', () => {
            localStorage.setItem(STORAGE_KEY, 'auto');
            initializeThemeSync();
            expect(getTheme()).toBe('auto');
        });

        it('저장된 값 없을 때 기본값 auto를 유지한다', () => {
            initializeThemeSync();
            expect(getTheme()).toBe('auto');
        });

        it('applyTheme 호출로 document.body.className을 설정한다', () => {
            initializeThemeSync();
            expect(document.body.className).toBe(light_theme);
        });
    });

    describe('initializeTheme (async)', () => {
        it('matchMedia change 이벤트 리스너를 등록한다', async () => {
            await initializeTheme();
            expect(match_media_mock.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
        });

        it('chrome.storage.sync에 테마가 있으면 해당 값으로 적용하고 localStorage에 반영한다', async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({ theme: 'dark' });
            await initializeTheme();
            expect(getTheme()).toBe('dark');
            expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
        });

        it('sync에 값이 없고 localStorage에만 있으면 sync로 마이그레이션한다', async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({});
            localStorage.setItem(STORAGE_KEY, 'light');
            await initializeTheme();
            expect(getTheme()).toBe('light');
            expect(chrome.storage.sync.set).toHaveBeenCalledWith({ theme: 'light' });
        });

        it('sync와 local 모두 없을 때 기본값 auto를 유지한다', async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({});
            await initializeTheme();
            expect(getTheme()).toBe('auto');
        });

        it('sync 읽기 실패 시 initializeThemeSync로 설정한 localStorage 테마를 유지한다', async () => {
            localStorage.setItem(STORAGE_KEY, 'dark');
            initializeThemeSync();
            expect(getTheme()).toBe('dark');

            asMock(chrome.storage.sync.get).mockRejectedValueOnce(new Error('sync read failed'));
            await initializeTheme();
            expect(getTheme()).toBe('dark');
        });
    });

    describe('getTheme', () => {
        it('현재 테마를 반환한다', async () => {
            initializeThemeSync();
            expect(getTheme()).toBe('auto');

            await setTheme('light');
            expect(getTheme()).toBe('light');

            await setTheme('dark');
            expect(getTheme()).toBe('dark');
        });
    });

    describe('setTheme', () => {
        it('테마 변경 후 current_theme을 업데이트한다', async () => {
            await setTheme('dark');
            expect(getTheme()).toBe('dark');

            await setTheme('light');
            expect(getTheme()).toBe('light');
        });

        it('localStorage에 테마를 저장한다', async () => {
            await setTheme('dark');
            expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');

            await setTheme('light');
            expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
        });

        it('chrome.storage.sync에도 테마를 저장한다', async () => {
            await setTheme('dark');
            expect(chrome.storage.sync.set).toHaveBeenCalledWith({ theme: 'dark' });
        });

        it('document.body.className을 light_theme로 변경한다 (light)', async () => {
            await setTheme('light');
            expect(document.body.className).toBe(light_theme);
        });

        it('document.body.className을 dark_theme로 변경한다 (dark)', async () => {
            await setTheme('dark');
            expect(document.body.className).toBe(dark_theme);
        });
    });

    describe('resetTheme', () => {
        it('테마를 auto로 초기화한다', async () => {
            await setTheme('dark');
            await resetTheme();
            expect(getTheme()).toBe('auto');
        });

        it('localStorage에서 테마를 제거한다', async () => {
            await setTheme('dark');
            expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');

            await resetTheme();
            expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
        });

        it('chrome.storage.sync에 auto를 저장한다', async () => {
            await setTheme('dark');
            await resetTheme();
            expect(chrome.storage.sync.set).toHaveBeenCalledWith({ theme: 'auto' });
        });

        it('matchMedia 리스너를 제거한다', async () => {
            await initializeTheme();
            expect(match_media_mock.removeEventListener).not.toHaveBeenCalled();

            await resetTheme();
            expect(match_media_mock.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
        });
    });

    describe('auto 모드에서 시스템 설정 변경', () => {
        it('matchMedia change 이벤트 발생 시 applyTheme을 호출한다', async () => {
            await initializeTheme();
            expect(document.body.className).toBe(light_theme);

            match_media_mock.matches = true;
            const [, change_handler] = (match_media_mock.addEventListener as ReturnType<typeof vi.fn>).mock
                .calls[0] as [string, () => void];
            change_handler();

            expect(document.body.className).toBe(dark_theme);
        });

        it('dark 모드 시 dark_theme 클래스를 적용한다', async () => {
            match_media_mock.matches = true;
            await initializeTheme();
            expect(document.body.className).toBe(dark_theme);
        });

        it('light 모드 시 light_theme 클래스를 적용한다', async () => {
            match_media_mock.matches = false;
            await initializeTheme();
            expect(document.body.className).toBe(light_theme);
        });

        it('auto가 아닐 때 change 이벤트는 테마를 변경하지 않는다', async () => {
            await initializeTheme();
            await setTheme('light');
            expect(document.body.className).toBe(light_theme);

            match_media_mock.matches = true;
            const [, change_handler] = (match_media_mock.addEventListener as ReturnType<typeof vi.fn>).mock
                .calls[0] as [string, () => void];
            change_handler();

            expect(document.body.className).toBe(light_theme);
        });
    });
});
