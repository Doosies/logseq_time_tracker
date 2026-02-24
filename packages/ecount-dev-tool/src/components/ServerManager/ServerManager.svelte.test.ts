import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import ServerManager from './ServerManager.svelte';
import { initializeTabState } from '@/stores/current_tab.svelte';

describe('ServerManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('V5/V3 ToggleInput가 존재해야 함', async () => {
    vi.mocked(chrome.tabs.query).mockResolvedValue([
      {
        id: 1,
        url: 'https://zeus01ba1.ecount.com/ec5/view/erp?__v3domains=ba1',
      } as chrome.tabs.Tab,
    ]);

    await initializeTabState();
    render(ServerManager);

    expect(screen.getByText('V5 Server:')).toBeInTheDocument();
    expect(screen.getByText('V3 Server:')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Toggle input mode/i }).length).toBeGreaterThanOrEqual(2);
  });

  it('서버 변경 버튼 클릭 시 updateTabUrl이 호출되어야 함', async () => {
    const user = userEvent.setup();
    vi.mocked(chrome.tabs.query).mockResolvedValue([
      {
        id: 1,
        url: 'https://zeus01ba1.ecount.com/ec5/view/erp?__v3domains=ba1',
      } as chrome.tabs.Tab,
    ]);

    await initializeTabState();
    render(ServerManager);

    const click_button = screen.getByRole('button', { name: 'Click' });
    await user.click(click_button);

    expect(chrome.tabs.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        url: expect.stringContaining('ecount.com'),
      })
    );
    expect(window.close).toHaveBeenCalled();
  });

  it('non-ecount 페이지에서 parsed가 null일 때 버튼 클릭 시 updateTabUrl이 호출되지 않아야 함', async () => {
    const user = userEvent.setup();
    vi.mocked(chrome.tabs.query).mockResolvedValue([
      {
        id: 1,
        url: 'https://www.google.com/',
      } as chrome.tabs.Tab,
    ]);

    await initializeTabState();
    render(ServerManager);

    const click_button = screen.getByRole('button', { name: 'Click' });
    await user.click(click_button);

    expect(chrome.tabs.update).not.toHaveBeenCalled();
  });
});
