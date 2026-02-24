import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import QuickLoginSection from './QuickLoginSection.svelte';
import { initializeTabState } from '@/stores/current_tab.svelte';

describe('QuickLoginSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(chrome.tabs.query).mockResolvedValue([
      {
        id: 1,
        url: 'https://zeus01ba1.ecount.com/ec5/view/erp',
      } as chrome.tabs.Tab,
    ]);
  });

  it('계정 목록 기반 버튼이 렌더링되어야 함', async () => {
    await initializeTabState();
    render(QuickLoginSection);

    expect(
      screen.getByRole('button', { name: /company1 \/ user1/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /company2 \/ user2/ })
    ).toBeInTheDocument();
  });

  it('버튼 클릭 시 executeScript가 호출되어야 함', async () => {
    const user = userEvent.setup();
    await initializeTabState();
    render(QuickLoginSection);

    await user.click(
      screen.getByRole('button', { name: /company1 \/ user1/ })
    );

    expect(chrome.scripting.executeScript).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { tabId: 1 },
        args: ['company1§user1', 'pw1'],
      })
    );
  });
});
