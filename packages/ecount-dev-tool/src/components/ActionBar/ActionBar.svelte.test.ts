import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import ActionBar from './ActionBar.svelte';

describe('ActionBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(chrome.tabs.query).mockResolvedValue([
      {
        id: 1,
        url: 'https://zeus01ba1.ecount.com/ec5/view/erp',
      } as chrome.tabs.Tab,
    ]);
  });

  it('3개 버튼이 렌더링되어야 함 (5.0 로컬, 3.0 로컬, disableMin)', () => {
    render(ActionBar);

    expect(screen.getByRole('button', { name: '5.0 로컬' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3.0 로컬' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'disableMin 활성화 (devMode)' })
    ).toBeInTheDocument();
  });

  it('5.0 로컬 버튼 클릭 시 executeScript와 window.close가 호출되어야 함', async () => {
    const user = userEvent.setup();
    render(ActionBar);

    await user.click(screen.getByRole('button', { name: '5.0 로컬' }));

    expect(chrome.scripting.executeScript).toHaveBeenCalled();
    expect(window.close).toHaveBeenCalled();
  });

  it('3.0 로컬 버튼 클릭 시 executeScript와 window.close가 호출되어야 함', async () => {
    const user = userEvent.setup();
    render(ActionBar);

    await user.click(screen.getByRole('button', { name: '3.0 로컬' }));

    expect(chrome.scripting.executeScript).toHaveBeenCalled();
    expect(window.close).toHaveBeenCalled();
  });

  it('disableMin 버튼 클릭 시 page_info가 null이면 alert를 표시해야 함', async () => {
    const user = userEvent.setup();
    const alert_mock = vi.fn();
    vi.stubGlobal('alert', alert_mock);
    vi.mocked(chrome.scripting.executeScript).mockResolvedValue([
      { result: null },
    ] as unknown as chrome.scripting.InjectionResult[]);

    render(ActionBar);

    await user.click(
      screen.getByRole('button', { name: 'disableMin 활성화 (devMode)' })
    );

    expect(alert_mock).toHaveBeenCalledWith(
      '페이지에서 정보를 가져오는데 실패했습니다.'
    );
  });

  it('disableMin 버튼 클릭 시 page_info가 있으면 updateTabUrl이 호출되어야 함', async () => {
    const user = userEvent.setup();
    vi.mocked(chrome.scripting.executeScript).mockResolvedValue([
      {
        result: {
          hasSetDevMode: true,
          hasECountApp: true,
          hasGetContext: true,
          hasConfig: true,
          zoneNum: 'BA1',
          error: null,
        },
      },
    ] as unknown as chrome.scripting.InjectionResult[]);

    render(ActionBar);

    await user.click(
      screen.getByRole('button', { name: 'disableMin 활성화 (devMode)' })
    );

    expect(chrome.scripting.executeScript).toHaveBeenCalledWith(
      expect.objectContaining({
        world: 'MAIN',
      })
    );
    expect(chrome.tabs.update).toHaveBeenCalled();
  });
});
