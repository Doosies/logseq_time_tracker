import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryUnitOfWork } from '../../adapters/storage/memory';
import type { ILogger } from '../../adapters/logger';
import { createServices } from '../../services';
import { createTimerStore } from '../../stores/timer_store.svelte';

const silent_logger: ILogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
};

describe('타이머 워크플로우', () => {
    let uow: MemoryUnitOfWork;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-06-01T12:00:00.000Z'));
        uow = new MemoryUnitOfWork();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('UC-FSM-003: Job 생성 → 타이머 시작 → 시간 경과 → 정지 → TimeEntry 생성 확인', async () => {
        const services = createServices(uow, silent_logger);
        const job = await services.job_service.createJob({ title: '통합 작업' });
        const category = await services.category_service.createCategory('분류');
        await services.timer_service.start(job, category);
        vi.setSystemTime(new Date('2025-06-01T12:00:07.000Z'));
        const entry = await services.timer_service.stop('완료');
        expect(entry).not.toBeNull();
        expect(entry!.job_id).toBe(job.id);
        expect(entry!.category_id).toBe(category.id);
        expect(entry!.duration_seconds).toBeGreaterThanOrEqual(6);
        const stored = await services.job_service.getJobById(job.id);
        expect(stored?.status).toBe('completed');
        services.timer_service.dispose();
    });

    it('Job 생성 → 시작 → 일시정지 → 재개 → 정지 → 전체 경과 시간 확인', async () => {
        const services = createServices(uow, silent_logger);
        const job = await services.job_service.createJob({ title: '구간 누적' });
        const category = await services.category_service.createCategory('분류');
        await services.timer_service.start(job, category);
        vi.setSystemTime(new Date('2025-06-01T12:00:02.000Z'));
        await services.timer_service.pause('쉼');
        vi.setSystemTime(new Date('2025-06-01T12:00:05.000Z'));
        await services.timer_service.resume('다시');
        vi.setSystemTime(new Date('2025-06-01T12:00:07.000Z'));
        const entry = await services.timer_service.stop('끝');
        expect(entry).not.toBeNull();
        expect(entry!.duration_seconds).toBe(4);
        services.timer_service.dispose();
    });

    it('Job 생성 → 시작 → 취소 → [cancelled] 접두사 note', async () => {
        const services = createServices(uow, silent_logger);
        const job = await services.job_service.createJob({ title: '취소 테스트' });
        const category = await services.category_service.createCategory('분류');
        await services.timer_service.start(job, category);
        vi.setSystemTime(new Date('2025-06-01T12:00:04.000Z'));
        const entry = await services.timer_service.cancel('사유');
        expect(entry).not.toBeNull();
        expect(entry!.note.startsWith('[cancelled]')).toBe(true);
        const stored = await services.job_service.getJobById(job.id);
        expect(stored?.status).toBe('cancelled');
        services.timer_service.dispose();
    });

    it('UC-FSM-002: 두 Job 간 자동 전환 통합 검증', async () => {
        const services = createServices(uow, silent_logger);
        const job_a = await services.job_service.createJob({ title: 'Job A' });
        const job_b = await services.job_service.createJob({ title: 'Job B' });
        const category = await services.category_service.createCategory('분류');
        await services.timer_service.start(job_a, category);
        vi.setSystemTime(new Date('2025-06-01T12:00:05.000Z'));
        await services.timer_service.start(job_b, category);
        const entries_a = await uow.timeEntryRepo.getTimeEntries({ job_id: job_a.id });
        expect(entries_a).toHaveLength(1);
        expect(entries_a[0]!.duration_seconds).toBeGreaterThanOrEqual(4);
        const stored_a = await services.job_service.getJobById(job_a.id);
        expect(stored_a?.status).toBe('paused');
        const stored_b = await services.job_service.getJobById(job_b.id);
        expect(stored_b?.status).toBe('in_progress');
        expect(services.timer_service.getActiveJob()?.id).toBe(job_b.id);
        services.timer_service.dispose();
    });

    /**
     * TimerService는 스토어를 직접 갱신하지 않습니다. 앱(예: logseq-time-tracker App.svelte)은
     * 서비스 호출 직후 timer_store의 대응 메서드를 호출합니다. 여기서는 그 계약을 재현해 동기화를 검증합니다.
     */
    it('UC-FSM-005: TimerStore 반응형 동기화 (service→store)', async () => {
        const services = createServices(uow, silent_logger);
        const timer_store = createTimerStore();
        const job = await services.job_service.createJob({ title: '동기화' });
        const category = await services.category_service.createCategory('분류');

        await services.timer_service.start(job, category);
        timer_store.startTimer(job, category);
        expect(timer_store.state.active_job?.id).toBe(job.id);
        expect(services.timer_service.getActiveJob()?.id).toBe(job.id);
        expect(timer_store.is_running).toBe(true);
        expect(timer_store.state.is_paused).toBe(false);

        vi.setSystemTime(new Date('2025-06-01T12:00:03.000Z'));
        await services.timer_service.pause('p');
        timer_store.pauseTimer();
        expect(timer_store.state.is_paused).toBe(true);
        expect(timer_store.is_running).toBe(false);

        vi.setSystemTime(new Date('2025-06-01T12:01:00.000Z'));
        await services.timer_service.resume('r');
        timer_store.resumeTimer();
        expect(timer_store.state.is_paused).toBe(false);
        expect(timer_store.is_running).toBe(true);

        vi.setSystemTime(new Date('2025-06-01T12:01:02.000Z'));
        await services.timer_service.stop('done');
        timer_store.stopTimer();
        expect(timer_store.state.active_job).toBeNull();
        expect(services.timer_service.getActiveJob()).toBeNull();

        services.timer_service.dispose();
    });
});
