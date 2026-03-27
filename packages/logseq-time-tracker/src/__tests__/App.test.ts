/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import type { AppContext, JobHistory, TimeEntry } from '@personal/time-tracker-core';
import App from '../App.svelte';

const { mock_hide_main_ui } = vi.hoisted(() => ({
    mock_hide_main_ui: vi.fn(),
}));

vi.mock('@logseq/libs', () => ({}));

vi.mock('@personal/uikit/design', () => ({
    light_theme: 'mock-light-theme',
}));

vi.mock('@personal/time-tracker-core', async () => {
    const { default: ToolbarOpenFullStub } = await import('./toolbar_open_full_stub.svelte');
    const { default: LayoutSwitcherSnippetStub } = await import('./layout_switcher_snippet_stub.svelte');
    const { default: EmptyCoreStub } = await import('./empty_core_component_stub.svelte');

    return {
        FullView: EmptyCoreStub,
        Toolbar: ToolbarOpenFullStub,
        LayoutSwitcher: LayoutSwitcherSnippetStub,
        ToastContainer: EmptyCoreStub,
        ReasonModal: EmptyCoreStub,
        STRINGS: {
            job: {
                status: {
                    pending: '대기',
                    in_progress: '진행',
                    paused: '일시정지',
                    cancelled: '취소',
                    completed: '완료',
                },
            },
        },
        formatDuration: vi.fn((seconds: number) => `${seconds}s`),
        formatLocalDateTime: vi.fn((iso: string) => iso),
        runAllPocTests: vi.fn().mockResolvedValue([]),
        initializeApp: vi.fn(),
    };
});

const iso = '2025-01-01T00:00:00.000Z';

function make_time_entry(partial: Partial<TimeEntry> & Pick<TimeEntry, 'id' | 'job_id'>): TimeEntry {
    return {
        category_id: 'cat-1',
        started_at: iso,
        ended_at: iso,
        duration_seconds: 60,
        note: '',
        is_manual: false,
        created_at: iso,
        updated_at: iso,
        ...partial,
    };
}

function make_job_history(partial: Partial<JobHistory> & Pick<JobHistory, 'id' | 'job_id' | 'to_status'>): JobHistory {
    return {
        from_status: null,
        reason: '',
        occurred_at: iso,
        created_at: iso,
        ...partial,
    };
}

function createMockContext(overrides?: Partial<AppContext>): AppContext {
    const base = {
        stores: {
            timer_store: {},
            job_store: {
                jobs: [{ id: 'j1', title: 'My Job' }],
                pending_jobs: [],
                paused_jobs: [],
            },
            toast_store: { addToast: vi.fn() },
        },
        services: {
            timer_service: {},
        },
        uow: {
            timeEntryRepo: { getTimeEntries: vi.fn().mockResolvedValue([]) },
            historyRepo: { getJobHistoryByPeriod: vi.fn().mockResolvedValue([]) },
        },
        logger: {},
        storage_manager: undefined,
        dispose: vi.fn(),
    } as unknown as AppContext;
    if (!overrides) {
        return base;
    }
    return { ...base, ...overrides } as AppContext;
}

async function flush_component_updates(): Promise<void> {
    await tick();
    await Promise.resolve();
    await tick();
}

describe('App.svelte', () => {
    let container: HTMLDivElement;
    let mock_ctx: AppContext;
    let component: ReturnType<typeof mount> | undefined;

    beforeEach(() => {
        vi.stubGlobal('logseq', {
            ready: vi.fn(),
            hideMainUI: mock_hide_main_ui,
            toggleMainUI: vi.fn(),
        } as unknown as typeof globalThis.logseq);
        container = document.createElement('div');
        document.body.appendChild(container);
        mock_ctx = createMockContext();
        mock_hide_main_ui.mockClear();
    });

    afterEach(() => {
        if (component !== undefined) {
            unmount(component);
            component = undefined;
        }
        container.remove();
        vi.unstubAllGlobals();
    });

    it('UC-APP-001: 기본 렌더링: Toolbar 모드에서 dropdown-shell이 표시된다', async () => {
        component = mount(App, { target: container, props: { ctx: mock_ctx } });
        await flush_component_updates();
        expect(container.querySelector('.dropdown-shell')).not.toBeNull();
    });

    it('UC-APP-002: 전체 화면 전환 시 FullView 패널이 표시된다', async () => {
        component = mount(App, { target: container, props: { ctx: mock_ctx } });
        await flush_component_updates();
        const open_btn = container.querySelector('.toolbar-open-fullview-stub');
        expect(open_btn).not.toBeNull();
        open_btn!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await flush_component_updates();
        expect(container.querySelector('.panel.panel--fullview')).not.toBeNull();
    });

    it('UC-APP-003: "작은 화면" 버튼 클릭 시 Toolbar로 복귀한다', async () => {
        component = mount(App, { target: container, props: { ctx: mock_ctx } });
        await flush_component_updates();
        container
            .querySelector('.toolbar-open-fullview-stub')!
            .dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await flush_component_updates();
        const back_btn = container.querySelector('.back-btn');
        expect(back_btn).not.toBeNull();
        back_btn!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await flush_component_updates();
        expect(container.querySelector('.dropdown-shell')).not.toBeNull();
        expect(container.querySelector('.panel.panel--fullview')).toBeNull();
    });

    it('UC-APP-004: 닫기 버튼 클릭 시 logseq.hideMainUI가 호출된다', async () => {
        component = mount(App, { target: container, props: { ctx: mock_ctx } });
        await flush_component_updates();
        const close_hit = container.querySelector('.dropdown-backdrop-hit');
        expect(close_hit).not.toBeNull();
        close_hit!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await flush_component_updates();
        expect(mock_hide_main_ui).toHaveBeenCalled();
    });

    it('UC-APP-005: ESC 키 입력 시 logseq.hideMainUI가 호출된다', async () => {
        component = mount(App, { target: container, props: { ctx: mock_ctx } });
        await flush_component_updates();
        mock_hide_main_ui.mockClear();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await flush_component_updates();
        expect(mock_hide_main_ui).toHaveBeenCalled();
    });

    it('UC-APP-006: 디버그 모달 열기 시 "시간 기록 (Debug)" 타이틀이 표시된다', async () => {
        component = mount(App, { target: container, props: { ctx: mock_ctx } });
        await flush_component_updates();
        container
            .querySelector('.toolbar-open-fullview-stub')!
            .dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await flush_component_updates();
        const debug_btn = container.querySelector('.debug-btn');
        expect(debug_btn).not.toBeNull();
        debug_btn!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await flush_component_updates();
        expect(container.querySelector('.debug-title')?.textContent).toContain('시간 기록 (Debug)');
    });

    it('UC-APP-007: 디버그 모달 닫기 버튼 클릭 시 모달이 사라진다', async () => {
        component = mount(App, { target: container, props: { ctx: mock_ctx } });
        await flush_component_updates();
        container
            .querySelector('.toolbar-open-fullview-stub')!
            .dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await flush_component_updates();
        container.querySelector('.debug-btn')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await flush_component_updates();
        expect(container.querySelector('.debug-overlay')).not.toBeNull();
        container.querySelector('.debug-close')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await flush_component_updates();
        expect(container.querySelector('.debug-overlay')).toBeNull();
    });

    it('UC-APP-008: 빈 entries 상태에서 "기록이 없습니다." 메시지가 표시된다', async () => {
        component = mount(App, { target: container, props: { ctx: mock_ctx } });
        await flush_component_updates();
        container
            .querySelector('.toolbar-open-fullview-stub')!
            .dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await flush_component_updates();
        container.querySelector('.debug-btn')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await flush_component_updates();
        expect(container.querySelector('.debug-empty')?.textContent).toContain('기록이 없습니다.');
    });

    it('UC-APP-009: getJobTitle: jobs에 존재하는 ID는 title 반환, 미존재 ID는 ID 그대로 반환', async () => {
        const get_time_entries = vi.fn().mockResolvedValue([
            make_time_entry({
                id: 'e-old',
                job_id: 'j1',
                started_at: '2025-01-01T00:00:00.000Z',
            }),
            make_time_entry({
                id: 'e-new',
                job_id: 'orphan-job',
                started_at: '2025-01-02T00:00:00.000Z',
            }),
        ]);
        mock_ctx = createMockContext({
            uow: {
                timeEntryRepo: { getTimeEntries: get_time_entries },
                historyRepo: { getJobHistoryByPeriod: vi.fn().mockResolvedValue([]) },
            } as unknown as AppContext['uow'],
        });
        component = mount(App, { target: container, props: { ctx: mock_ctx } });
        await flush_component_updates();
        container
            .querySelector('.toolbar-open-fullview-stub')!
            .dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await flush_component_updates();
        container.querySelector('.debug-btn')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await flush_component_updates();
        const table = container.querySelector('.debug-table tbody');
        expect(table?.textContent).toContain('orphan-job');
        expect(table?.textContent).toContain('My Job');
    });

    it("UC-APP-010: getStatusLabel: null은 '-', 유효 상태는 STRINGS 라벨 반환", async () => {
        const get_history = vi.fn().mockResolvedValue([
            make_job_history({
                id: 'h1',
                job_id: 'j1',
                from_status: null,
                to_status: 'in_progress',
            }),
        ]);
        mock_ctx = createMockContext({
            uow: {
                timeEntryRepo: {
                    getTimeEntries: vi.fn().mockResolvedValue([make_time_entry({ id: 'e1', job_id: 'j1' })]),
                },
                historyRepo: { getJobHistoryByPeriod: get_history },
            } as unknown as AppContext['uow'],
        });
        component = mount(App, { target: container, props: { ctx: mock_ctx } });
        await flush_component_updates();
        container
            .querySelector('.toolbar-open-fullview-stub')!
            .dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await flush_component_updates();
        container.querySelector('.debug-btn')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await flush_component_updates();
        const debug_body = container.querySelector('.debug-body');
        expect(debug_body?.textContent).toContain('- → 진행');
    });
});
