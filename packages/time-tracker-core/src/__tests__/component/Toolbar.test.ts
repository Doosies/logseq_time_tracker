import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Toolbar from '../../components/Toolbar/Toolbar.svelte';
import * as toolbar_css from '../../components/Toolbar/toolbar.css';
import { createTimerStore } from '../../stores/timer_store.svelte';
import { createJobStore } from '../../stores/job_store.svelte';
import type { AppContext } from '../../app/context';
import type { Job } from '../../types/job';
import type { Category } from '../../types/category';

const ts = '2025-01-01T00:00:00.000Z';

function make_job(partial: Partial<Job> & Pick<Job, 'id' | 'title'>): Job {
    return {
        description: '',
        status: 'pending',
        custom_fields: '{}',
        created_at: ts,
        updated_at: ts,
        ...partial,
    };
}

function make_category(partial: Partial<Category> & Pick<Category, 'id' | 'name' | 'parent_id'>): Category {
    return {
        sort_order: 0,
        is_active: true,
        created_at: ts,
        updated_at: ts,
        ...partial,
    };
}

function build_app_context(
    timer_store: ReturnType<typeof createTimerStore>,
    job_store: ReturnType<typeof createJobStore>,
) {
    const mock_cat = make_category({ id: 'cat-1', name: '기본', parent_id: null });
    return {
        stores: {
            timer_store,
            job_store,
            toast_store: { addToast: vi.fn() },
        },
        services: {
            timer_service: {
                start: vi.fn().mockResolvedValue(undefined),
                pause: vi.fn().mockResolvedValue(undefined),
                resume: vi.fn().mockResolvedValue(undefined),
                stop: vi.fn().mockResolvedValue(undefined),
            },
            job_service: {
                getJobs: vi.fn().mockResolvedValue([]),
                transitionStatus: vi.fn().mockResolvedValue(undefined),
            },
            job_category_service: { getJobCategories: vi.fn().mockResolvedValue([]) },
            category_service: { getCategories: vi.fn().mockResolvedValue([mock_cat]) },
        },
    } as unknown as AppContext;
}

describe('Toolbar', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('UC-UI-019: pending 잡이 있고 활성 타이머가 없을 때 시작·완료·취소 버튼이 DOM에 존재한다', () => {
        const timer_store = createTimerStore();
        const job_store = createJobStore();
        job_store.setJobs([make_job({ id: 'job-p1', title: '대기 작업' })]);
        const mock_context = build_app_context(timer_store, job_store);

        const { getByRole } = render(Toolbar, {
            props: { context: mock_context, inline: true },
        });

        expect(getByRole('button', { name: '시작' })).toBeTruthy();
        expect(getByRole('button', { name: '완료' })).toBeTruthy();
        expect(getByRole('button', { name: '취소' })).toBeTruthy();
    });

    it('UC-UI-020: 활성 타이머에서 일시정지 클릭 시 일시정지 사유 dialog가 보인다', async () => {
        const user = userEvent.setup();
        const timer_store = createTimerStore();
        const job_store = createJobStore();
        const mock_job = make_job({ id: 'job-run', title: '진행 작업', status: 'in_progress' });
        const mock_cat = make_category({ id: 'cat-1', name: '기본', parent_id: null });
        job_store.setJobs([mock_job]);
        timer_store.startTimer(mock_job, mock_cat);
        const mock_context = build_app_context(timer_store, job_store);

        const { getByRole } = render(Toolbar, {
            props: { context: mock_context, inline: true },
        });

        await user.click(getByRole('button', { name: '일시정지' }));
        expect(getByRole('dialog', { name: '일시정지 사유' })).toBeVisible();
    });

    it('UC-UI-020: 활성 타이머에서 완료 클릭 시 완료 사유 dialog가 보인다', async () => {
        const user = userEvent.setup();
        const timer_store = createTimerStore();
        const job_store = createJobStore();
        const mock_job = make_job({ id: 'job-run2', title: '진행 작업 2', status: 'in_progress' });
        const mock_cat = make_category({ id: 'cat-1', name: '기본', parent_id: null });
        job_store.setJobs([mock_job]);
        timer_store.startTimer(mock_job, mock_cat);
        const mock_context = build_app_context(timer_store, job_store);

        const { getByRole } = render(Toolbar, {
            props: { context: mock_context, inline: true },
        });

        await user.click(getByRole('button', { name: '완료' }));
        expect(getByRole('dialog', { name: '완료 사유' })).toBeVisible();
    });

    it('UC-UI-024: on_reason_modal_change 콜백이 있을 때 일시정지 클릭 시 콜백이 호출된다', async () => {
        const user = userEvent.setup();
        const timer_store = createTimerStore();
        const job_store = createJobStore();
        const mock_job = make_job({ id: 'job-cb-pause', title: '콜백 일시정지', status: 'in_progress' });
        const mock_cat = make_category({ id: 'cat-1', name: '기본', parent_id: null });
        job_store.setJobs([mock_job]);
        timer_store.startTimer(mock_job, mock_cat);
        const mock_context = build_app_context(timer_store, job_store);
        const on_reason_modal_change = vi.fn();

        const { getByRole, queryByRole } = render(Toolbar, {
            props: { context: mock_context, inline: true, on_reason_modal_change },
        });

        await user.click(getByRole('button', { name: '일시정지' }));

        expect(on_reason_modal_change).toHaveBeenCalled();
        const lift_config = on_reason_modal_change.mock.calls[0]![0]!;
        expect(lift_config).toMatchObject({ title: '일시정지 사유' });
        expect(typeof lift_config.onconfirm).toBe('function');
        expect(typeof lift_config.oncancel).toBe('function');
        expect(queryByRole('dialog')).toBeNull();
    });

    it('UC-UI-024: on_reason_modal_change 콜백이 있을 때 완료 클릭 시 콜백이 호출된다', async () => {
        const user = userEvent.setup();
        const timer_store = createTimerStore();
        const job_store = createJobStore();
        const mock_job = make_job({ id: 'job-cb-stop', title: '콜백 완료', status: 'in_progress' });
        const mock_cat = make_category({ id: 'cat-1', name: '기본', parent_id: null });
        job_store.setJobs([mock_job]);
        timer_store.startTimer(mock_job, mock_cat);
        const mock_context = build_app_context(timer_store, job_store);
        const on_reason_modal_change = vi.fn();

        const { getByRole, queryByRole } = render(Toolbar, {
            props: { context: mock_context, inline: true, on_reason_modal_change },
        });

        await user.click(getByRole('button', { name: '완료' }));

        expect(on_reason_modal_change).toHaveBeenCalled();
        const lift_config = on_reason_modal_change.mock.calls[0]![0]!;
        expect(lift_config).toMatchObject({ title: '완료 사유' });
        expect(queryByRole('dialog')).toBeNull();
    });

    it('UC-UI-024: 콜백 모드에서 onconfirm 실행 후 null이 전달된다 (모달 닫힘)', async () => {
        const user = userEvent.setup();
        const timer_store = createTimerStore();
        const job_store = createJobStore();
        const mock_job = make_job({ id: 'job-cb-confirm', title: '콜백 확인', status: 'in_progress' });
        const mock_cat = make_category({ id: 'cat-1', name: '기본', parent_id: null });
        job_store.setJobs([mock_job]);
        timer_store.startTimer(mock_job, mock_cat);
        const mock_context = build_app_context(timer_store, job_store);
        const on_reason_modal_change = vi.fn();

        const { getByRole } = render(Toolbar, {
            props: { context: mock_context, inline: true, on_reason_modal_change },
        });

        await user.click(getByRole('button', { name: '일시정지' }));

        const lift_config = on_reason_modal_change.mock.calls[0]![0]!;
        await lift_config.onconfirm('테스트 사유');

        expect(on_reason_modal_change).toHaveBeenNthCalledWith(2, null);
    });

    it('UC-UI-024: 콜백 모드에서 oncancel 실행 후 null이 전달된다', async () => {
        const user = userEvent.setup();
        const timer_store = createTimerStore();
        const job_store = createJobStore();
        const mock_job = make_job({ id: 'job-cb-cancel', title: '콜백 취소', status: 'in_progress' });
        const mock_cat = make_category({ id: 'cat-1', name: '기본', parent_id: null });
        job_store.setJobs([mock_job]);
        timer_store.startTimer(mock_job, mock_cat);
        const mock_context = build_app_context(timer_store, job_store);
        const on_reason_modal_change = vi.fn();

        const { getByRole } = render(Toolbar, {
            props: { context: mock_context, inline: true, on_reason_modal_change },
        });

        await user.click(getByRole('button', { name: '일시정지' }));

        const lift_config = on_reason_modal_change.mock.calls[0]![0]!;
        lift_config.oncancel();

        expect(on_reason_modal_change).toHaveBeenNthCalledWith(2, null);
    });

    it('UC-UI-021: 활성 없음 + pending 잡이면 시작만 보이고 전환·재개는 없다', () => {
        const timer_store = createTimerStore();
        const job_store = createJobStore();
        job_store.setJobs([make_job({ id: 'job-p2', title: '대기 2' })]);
        const mock_context = build_app_context(timer_store, job_store);

        const { queryByRole } = render(Toolbar, {
            props: { context: mock_context, inline: true },
        });

        expect(queryByRole('button', { name: '시작' })).toBeTruthy();
        expect(queryByRole('button', { name: '전환' })).toBeNull();
        expect(queryByRole('button', { name: '재개' })).toBeNull();
    });

    it('UC-UI-022: 활성 없음 + paused 잡이면 재개 버튼이 보인다', () => {
        const timer_store = createTimerStore();
        const job_store = createJobStore();
        job_store.setJobs([make_job({ id: 'job-paused', title: '일시정지 작업', status: 'paused' })]);
        const mock_context = build_app_context(timer_store, job_store);

        const { queryByRole } = render(Toolbar, {
            props: { context: mock_context, inline: true },
        });

        expect(queryByRole('button', { name: '재개' })).toBeTruthy();
    });

    it('UC-UI-023: toolbar·액션 버튼에 vanilla-extract 클래스가 적용된다', () => {
        const pending_job = make_job({ id: 'job-c1', title: '스타일 검증' });
        const mock_cat = make_category({ id: 'cat-1', name: '기본', parent_id: null });

        // 활성 타이머 없음: 대기 행에 "시작"·완료·취소
        const timer_store_idle = createTimerStore();
        const job_store_idle = createJobStore();
        job_store_idle.setJobs([pending_job]);
        const ctx_idle = build_app_context(timer_store_idle, job_store_idle);
        const view_idle = render(Toolbar, { props: { context: ctx_idle, inline: true } });

        expect(view_idle.getByRole('button', { name: '시작' }).className).toContain(toolbar_css.action_btn_start);
        expect(view_idle.getByRole('button', { name: '완료' }).className).toContain(toolbar_css.action_btn_complete);
        expect(view_idle.getByRole('button', { name: '취소' }).className).toContain(toolbar_css.action_btn_cancel);
        view_idle.unmount();

        // 실행 중 + 다른 대기 잡: 헤더 일시정지·완료, 행에 전환·완료·취소
        const timer_store_run = createTimerStore();
        const job_store_run = createJobStore();
        const mock_job = make_job({ id: 'job-c2', title: '실행 중', status: 'in_progress' });
        job_store_run.setJobs([pending_job, mock_job]);
        timer_store_run.startTimer(mock_job, mock_cat);
        const ctx_run = build_app_context(timer_store_run, job_store_run);
        const view_run = render(Toolbar, { props: { context: ctx_run, inline: true } });

        expect(view_run.getByRole('button', { name: '일시정지' }).className).toContain(toolbar_css.toolbar_btn_pause);

        const complete_btns = view_run.getAllByRole('button', { name: '완료' });
        const row_complete = complete_btns.find((b) => b.className.includes(toolbar_css.action_btn_complete));
        const header_stop = complete_btns.find((b) => b.className.includes(toolbar_css.toolbar_btn_stop));
        expect(row_complete).toBeTruthy();
        expect(header_stop).toBeTruthy();

        expect(view_run.getByRole('button', { name: '취소' }).className).toContain(toolbar_css.action_btn_cancel);
        expect(view_run.getByRole('button', { name: '전환' }).className).toContain(toolbar_css.action_btn_switch);
    });
});
