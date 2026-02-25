import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import App from '../App.svelte';
import { asMock } from '#test/mock_helpers';
import { initializeVisibility } from '#stores/section_visibility.svelte';
import { initializeSectionOrder } from '#stores/section_order.svelte';

describe('App', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('is_loading 상태에서 "로딩 중..."이 표시되어야 함', async () => {
        let resolve_tab: (value: chrome.tabs.Tab[]) => void;
        const tab_promise = new Promise<chrome.tabs.Tab[]>((resolve) => {
            resolve_tab = resolve;
        });
        asMock(chrome.tabs.query).mockReturnValue(tab_promise);

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
        asMock(chrome.tabs.query).mockResolvedValue([
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
            { timeout: 2000 },
        );

        expect(screen.getByRole('button', { name: 'stageba2로 전환' })).toBeInTheDocument();
    });

    it('supported일 때 ServerManager와 ActionBar가 렌더링되어야 함', async () => {
        asMock(chrome.tabs.query).mockResolvedValue([
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
            { timeout: 2000 },
        );

        expect(screen.getByText('V5')).toBeInTheDocument();
        expect(screen.getByText('V3')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '5.0로컬' })).toBeInTheDocument();
    });

    it('QuickLoginSection이 항상 렌더링되어야 함', async () => {
        asMock(chrome.tabs.query).mockResolvedValue([
            {
                id: 1,
                url: 'https://zeus01ba1.ecount.com/ec5/view/erp',
            } as chrome.tabs.Tab,
        ]);

        render(App);

        await waitFor(
            () => {
                expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
            },
            { timeout: 2000 },
        );

        expect(screen.getByText('빠른 로그인')).toBeInTheDocument();
    });

    describe('섹션 숨기기/보이기', () => {
        beforeEach(async () => {
            asMock(chrome.storage.sync.get).mockImplementation((key: string) => Promise.resolve({ [key]: undefined }));
            await initializeVisibility();
        });

        it('설정 버튼이 렌더링되어야 함', async () => {
            asMock(chrome.tabs.query).mockResolvedValue([
                {
                    id: 1,
                    url: 'https://zeus01ba1.ecount.com/ec5/view/erp?__v3domains=ba1',
                } as chrome.tabs.Tab,
            ]);

            render(App);

            expect(screen.getByRole('button', { name: '섹션 설정' })).toBeInTheDocument();
        });

        it('설정 버튼 클릭 시 패널이 열려야 함', async () => {
            asMock(chrome.tabs.query).mockResolvedValue([
                {
                    id: 1,
                    url: 'https://zeus01ba1.ecount.com/ec5/view/erp?__v3domains=ba1',
                } as chrome.tabs.Tab,
            ]);

            render(App);

            const user = userEvent.setup();
            await user.click(screen.getByRole('button', { name: '섹션 설정' }));

            expect(screen.getByText('섹션 설정')).toBeInTheDocument();
        });

        it('섹션 체크박스를 해제하면 해당 섹션이 숨겨져야 함', async () => {
            asMock(chrome.tabs.query).mockResolvedValue([
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
                { timeout: 2000 },
            );

            expect(screen.getByRole('button', { name: '5.0로컬' })).toBeInTheDocument();

            const user = userEvent.setup();
            await user.click(screen.getByRole('button', { name: '섹션 설정' }));

            const checkboxes = screen.getAllByRole('checkbox');
            const action_bar_checkbox = checkboxes[2] as HTMLElement;
            await user.click(action_bar_checkbox);

            await waitFor(() => {
                expect(screen.queryByRole('button', { name: '5.0로컬' })).not.toBeInTheDocument();
            });
        });

        it('숨긴 섹션 상태가 storage에 저장되어야 함', async () => {
            asMock(chrome.tabs.query).mockResolvedValue([
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
                { timeout: 2000 },
            );

            const user = userEvent.setup();
            await user.click(screen.getByRole('button', { name: '섹션 설정' }));

            const checkboxes = screen.getAllByRole('checkbox');
            await user.click(checkboxes[0] as HTMLElement);

            expect(chrome.storage.sync.set).toHaveBeenCalledWith({
                section_visibility_state: expect.objectContaining({
                    'quick-login': false,
                }),
            });
        });

        it('저장된 숨기기 상태에 따라 섹션이 숨겨진 채로 렌더링되어야 함', async () => {
            asMock(chrome.storage.sync.get).mockImplementation((key: string) => {
                if (key === 'section_visibility_state') {
                    return Promise.resolve({
                        section_visibility_state: {
                            'quick-login': false,
                        },
                    });
                }
                return Promise.resolve({ [key]: undefined });
            });
            await initializeVisibility();

            asMock(chrome.tabs.query).mockResolvedValue([
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
                { timeout: 2000 },
            );

            expect(screen.queryByText('빠른 로그인')).not.toBeInTheDocument();
            expect(screen.getByText('서버 관리')).toBeInTheDocument();
        });

        it('마지막 보이는 섹션은 숨길 수 없어야 함', async () => {
            asMock(chrome.storage.sync.get).mockImplementation((key: string) => {
                if (key === 'section_visibility_state') {
                    return Promise.resolve({
                        section_visibility_state: {
                            'quick-login': false,
                            'server-manager': false,
                        },
                    });
                }
                return Promise.resolve({ [key]: undefined });
            });
            await initializeVisibility();

            asMock(chrome.tabs.query).mockResolvedValue([
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
                { timeout: 2000 },
            );

            const user = userEvent.setup();
            await user.click(screen.getByRole('button', { name: '섹션 설정' }));

            const checkboxes = screen.getAllByRole('checkbox');
            const last_checkbox = checkboxes[2];

            expect(last_checkbox).toBeDisabled();
        });
    });

    describe('섹션 순서 변경', () => {
        const DOCUMENT_POSITION_FOLLOWING = 4;

        beforeEach(async () => {
            asMock(chrome.storage.sync.get).mockImplementation((key: string) =>
                Promise.resolve({ [key]: undefined }),
            );
            await initializeVisibility();
            await initializeSectionOrder();
        });

        it('기본 순서대로 섹션이 렌더링되어야 함', async () => {
            asMock(chrome.tabs.query).mockResolvedValue([
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
                { timeout: 2000 },
            );

            const quick_login = screen.getByText('빠른 로그인');
            const server_manager = screen.getByText('서버 관리');
            const action_bar_title = screen.getByText('빠른 실행');

            expect(
                quick_login.compareDocumentPosition(server_manager) &
                    DOCUMENT_POSITION_FOLLOWING,
            ).toBeTruthy();
            expect(
                server_manager.compareDocumentPosition(action_bar_title) &
                    DOCUMENT_POSITION_FOLLOWING,
            ).toBeTruthy();
        });

        it('저장된 순서에 따라 섹션이 렌더링되어야 함', async () => {
            asMock(chrome.storage.sync.get).mockImplementation((key: string) => {
                if (key === 'section_order_state') {
                    return Promise.resolve({
                        section_order_state: [
                            'action-bar',
                            'quick-login',
                            'server-manager',
                        ],
                    });
                }
                return Promise.resolve({ [key]: undefined });
            });
            await initializeVisibility();
            await initializeSectionOrder();

            asMock(chrome.tabs.query).mockResolvedValue([
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
                { timeout: 2000 },
            );

            const action_bar_title = screen.getByText('빠른 실행');
            const quick_login = screen.getByText('빠른 로그인');
            const server_manager = screen.getByText('서버 관리');

            expect(
                action_bar_title.compareDocumentPosition(quick_login) &
                    DOCUMENT_POSITION_FOLLOWING,
            ).toBeTruthy();
            expect(
                quick_login.compareDocumentPosition(server_manager) &
                    DOCUMENT_POSITION_FOLLOWING,
            ).toBeTruthy();
        });

        it('설정 패널에서 드래그 핸들이 표시되어야 함', async () => {
            asMock(chrome.tabs.query).mockResolvedValue([
                {
                    id: 1,
                    url: 'https://zeus01ba1.ecount.com/ec5/view/erp?__v3domains=ba1',
                } as chrome.tabs.Tab,
            ]);

            render(App);

            expect(screen.getByRole('button', { name: '섹션 설정' })).toBeInTheDocument();

            const user = userEvent.setup();
            await user.click(screen.getByRole('button', { name: '섹션 설정' }));

            const listitem_elements = screen.getAllByRole('listitem', {
                name: /드래그하여 순서 변경/,
            });
            expect(listitem_elements.length).toBe(3);
        });

        it('메인 화면에서 드래그 핸들이 렌더링되어야 함', async () => {
            asMock(chrome.tabs.query).mockResolvedValue([
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
                { timeout: 2000 },
            );

            const drag_handle_buttons = screen.getAllByRole('button', {
                name: '드래그하여 섹션 순서 변경',
            });
            expect(drag_handle_buttons.length).toBe(3);
        });
    });
});
