import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializeVisibility, isSectionVisible, toggleVisibility } from '#stores/section_visibility.svelte';
import { asMock } from '#test/mock_helpers';

const ALL_IDS = ['quick-login', 'server-manager', 'action-bar'];

describe('section_visibility 스토어', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('initializeVisibility', () => {
        it('저장된 데이터가 없으면 모든 섹션이 보이는 상태여야 함', async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                section_visibility_state: undefined,
            });

            await initializeVisibility();

            expect(isSectionVisible('quick-login')).toBe(true);
            expect(isSectionVisible('server-manager')).toBe(true);
            expect(isSectionVisible('action-bar')).toBe(true);
        });

        it('저장된 데이터가 있으면 해당 상태를 복원해야 함', async () => {
            const stored = {
                'quick-login': false,
                'server-manager': true,
                'action-bar': false,
            };
            asMock(chrome.storage.sync.get).mockResolvedValue({
                section_visibility_state: stored,
            });

            await initializeVisibility();

            expect(isSectionVisible('quick-login')).toBe(false);
            expect(isSectionVisible('server-manager')).toBe(true);
            expect(isSectionVisible('action-bar')).toBe(false);
        });

        it('잘못된 데이터가 저장되어 있으면 기본 상태를 사용해야 함', async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                section_visibility_state: 'invalid',
            });

            await initializeVisibility();

            expect(isSectionVisible('quick-login')).toBe(true);
        });

        it('storage 접근 실패 시 기본 상태를 사용해야 함', async () => {
            asMock(chrome.storage.sync.get).mockRejectedValue(new Error('Storage error'));

            await initializeVisibility();

            expect(isSectionVisible('quick-login')).toBe(true);
        });
    });

    describe('toggleVisibility', () => {
        beforeEach(async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                section_visibility_state: undefined,
            });
            await initializeVisibility();
        });

        it('보이는 섹션을 숨길 수 있어야 함', async () => {
            expect(isSectionVisible('quick-login')).toBe(true);

            const result = await toggleVisibility('quick-login', ALL_IDS);

            expect(result).toBe(true);
            expect(isSectionVisible('quick-login')).toBe(false);
        });

        it('숨긴 섹션을 다시 보이게 할 수 있어야 함', async () => {
            await toggleVisibility('quick-login', ALL_IDS);
            expect(isSectionVisible('quick-login')).toBe(false);

            const result = await toggleVisibility('quick-login', ALL_IDS);

            expect(result).toBe(true);
            expect(isSectionVisible('quick-login')).toBe(true);
        });

        it('토글 시 storage에 저장되어야 함', async () => {
            await toggleVisibility('quick-login', ALL_IDS);

            expect(chrome.storage.sync.set).toHaveBeenCalledWith({
                section_visibility_state: { 'quick-login': false },
            });
        });

        it('다른 섹션의 상태에 영향을 주지 않아야 함', async () => {
            await toggleVisibility('quick-login', ALL_IDS);

            expect(isSectionVisible('quick-login')).toBe(false);
            expect(isSectionVisible('server-manager')).toBe(true);
            expect(isSectionVisible('action-bar')).toBe(true);
        });

        it('마지막 하나의 섹션은 숨길 수 없어야 함', async () => {
            await toggleVisibility('quick-login', ALL_IDS);
            await toggleVisibility('server-manager', ALL_IDS);

            const result = await toggleVisibility('action-bar', ALL_IDS);

            expect(result).toBe(false);
            expect(isSectionVisible('action-bar')).toBe(true);
        });

        it('storage 저장 실패 시 이전 상태로 롤백해야 함', async () => {
            expect(isSectionVisible('quick-login')).toBe(true);

            asMock(chrome.storage.sync.set).mockRejectedValueOnce(new Error('Storage error'));

            const result = await toggleVisibility('quick-login', ALL_IDS);

            expect(result).toBe(false);
            expect(isSectionVisible('quick-login')).toBe(true);
        });
    });

    describe('isSectionVisible', () => {
        it('존재하지 않는 섹션 ID는 true를 반환해야 함', async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                section_visibility_state: { 'quick-login': false },
            });

            await initializeVisibility();

            expect(isSectionVisible('non-existent')).toBe(true);
        });
    });
});
