import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializeTabState, getTabState, isSupported } from '@/stores/current_tab.svelte';

type TabsQueryPromise = (queryInfo: chrome.tabs.QueryInfo) => Promise<chrome.tabs.Tab[]>;

/**
 * 통합 테스트: 스토어 초기화 → 상태 반영 플로우
 * - chrome.tabs.query만 mock, 나머지(parseEcountUrl, 스토어) 실제 코드 사용
 * - .svelte.test.ts 확장자로 Svelte Runes 활성화
 */
describe('스토어 초기화 → 상태 반영 플로우 (통합)', () => {
    const mockTabsQuery = vi.mocked(chrome.tabs.query as TabsQueryPromise);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('ecount EC5 페이지에서 popup 오픈 시 zeus 환경으로 파싱되고 isSupported가 true여야 함', async () => {
        const ec5_tab = {
            id: 1,
            url: 'https://zeus01lxba1.ecount.com/ec5/view/erp?__v3domains=zeus01ba1',
        };
        mockTabsQuery.mockResolvedValue([ec5_tab as chrome.tabs.Tab]);

        await initializeTabState();

        const state = getTabState();
        expect(state.parsed?.environment).toBe('zeus');
        expect(state.is_loading).toBe(false);
        expect(isSupported()).toBe(true);
    });

    it('non-ecount 페이지에서 popup 오픈 시 isSupported가 false여야 함', async () => {
        const non_ecount_tab = {
            id: 2,
            url: 'https://www.google.com/',
        };
        mockTabsQuery.mockResolvedValue([non_ecount_tab as chrome.tabs.Tab]);

        await initializeTabState();

        expect(isSupported()).toBe(false);
    });

    it('stage 페이지에서 popup 오픈 시 is_stage가 true여야 함', async () => {
        const stage_tab = {
            id: 3,
            url: 'https://stageba.ecount.com/ec5/view/erp',
        };
        mockTabsQuery.mockResolvedValue([stage_tab as chrome.tabs.Tab]);
        await initializeTabState();

        const state = getTabState();
        expect(state.is_stage).toBe(true);
        expect(state.parsed?.environment).toBe('stage');
    });
});
