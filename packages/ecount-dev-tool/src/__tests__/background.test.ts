import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { UserScript } from '#types/user_script';

const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;

const STORAGE_KEY = 'user_scripts_data';

const MOCK_SCRIPT: UserScript = {
    id: 'test-1',
    name: '테스트 스크립트',
    enabled: true,
    url_patterns: ['*://zeus*.ecount.com/*'],
    code: 'console.log("hello")',
    run_at: 'document_idle',
    created_at: 1000,
    updated_at: 1000,
};

const DISABLED_SCRIPT: UserScript = {
    ...MOCK_SCRIPT,
    id: 'test-2',
    name: '비활성 스크립트',
    enabled: false,
};

/**
 * [FEATURE_TOGGLE] document_start 옵션 비활성화됨 (2026-03-09)
 *
 * 복원 방법:
 * 1. 아래 주석 해제
 * 2. 이 스크립트를 사용하는 테스트 케이스들도 활성화
 * 3. ScriptEditor.svelte와 user_scripts.svelte.ts 복원 완료 후 실행
 *
 * 관련 파일:
 * - src/components/UserScriptSection/ScriptEditor.svelte
 * - src/stores/user_scripts.svelte.ts (line 16, migrateScript)
 */
// const DOCUMENT_START_SCRIPT: UserScript = {
//     ...MOCK_SCRIPT,
//     id: 'test-document-start',
//     name: 'document-start 스크립트',
//     run_at: 'document_start',
//     code: 'console.log("document_start")',
// };

describe('background service worker', () => {
    let on_updated_callback: (tab_id: number, info: { status?: string }, tab: { url?: string }) => void;
    let on_changed_callback: (changes: Record<string, { newValue?: unknown }>, area: string) => void;

    beforeEach(async () => {
        vi.resetModules();

        asMock(chrome.storage.local.get).mockResolvedValue({
            [STORAGE_KEY]: [MOCK_SCRIPT, DISABLED_SCRIPT],
        });

        asMock(chrome.tabs.onUpdated.addListener).mockImplementation((cb: typeof on_updated_callback) => {
            on_updated_callback = cb;
        });
        asMock(chrome.storage.onChanged.addListener).mockImplementation((cb: typeof on_changed_callback) => {
            on_changed_callback = cb;
        });

        await import('../background');
    });

    it('tabs.onUpdated 리스너를 등록한다', () => {
        expect(chrome.tabs.onUpdated.addListener).toHaveBeenCalled();
        expect(on_updated_callback).toBeDefined();
    });

    it('storage.onChanged 리스너를 등록한다', () => {
        expect(chrome.storage.onChanged.addListener).toHaveBeenCalled();
        expect(on_changed_callback).toBeDefined();
    });

    it('ecount.com URL에서 status complete이면 매칭 스크립트를 실행한다', () => {
        on_updated_callback(42, { status: 'complete' }, { url: 'https://zeus01.ecount.com/ecerp/ES080100' });
        expect(chrome.scripting.executeScript).toHaveBeenCalled();
    });

    it('ecount.com이 아닌 URL은 무시한다', () => {
        on_updated_callback(42, { status: 'complete' }, { url: 'https://google.com' });
        expect(chrome.scripting.executeScript).not.toHaveBeenCalled();
    });

    it('status가 complete이 아니면 document_idle 스크립트는 실행하지 않는다', () => {
        on_updated_callback(42, { status: 'loading' }, { url: 'https://zeus01.ecount.com/' });
        expect(chrome.scripting.executeScript).not.toHaveBeenCalled();
    });

    /**
     * [FEATURE_TOGGLE] document_start 옵션 비활성화됨 (2026-03-09)
     * DOCUMENT_START_SCRIPT 상수 주석 해제 후 아래 테스트 활성화
     */
    // it('document_start 스크립트는 status loading일 때만 실행한다', async () => {
    //     vi.resetModules();
    //
    //     asMock(chrome.storage.local.get).mockResolvedValue({
    //         [STORAGE_KEY]: [DOCUMENT_START_SCRIPT],
    //     });
    //
    //     asMock(chrome.tabs.onUpdated.addListener).mockImplementation((cb: typeof on_updated_callback) => {
    //         on_updated_callback = cb;
    //     });
    //     asMock(chrome.storage.onChanged.addListener).mockImplementation((cb: typeof on_changed_callback) => {
    //         on_changed_callback = cb;
    //     });
    //
    //     await import('../background');
    //
    //     on_updated_callback(42, { status: 'loading' }, { url: 'https://zeus01.ecount.com/' });
    //
    //     expect(chrome.scripting.executeScript).toHaveBeenCalled();
    //     const calls = asMock(chrome.scripting.executeScript).mock.calls;
    //     const executed_code = (calls[0] as unknown[])?.[0] as { args?: string[] };
    //     expect(executed_code?.args?.[0]).toBe(DOCUMENT_START_SCRIPT.code);
    // });

    /**
     * [FEATURE_TOGGLE] document_start 옵션 비활성화됨 (2026-03-09)
     * DOCUMENT_START_SCRIPT 상수 주석 해제 후 아래 테스트 활성화
     */
    // it('document_start 스크립트는 status complete일 때는 실행하지 않는다', async () => {
    //     vi.resetModules();
    //
    //     asMock(chrome.storage.local.get).mockResolvedValue({
    //         [STORAGE_KEY]: [DOCUMENT_START_SCRIPT],
    //     });
    //
    //     asMock(chrome.tabs.onUpdated.addListener).mockImplementation((cb: typeof on_updated_callback) => {
    //         on_updated_callback = cb;
    //     });
    //     asMock(chrome.storage.onChanged.addListener).mockImplementation((cb: typeof on_changed_callback) => {
    //         on_changed_callback = cb;
    //     });
    //
    //     await import('../background');
    //
    //     on_updated_callback(42, { status: 'complete' }, { url: 'https://zeus01.ecount.com/' });
    //
    //     expect(chrome.scripting.executeScript).not.toHaveBeenCalled();
    // });

    it('enabled가 false인 스크립트는 실행하지 않는다', async () => {
        vi.resetModules();

        asMock(chrome.storage.local.get).mockResolvedValue({
            [STORAGE_KEY]: [DISABLED_SCRIPT],
        });

        asMock(chrome.tabs.onUpdated.addListener).mockImplementation((cb: typeof on_updated_callback) => {
            on_updated_callback = cb;
        });
        asMock(chrome.storage.onChanged.addListener).mockImplementation((cb: typeof on_changed_callback) => {
            on_changed_callback = cb;
        });

        await import('../background');

        on_updated_callback(42, { status: 'complete' }, { url: 'https://zeus01.ecount.com/' });

        const calls = asMock(chrome.scripting.executeScript).mock.calls;
        const executed_codes = calls.map((c: unknown[]) => (c[0] as { args?: string[] })?.args?.[0]);
        expect(executed_codes).not.toContain(DISABLED_SCRIPT.code);
    });

    it('storage.onChanged로 스크립트 변경 시 캐시를 갱신한다', async () => {
        const new_script: UserScript = {
            ...MOCK_SCRIPT,
            id: 'test-3',
            name: '새 스크립트',
            url_patterns: ['*://test.ecount.com/*'],
            code: 'console.log("new")',
        };

        asMock(chrome.storage.local.get).mockResolvedValue({
            [STORAGE_KEY]: [new_script],
        });

        on_changed_callback({ [STORAGE_KEY]: { newValue: [new_script] } }, 'local');

        await new Promise((r) => setTimeout(r, 10));

        on_updated_callback(42, { status: 'complete' }, { url: 'https://test.ecount.com/page' });

        expect(chrome.scripting.executeScript).toHaveBeenCalled();
    });
});
