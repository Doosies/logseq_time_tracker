import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryUnitOfWork } from '../adapters/storage/memory';
import type { IExternalRefRepository } from '../adapters/storage/repositories';
import { StateTransitionError, ValidationError } from '../errors';
import type { ExternalRef } from '../types/external_ref';
import { parseCustomFields } from '../types/job';
import { generateId } from '../utils';
import { HistoryService } from './history_service';
import { JobService } from './job_service';

/** MemoryUnitOfWork 기본 스텁 대신 ExternalRef cascade를 검증하기 위한 테스트 더블 */
class TestMemoryExternalRefRepository implements IExternalRefRepository {
    private readonly refs_by_id = new Map<string, ExternalRef>();

    async getExternalRefs(job_id: string): Promise<ExternalRef[]> {
        return Array.from(this.refs_by_id.values()).filter((r) => r.job_id === job_id);
    }

    async getExternalRef(job_id: string, system_key: string): Promise<ExternalRef | null> {
        return (
            Array.from(this.refs_by_id.values()).find((r) => r.job_id === job_id && r.system_key === system_key) ?? null
        );
    }

    async getExternalRefBySystemAndValue(system_key: string, ref_value: string): Promise<ExternalRef | null> {
        return (
            Array.from(this.refs_by_id.values()).find(
                (r) => r.system_key === system_key && r.ref_value === ref_value,
            ) ?? null
        );
    }

    async upsertExternalRef(ref: ExternalRef): Promise<void> {
        this.refs_by_id.set(ref.id, structuredClone(ref));
    }

    async deleteExternalRef(id: string): Promise<void> {
        this.refs_by_id.delete(id);
    }

    async deleteByJobId(job_id: string): Promise<void> {
        for (const [id, r] of [...this.refs_by_id]) {
            if (r.job_id === job_id) {
                this.refs_by_id.delete(id);
            }
        }
    }
}

function attach_test_external_ref_repo(uow: MemoryUnitOfWork): TestMemoryExternalRefRepository {
    const ref_repo = new TestMemoryExternalRefRepository();
    (uow as unknown as { externalRefRepo: IExternalRefRepository }).externalRefRepo = ref_repo;
    return ref_repo;
}

describe('JobService', () => {
    let uow: MemoryUnitOfWork;
    let history_service: HistoryService;
    let job_service: JobService;

    beforeEach(() => {
        uow = new MemoryUnitOfWork();
        history_service = new HistoryService(uow);
        job_service = new JobService(uow, history_service);
    });

    it('UC-JOB-001: createJob: 제목 sanitize + Job 생성', async () => {
        const job = await job_service.createJob({ title: '  Hello  ' });
        expect(job.title).toBe('Hello');
        expect(job.status).toBe('pending');
        const stored = await uow.jobRepo.getJobById(job.id);
        expect(stored?.title).toBe('Hello');
    });

    it('createJob: 빈 제목 시 ValidationError', async () => {
        await expect(job_service.createJob({ title: '   ' })).rejects.toThrow(ValidationError);
    });

    it('createJob: HTML 태그 제거', async () => {
        const job = await job_service.createJob({ title: '<b>Safe</b>' });
        expect(job.title).toBe('Safe');
    });

    it('UC-JOB-002: getJobs: 필터 없이 전체', async () => {
        await job_service.createJob({ title: 'A' });
        await job_service.createJob({ title: 'B' });
        const jobs = await job_service.getJobs();
        expect(jobs.length).toBeGreaterThanOrEqual(2);
    });

    it('getJobs: status 필터', async () => {
        const j = await job_service.createJob({ title: 'x' });
        await job_service.transitionStatus(j.id, 'in_progress', 'go');
        const in_prog = await job_service.getJobs({ status: 'in_progress' });
        expect(in_prog.some((x) => x.id === j.id)).toBe(true);
    });

    it('getJobById: 존재/미존재', async () => {
        const j = await job_service.createJob({ title: 'y' });
        expect(await job_service.getJobById(j.id)).not.toBeNull();
        expect(await job_service.getJobById('missing-id')).toBeNull();
    });

    it('UC-JOB-003: updateJob: 제목 변경', async () => {
        const j = await job_service.createJob({ title: 'old' });
        const updated = await job_service.updateJob(j.id, { title: 'new' });
        expect(updated.title).toBe('new');
    });

    it('updateJob: 미존재 Job 시 ValidationError', async () => {
        await expect(job_service.updateJob('nope', { title: 'x' })).rejects.toThrow(ValidationError);
    });

    it('UC-JOB-005: deleteJob: pending Job 삭제 (cascade)', async () => {
        const j = await job_service.createJob({ title: 'del' });
        await job_service.deleteJob(j.id);
        expect(await job_service.getJobById(j.id)).toBeNull();
    });

    it('UC-JOB-008: deleteJob: in_progress Job 삭제 시 StateTransitionError', async () => {
        const j = await job_service.createJob({ title: 'run' });
        await job_service.transitionStatus(j.id, 'in_progress', 'start');
        await expect(job_service.deleteJob(j.id)).rejects.toThrow(StateTransitionError);
    });

    it('transitionStatus: 유효한 전환 (pending→in_progress)', async () => {
        const j = await job_service.createJob({ title: 't' });
        await job_service.transitionStatus(j.id, 'in_progress', 'r');
        const got = await job_service.getJobById(j.id);
        expect(got?.status).toBe('in_progress');
    });

    it('UC-JOB-004: transitionStatus: 무효한 전환 시 StateTransitionError', async () => {
        const j = await job_service.createJob({ title: 't' });
        await expect(job_service.transitionStatus(j.id, 'paused', 'bad')).rejects.toThrow(StateTransitionError);
    });

    it('transitionStatus: 미존재 Job 시 ValidationError', async () => {
        await expect(job_service.transitionStatus('missing', 'in_progress', 'r')).rejects.toThrow(ValidationError);
    });

    it('switchJob: in_progress → paused + 새 Job → in_progress (원자적)', async () => {
        const from = await job_service.createJob({ title: 'from' });
        const to = await job_service.createJob({ title: 'to' });
        await job_service.transitionStatus(from.id, 'in_progress', 'start');
        await job_service.switchJob(from.id, to.id, '전환');
        const from_after = await job_service.getJobById(from.id);
        const to_after = await job_service.getJobById(to.id);
        expect(from_after?.status).toBe('paused');
        expect(to_after?.status).toBe('in_progress');
    });

    it('UC-JOB-006: transitionStatus: completed → pending 재오픈 + History 생성', async () => {
        const j = await job_service.createJob({ title: 'reopen-done' });
        await job_service.transitionStatus(j.id, 'completed', '완료');
        await job_service.transitionStatus(j.id, 'pending', '재오픈');
        const after = await job_service.getJobById(j.id);
        expect(after?.status).toBe('pending');
        const history_rows = await history_service.getJobHistory(j.id);
        const reopen_row = history_rows.find((h) => h.from_status === 'completed' && h.to_status === 'pending');
        expect(reopen_row).toBeDefined();
        expect(reopen_row?.reason).toBe('재오픈');
    });

    it('UC-JOB-007: transitionStatus: cancelled → pending 재오픈 + History 생성', async () => {
        const j = await job_service.createJob({ title: 'reopen-cancel' });
        await job_service.transitionStatus(j.id, 'cancelled', '취소');
        await job_service.transitionStatus(j.id, 'pending', '다시 열기');
        const after = await job_service.getJobById(j.id);
        expect(after?.status).toBe('pending');
        const history_rows = await history_service.getJobHistory(j.id);
        const reopen_row = history_rows.find((h) => h.from_status === 'cancelled' && h.to_status === 'pending');
        expect(reopen_row).toBeDefined();
        expect(reopen_row?.reason).toBe('다시 열기');
    });

    it('UC-JOB-009: transitionStatus: pending → cancelled 전환 + History 기록', async () => {
        const j = await job_service.createJob({ title: 'cancel-me' });
        await job_service.transitionStatus(j.id, 'cancelled', '그만둠');
        const after = await job_service.getJobById(j.id);
        expect(after?.status).toBe('cancelled');
        const history_rows = await history_service.getJobHistory(j.id);
        expect(history_rows).toHaveLength(1);
        expect(history_rows[0]?.from_status).toBe('pending');
        expect(history_rows[0]?.to_status).toBe('cancelled');
        expect(history_rows[0]?.reason).toBe('그만둠');
    });

    it('UC-JOB-010: deleteJob: cancelled Job 삭제 (cascade)', async () => {
        const j = await job_service.createJob({ title: 'cancel-del' });
        await job_service.transitionStatus(j.id, 'cancelled', '취소');
        const now = new Date().toISOString();
        await uow.timeEntryRepo.upsertTimeEntry({
            id: generateId(),
            job_id: j.id,
            category_id: 'cat-test',
            started_at: now,
            ended_at: now,
            duration_seconds: 0,
            note: '',
            is_manual: true,
            created_at: now,
            updated_at: now,
        });
        const before_entries = await uow.timeEntryRepo.getTimeEntries({ job_id: j.id });
        expect(before_entries).toHaveLength(1);
        const before_history = await history_service.getJobHistory(j.id);
        expect(before_history.length).toBeGreaterThanOrEqual(1);

        await job_service.deleteJob(j.id);

        expect(await job_service.getJobById(j.id)).toBeNull();
        expect(await uow.timeEntryRepo.getTimeEntries({ job_id: j.id })).toHaveLength(0);
        expect(await history_service.getJobHistory(j.id)).toHaveLength(0);
    });

    it('UC-EDGE-004: custom_fields 손상 JSON → {} fallback', async () => {
        const j = await job_service.createJob({ title: 'bad-json' });
        const stored = await uow.jobRepo.getJobById(j.id);
        expect(stored).not.toBeNull();
        await uow.jobRepo.upsertJob({
            ...stored!,
            custom_fields: '{not valid json',
        });
        const got = await job_service.getJobById(j.id);
        expect(got?.custom_fields).toBe('{not valid json');
        expect(parseCustomFields(got!.custom_fields)).toEqual({});
    });

    it('UC-EDGE-006: transitionStatus: pending → completed 직접 전환 + History', async () => {
        const j = await job_service.createJob({ title: 'direct-done' });
        await job_service.transitionStatus(j.id, 'completed', '바로 완료');
        const after = await job_service.getJobById(j.id);
        expect(after?.status).toBe('completed');
        const history_rows = await history_service.getJobHistory(j.id);
        expect(history_rows).toHaveLength(1);
        expect(history_rows[0]?.from_status).toBe('pending');
        expect(history_rows[0]?.to_status).toBe('completed');
        expect(history_rows[0]?.reason).toBe('바로 완료');
    });

    it('UC-EDGE-008: deleteJob: ExternalRef cascade 삭제 검증', async () => {
        const local_uow = new MemoryUnitOfWork();
        attach_test_external_ref_repo(local_uow);
        const local_history = new HistoryService(local_uow);
        const local_job_service = new JobService(local_uow, local_history);

        const j = await local_job_service.createJob({ title: 'ref-owner' });
        const now = new Date().toISOString();
        const ref: ExternalRef = {
            id: generateId(),
            job_id: j.id,
            system_key: 'logseq',
            ref_value: 'page-uuid',
            created_at: now,
            updated_at: now,
        };
        await local_uow.externalRefRepo.upsertExternalRef(ref);
        expect(await local_uow.externalRefRepo.getExternalRefs(j.id)).toHaveLength(1);

        await local_job_service.deleteJob(j.id);

        expect(await local_job_service.getJobById(j.id)).toBeNull();
        expect(await local_uow.externalRefRepo.getExternalRefs(j.id)).toHaveLength(0);
    });
});
