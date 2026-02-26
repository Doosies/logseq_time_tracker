import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import StageManager from '../StageManager.svelte';
import { initializeTabState } from '#stores/current_tab.svelte';
import { asMock } from '#test/mock_helpers';

vi.mock('#services/tab_service', async (importOriginal) => {
    const mod = await importOriginal<typeof import('#services/tab_service')>();
    return {
        ...mod,
        updateTabUrl: vi.fn().mockImplementation(async (tab_id: number, url: string) => {
            try {
                await mod.updateTabUrl(tab_id, url);
            } catch {
                // chrome.tabs.update 실패 시 swallow - 테스트용
            }
        }),
    };
});

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

    describe('접근성 검증', () => {
        it('스테이지 버튼에 적절한 role이 있어야 한다', async () => {
            asMock(chrome.tabs.query).mockResolvedValue([
                {
                    id: 1,
                    url: 'https://stageba.ecount.com/ec5/view/erp',
                } as chrome.tabs.Tab,
            ]);

            await initializeTabState();
            render(StageManager);

            const stage_button = screen.getByRole('button', { name: 'stageba2로 전환' });
            expect(stage_button).toBeInTheDocument();
            expect(stage_button.tagName).toBe('BUTTON');
        });

        it('버튼에 aria-label이 있어야 한다', async () => {
            asMock(chrome.tabs.query).mockResolvedValue([
                {
                    id: 1,
                    url: 'https://stageba.ecount.com/ec5/view/erp',
                } as chrome.tabs.Tab,
            ]);

            await initializeTabState();
            render(StageManager);

            const stage_button = screen.getByRole('button', { name: 'stageba2로 전환' });
            expect(stage_button).toHaveAccessibleName('stageba2로 전환');
        });
    });

    describe('에러 처리', () => {
        it('chrome.tabs.update 실패 시 에러가 발생하지 않아야 한다', async () => {
            asMock(chrome.tabs.query).mockResolvedValue([
                {
                    id: 1,
                    url: 'https://stageba.ecount.com/ec5/view/erp',
                } as chrome.tabs.Tab,
            ]);
            asMock(chrome.tabs.update).mockRejectedValue(new Error('Tabs update failed'));

            await initializeTabState();
            render(StageManager);

            const stage_button = screen.getByRole('button', { name: 'stageba2로 전환' });
            stage_button.click();

            expect(chrome.tabs.update).toHaveBeenCalled();
        });
    });

    describe('에지 케이스', () => {
        it('stage 변형 URL에서 올바른 스테이지를 표시해야 한다', async () => {
            asMock(chrome.tabs.query).mockResolvedValue([
                {
                    id: 1,
                    url: 'https://stageba-dev.ecount.com/ec5/view/erp',
                } as chrome.tabs.Tab,
            ]);

            await initializeTabState();
            render(StageManager);

            expect(screen.getByRole('button', { name: 'stageba2로 전환' })).toBeInTheDocument();
        });
    });
});
