import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import App from './App.svelte';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is_loading 상태에서 "로딩 중..."이 표시되어야 함', async () => {
    let resolve_tab: (value: chrome.tabs.Tab[]) => void;
    const tab_promise = new Promise<chrome.tabs.Tab[]>((resolve) => {
      resolve_tab = resolve;
    });
    vi.mocked(chrome.tabs.query).mockReturnValue(
      tab_promise as ReturnType<typeof chrome.tabs.query>
    );

    render(App);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();

    resolve_tab!([
      {
        id: 1,
        url: 'https://zeus01ba1.ecount.com/ec5/view/erp',
      } as chrome.tabs.Tab,
    ]);
  });

  it('is_stage일 때 StageManager가 렌더링되어야 함', async () => {
    vi.mocked(chrome.tabs.query).mockResolvedValue([
      {
        id: 1,
        url: 'https://stageba.ecount.com/ec5/view/erp',
      } as chrome.tabs.Tab,
    ]);

    render(App);

    await waitFor(
      () => {
        expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(
      screen.getByRole('button', { name: 'stageba2로 전환' })
    ).toBeInTheDocument();
  });

  it('supported일 때 ServerManager와 ActionBar가 렌더링되어야 함', async () => {
    vi.mocked(chrome.tabs.query).mockResolvedValue([
      {
        id: 1,
        url: 'https://zeus01ba1.ecount.com/ec5/view/erp?__v3domains=ba1',
      } as chrome.tabs.Tab,
    ]);

    render(App);

    await waitFor(
      () => {
        expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(screen.getByText('V5 Server:')).toBeInTheDocument();
    expect(screen.getByText('V3 Server:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5.0 로컬' })).toBeInTheDocument();
  });

  it('QuickLoginSection이 항상 렌더링되어야 함', async () => {
    vi.mocked(chrome.tabs.query).mockResolvedValue([
      {
        id: 1,
        url: 'https://zeus01ba1.ecount.com/ec5/view/erp',
      } as chrome.tabs.Tab,
    ]);

    render(App);

    expect(screen.getByText('Quick Login Setting')).toBeInTheDocument();
  });
});
