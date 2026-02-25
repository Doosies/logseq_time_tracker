import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    initializeSectionState,
    getSectionCollapsed,
    toggleSection,
} from '#stores/section_collapse.svelte';
import { asMock } from '#test/mock_helpers';

describe('section_collapse 스토어', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('initializeSectionState', () => {
        it('저장된 데이터가 없으면 모든 섹션이 펼쳐진 상태여야 함', async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                section_collapse_state: undefined,
            });

            await initializeSectionState();

            expect(getSectionCollapsed('quick-login')).toBe(false);
            expect(getSectionCollapsed('server-manager')).toBe(false);
            expect(getSectionCollapsed('action-bar')).toBe(false);
        });

        it('저장된 데이터가 있으면 해당 상태를 복원해야 함', async () => {
            const stored = {
                'quick-login': true,
                'server-manager': false,
                'action-bar': true,
            };
            asMock(chrome.storage.sync.get).mockResolvedValue({
                section_collapse_state: stored,
            });

            await initializeSectionState();

            expect(getSectionCollapsed('quick-login')).toBe(true);
            expect(getSectionCollapsed('server-manager')).toBe(false);
            expect(getSectionCollapsed('action-bar')).toBe(true);
        });

        it('잘못된 데이터가 저장되어 있으면 기본 상태를 사용해야 함', async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                section_collapse_state: 'invalid',
            });

            await initializeSectionState();

            expect(getSectionCollapsed('quick-login')).toBe(false);
        });

        it('storage 접근 실패 시 기본 상태를 사용해야 함', async () => {
            asMock(chrome.storage.sync.get).mockRejectedValue(
                new Error('Storage error'),
            );

            await initializeSectionState();

            expect(getSectionCollapsed('quick-login')).toBe(false);
        });
    });

    describe('toggleSection', () => {
        beforeEach(async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                section_collapse_state: undefined,
            });
            await initializeSectionState();
        });

        it('펼쳐진 섹션을 접을 수 있어야 함', async () => {
            expect(getSectionCollapsed('quick-login')).toBe(false);

            const result = await toggleSection('quick-login');

            expect(result).toBe(true);
            expect(getSectionCollapsed('quick-login')).toBe(true);
        });

        it('접힌 섹션을 펼칠 수 있어야 함', async () => {
            await toggleSection('quick-login');
            expect(getSectionCollapsed('quick-login')).toBe(true);

            const result = await toggleSection('quick-login');

            expect(result).toBe(true);
            expect(getSectionCollapsed('quick-login')).toBe(false);
        });

        it('토글 시 storage에 저장되어야 함', async () => {
            await toggleSection('quick-login');

            expect(chrome.storage.sync.set).toHaveBeenCalledWith({
                section_collapse_state: { 'quick-login': true },
            });
        });

        it('다른 섹션의 상태에 영향을 주지 않아야 함', async () => {
            await toggleSection('quick-login');

            expect(getSectionCollapsed('quick-login')).toBe(true);
            expect(getSectionCollapsed('server-manager')).toBe(false);
            expect(getSectionCollapsed('action-bar')).toBe(false);
        });

        it('storage 저장 실패 시 이전 상태로 롤백해야 함', async () => {
            expect(getSectionCollapsed('quick-login')).toBe(false);

            asMock(chrome.storage.sync.set).mockRejectedValueOnce(
                new Error('Storage error'),
            );

            const result = await toggleSection('quick-login');

            expect(result).toBe(false);
            expect(getSectionCollapsed('quick-login')).toBe(false);
        });

        it('초기화 전에는 토글이 동작하지 않아야 함', async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                section_collapse_state: undefined,
            });

            const { toggleSection: freshToggle } = await import(
                '#stores/section_collapse.svelte'
            );

            const result = await freshToggle('quick-login');
            expect(result).toBe(true);
        });
    });

    describe('getSectionCollapsed', () => {
        it('존재하지 않는 섹션 ID는 false를 반환해야 함', async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                section_collapse_state: { 'quick-login': true },
            });

            await initializeSectionState();

            expect(getSectionCollapsed('non-existent')).toBe(false);
        });
    });
});
