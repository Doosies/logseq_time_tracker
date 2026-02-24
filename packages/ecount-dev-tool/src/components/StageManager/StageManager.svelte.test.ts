import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import StageManager from './StageManager.svelte';
import { initializeTabState } from '@/stores/current_tab.svelte';
import { asMock } from '@/test/mock_helpers';

describe('StageManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('stage 전환 버튼이 렌더링되어야 함', async () => {
        asMock(chrome.tabs.query).mockResolvedValue([
            {
                id: 1,
                url: 'https://stageba.ecount.com/ec5/view/erp',
            } as chrome.tabs.Tab,
        ]);

        await initializeTabState();
        render(StageManager);

        expect(screen.getByRole('button', { name: 'stageba2로 전환' })).toBeInTheDocument();
    });

    it('버튼 라벨이 현재 stage에 따라 변경되어야 함', async () => {
        asMock(chrome.tabs.query).mockResolvedValue([
            {
                id: 1,
                url: 'https://stagelxba2.ecount.com/ec5/view/erp',
            } as chrome.tabs.Tab,
        ]);

        await initializeTabState();
        render(StageManager);

        expect(screen.getByRole('button', { name: 'stageba1로 전환' })).toBeInTheDocument();
    });

    it('버튼 클릭 시 updateTabUrl이 호출되어야 함', async () => {
        const user = userEvent.setup();
        asMock(chrome.tabs.query).mockResolvedValue([
            {
                id: 1,
                url: 'https://stageba.ecount.com/ec5/view/erp',
            } as chrome.tabs.Tab,
        ]);

        await initializeTabState();
        render(StageManager);

        await user.click(screen.getByRole('button', { name: 'stageba2로 전환' }));

        expect(chrome.tabs.update).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                url: expect.stringContaining('stagelxba2'),
            }),
        );
        expect(window.close).toHaveBeenCalled();
    });
});
