import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  initializeTabState,
  getTabState,
  isSupported,
} from '@/stores/current_tab.svelte';

vi.mock('@/services/tab_service', () => ({
  getCurrentTab: vi.fn(),
}));

vi.mock('@/services/url_service', () => ({
  parseEcountUrl: vi.fn(),
}));

import { getCurrentTab } from '@/services/tab_service';
import { parseEcountUrl } from '@/services/url_service';

describe('current_tab 스토어', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initializeTabState', () => {
    it('탭 정보 로드 후 상태가 업데이트되어야 함', async () => {
      const mock_tab = {
        id: 1,
        url: 'https://zeus01ba1.ecount.com/ec5/view/erp',
      };
      const mock_parsed = {
        environment: 'zeus' as const,
        page_type: 'ec5' as const,
        current_server: 'zeus01',
        v5_domain: 'lxba1',
        v3_domain: 'ba1',
        zeus_number: '01',
        url: new URL(mock_tab.url),
      };

      vi.mocked(getCurrentTab).mockResolvedValue(mock_tab as chrome.tabs.Tab);
      vi.mocked(parseEcountUrl).mockReturnValue(mock_parsed);

      await initializeTabState();

      const state = getTabState();
      expect(state.url).toBe(mock_tab.url);
      expect(state.tab_id).toBe(mock_tab.id);
      expect(state.parsed).toEqual(mock_parsed);
      expect(state.is_loading).toBe(false);
    });

    it('탭이 없을 때 is_loading만 false로 설정되어야 함', async () => {
      vi.mocked(getCurrentTab).mockResolvedValue(null);

      await initializeTabState();

      const state = getTabState();
      expect(state.is_loading).toBe(false);
    });

    it('에러 발생 시 is_loading이 false로 설정되어야 함', async () => {
      vi.mocked(getCurrentTab).mockRejectedValue(new Error('Permission denied'));

      await initializeTabState();

      const state = getTabState();
      expect(state.is_loading).toBe(false);
    });
  });

  describe('getTabState', () => {
    it('올바른 상태 객체를 반환해야 함', async () => {
      const mock_tab = {
        id: 2,
        url: 'https://stage.ecount.com/',
      };
      const mock_parsed = {
        environment: 'stage' as const,
        page_type: 'stage' as const,
        current_server: 'stage',
        v5_domain: '',
        v3_domain: '',
        zeus_number: '',
        url: new URL(mock_tab.url),
      };

      vi.mocked(getCurrentTab).mockResolvedValue(mock_tab as chrome.tabs.Tab);
      vi.mocked(parseEcountUrl).mockReturnValue(mock_parsed);

      await initializeTabState();
      const state = getTabState();

      expect(state).toMatchObject({
        url: mock_tab.url,
        tab_id: mock_tab.id,
        is_stage: true,
        is_loading: false,
      });
      expect(state.parsed).toEqual(mock_parsed);
    });
  });

  describe('isSupported', () => {
    it('unknown 환경에서 false를 반환해야 함', async () => {
      const mock_tab = {
        id: 3,
        url: 'https://example.com/',
      };
      const mock_parsed = {
        environment: 'unknown' as const,
        page_type: 'unknown' as const,
        current_server: '=====',
        v5_domain: '=====',
        v3_domain: '=====',
        zeus_number: '',
        url: new URL(mock_tab.url),
      };

      vi.mocked(getCurrentTab).mockResolvedValue(mock_tab as chrome.tabs.Tab);
      vi.mocked(parseEcountUrl).mockReturnValue(mock_parsed);

      await initializeTabState();

      expect(isSupported()).toBe(false);
    });

    it('zeus 환경에서 true를 반환해야 함', async () => {
      const mock_tab = {
        id: 4,
        url: 'https://zeus01ba1.ecount.com/ec5/view/erp',
      };
      const mock_parsed = {
        environment: 'zeus' as const,
        page_type: 'ec5' as const,
        current_server: 'zeus01',
        v5_domain: 'lxba1',
        v3_domain: 'ba1',
        zeus_number: '01',
        url: new URL(mock_tab.url),
      };

      vi.mocked(getCurrentTab).mockResolvedValue(mock_tab as chrome.tabs.Tab);
      vi.mocked(parseEcountUrl).mockReturnValue(mock_parsed);

      await initializeTabState();

      expect(isSupported()).toBe(true);
    });
  });
});
