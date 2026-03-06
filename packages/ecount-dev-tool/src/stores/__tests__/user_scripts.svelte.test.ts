import { describe, it, expect, beforeEach } from 'vitest';
import {
    getScripts,
    getEnabledScripts,
    getScriptById,
    initializeUserScripts,
    addScript,
    updateScript,
    deleteScript,
    toggleScript,
} from '../user_scripts.svelte';
import { asMock } from '#test/mock_helpers';

describe('user_scripts store', () => {
    beforeEach(async () => {
        asMock(chrome.storage.local.get).mockResolvedValue({});
        await initializeUserScripts();
    });

    describe('initializeUserScripts', () => {
        it('저장된 데이터가 없으면 빈 배열을 반환한다', async () => {
            expect(getScripts()).toEqual([]);
        });

        it('저장된 데이터를 복원한다', async () => {
            const stored_scripts = [
                {
                    id: 'test-1',
                    name: '테스트',
                    enabled: true,
                    url_patterns: ['*://test.ecount.com/*'],
                    code: 'console.log("test")',
                    run_at: 'document_idle' as const,
                    created_at: 1000,
                    updated_at: 1000,
                },
            ];
            asMock(chrome.storage.local.get).mockResolvedValue({
                user_scripts_data: stored_scripts,
            });
            await initializeUserScripts();
            expect(getScripts()).toEqual(stored_scripts);
        });

        it('잘못된 데이터는 빈 배열로 폴백한다', async () => {
            asMock(chrome.storage.local.get).mockResolvedValue({
                user_scripts_data: 'invalid',
            });
            await initializeUserScripts();
            expect(getScripts()).toEqual([]);
        });
    });

    describe('addScript', () => {
        it('스크립트를 추가하고 목록에 반영한다', async () => {
            const id = await addScript({
                name: '새 스크립트',
                enabled: true,
                url_patterns: ['*://test.ecount.com/*'],
                code: 'alert("hi")',
                run_at: 'document_idle',
            });
            expect(id).toBeTruthy();
            const scripts = getScripts();
            expect(scripts).toHaveLength(1);
            expect(scripts[0]!.name).toBe('새 스크립트');
        });

        it('id, created_at, updated_at을 자동 생성한다', async () => {
            const id = await addScript({
                name: '테스트',
                enabled: true,
                url_patterns: [],
                code: '',
                run_at: 'document_idle',
            });
            const script = getScriptById(id!);
            expect(script?.id).toBeTruthy();
            expect(script?.created_at).toBeGreaterThan(0);
            expect(script?.updated_at).toBeGreaterThan(0);
        });
    });

    describe('updateScript', () => {
        it('기존 스크립트를 수정한다', async () => {
            const id = await addScript({
                name: '원래 이름',
                enabled: true,
                url_patterns: [],
                code: '',
                run_at: 'document_idle',
            });
            const result = await updateScript(id!, { name: '변경된 이름' });
            expect(result).toBe(true);
            expect(getScriptById(id!)?.name).toBe('변경된 이름');
        });

        it('존재하지 않는 스크립트는 false를 반환한다', async () => {
            const result = await updateScript('nonexistent', { name: 'test' });
            expect(result).toBe(false);
        });
    });

    describe('deleteScript', () => {
        it('스크립트를 삭제한다', async () => {
            const id = await addScript({
                name: '삭제할 스크립트',
                enabled: true,
                url_patterns: [],
                code: '',
                run_at: 'document_idle',
            });
            const result = await deleteScript(id!);
            expect(result).toBe(true);
            expect(getScripts()).toHaveLength(0);
        });

        it('존재하지 않는 스크립트는 false를 반환한다', async () => {
            const result = await deleteScript('nonexistent');
            expect(result).toBe(false);
        });
    });

    describe('toggleScript', () => {
        it('enabled 상태를 토글한다', async () => {
            const id = await addScript({
                name: '토글 테스트',
                enabled: true,
                url_patterns: [],
                code: '',
                run_at: 'document_idle',
            });
            await toggleScript(id!);
            expect(getScriptById(id!)?.enabled).toBe(false);
            await toggleScript(id!);
            expect(getScriptById(id!)?.enabled).toBe(true);
        });
    });

    describe('getEnabledScripts', () => {
        it('활성화된 스크립트만 반환한다', async () => {
            await addScript({
                name: '활성',
                enabled: true,
                url_patterns: [],
                code: '',
                run_at: 'document_idle',
            });
            await addScript({
                name: '비활성',
                enabled: false,
                url_patterns: [],
                code: '',
                run_at: 'document_idle',
            });
            const enabled = getEnabledScripts();
            expect(enabled).toHaveLength(1);
            expect(enabled[0]!.name).toBe('활성');
        });
    });

    describe('스토리지 실패 시 롤백', () => {
        it('addScript 저장 실패 시 이전 상태로 복원한다', async () => {
            asMock(chrome.storage.local.set).mockRejectedValueOnce(new Error('storage error'));
            const id = await addScript({
                name: '실패할 스크립트',
                enabled: true,
                url_patterns: [],
                code: '',
                run_at: 'document_idle',
            });
            expect(id).toBeNull();
            expect(getScripts()).toHaveLength(0);
        });
    });
});
