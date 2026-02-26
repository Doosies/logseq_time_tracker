import { describe, it, expect, beforeEach } from 'vitest';
import {
    DEFAULT_ORDER,
    getSectionOrder,
    initializeSectionOrder,
    setSectionOrder,
} from '#stores/section_order.svelte';
import { initializeVisibility, isSectionVisible, toggleVisibility } from '#stores/section_visibility.svelte';
import { asMock } from '#test/mock_helpers';

interface DndSectionItem {
    id: string;
    section_type: string;
}

/**
 * App.svelte handleFinalize 콜백의 핵심 로직을 재현:
 * 1. DnD로 재정렬된 visible 아이템 순서 추출
 * 2. hidden 섹션을 뒤에 이어붙임
 * 3. setSectionOrder 호출
 */
async function simulateFinalize(
    reordered_items: DndSectionItem[],
    section_order: string[],
): Promise<boolean> {
    const new_visible_order = reordered_items.map((s) => s.id);
    const hidden_sections = section_order.filter((id) => !isSectionVisible(id));
    return setSectionOrder([...new_visible_order, ...hidden_sections]);
}

describe('DnD 콜백 로직 (handleFinalize)', () => {
    beforeEach(async () => {
        asMock(chrome.storage.sync.get).mockImplementation((key: string) =>
            Promise.resolve({ [key]: undefined }),
        );
        asMock(chrome.storage.sync.set).mockResolvedValue(undefined);
        await initializeVisibility();
        await initializeSectionOrder();
    });

    it('모든 섹션이 visible일 때 재정렬 결과가 그대로 저장되어야 함', async () => {
        const reordered: DndSectionItem[] = [
            { id: 'action-bar', section_type: 'action-bar' },
            { id: 'quick-login', section_type: 'quick-login' },
            { id: 'server-manager', section_type: 'server-manager' },
        ];

        const result = await simulateFinalize(reordered, getSectionOrder());

        expect(result).toBe(true);
        expect(getSectionOrder()).toEqual(['action-bar', 'quick-login', 'server-manager']);
    });

    it('hidden 섹션이 있을 때 visible 재정렬 + hidden 순서 유지해야 함', async () => {
        await toggleVisibility('server-manager', [...DEFAULT_ORDER]);

        const section_order = getSectionOrder();
        const reordered: DndSectionItem[] = [
            { id: 'action-bar', section_type: 'action-bar' },
            { id: 'quick-login', section_type: 'quick-login' },
        ];

        const result = await simulateFinalize(reordered, section_order);

        expect(result).toBe(true);
        const final_order = getSectionOrder();
        expect(final_order).toEqual(['action-bar', 'quick-login', 'server-manager']);
        expect(isSectionVisible('server-manager')).toBe(false);
    });

    it('여러 섹션이 hidden일 때 visible만 재정렬되어야 함', async () => {
        await toggleVisibility('server-manager', [...DEFAULT_ORDER]);
        await toggleVisibility('action-bar', [...DEFAULT_ORDER]);

        const section_order = getSectionOrder();
        const reordered: DndSectionItem[] = [
            { id: 'quick-login', section_type: 'quick-login' },
        ];

        const result = await simulateFinalize(reordered, section_order);

        expect(result).toBe(true);
        expect(getSectionOrder()).toEqual(['quick-login', 'server-manager', 'action-bar']);
    });

    it('storage 저장 실패 시 이전 순서로 롤백해야 함', async () => {
        const original_order = [...getSectionOrder()];

        asMock(chrome.storage.sync.set).mockRejectedValueOnce(new Error('Storage error'));

        const reordered: DndSectionItem[] = [
            { id: 'action-bar', section_type: 'action-bar' },
            { id: 'quick-login', section_type: 'quick-login' },
            { id: 'server-manager', section_type: 'server-manager' },
        ];

        const result = await simulateFinalize(reordered, original_order);

        expect(result).toBe(false);
        expect(getSectionOrder()).toEqual(original_order);
    });

    it('재정렬 후 storage에 올바른 순서가 저장되어야 함', async () => {
        const reordered: DndSectionItem[] = [
            { id: 'server-manager', section_type: 'server-manager' },
            { id: 'action-bar', section_type: 'action-bar' },
            { id: 'quick-login', section_type: 'quick-login' },
        ];

        await simulateFinalize(reordered, getSectionOrder());

        expect(chrome.storage.sync.set).toHaveBeenCalledWith({
            section_order_state: ['server-manager', 'action-bar', 'quick-login'],
        });
    });
});
