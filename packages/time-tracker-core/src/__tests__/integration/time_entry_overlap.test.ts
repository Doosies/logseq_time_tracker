import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { MemoryUnitOfWork } from '../../adapters/storage/memory';
import { TimeEntryService } from '../../services/time_entry_service';
import { JobService } from '../../services/job_service';
import { HistoryService } from '../../services/history_service';
import { CategoryService } from '../../services/category_service';
import type { TimeEntry } from '../../types/time_entry';
import { generateId } from '../../utils';

function makeEntry(
    overrides: Partial<TimeEntry> & Pick<TimeEntry, 'job_id' | 'category_id' | 'started_at' | 'ended_at'>,
): TimeEntry {
    const id = overrides.id ?? generateId();
    const duration_seconds = Math.floor((Date.parse(overrides.ended_at) - Date.parse(overrides.started_at)) / 1000);
    return {
        id,
        note: '',
        is_manual: true,
        created_at: '2025-06-01T00:00:00.000Z',
        updated_at: '2025-06-01T00:00:00.000Z',
        duration_seconds,
        ...overrides,
    };
}

describe('Time entry overlap integration (UC-ENTRY-001/002)', () => {
    let uow: MemoryUnitOfWork;
    let job_service: JobService;
    let category_service: CategoryService;
    let time_entry_service: TimeEntryService;
    let job_id: string;
    let category_id: string;

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-06-01T08:00:00.000Z'));
        uow = new MemoryUnitOfWork();
        const history_service = new HistoryService(uow);
        job_service = new JobService(uow, history_service);
        category_service = new CategoryService(uow);
        time_entry_service = new TimeEntryService(uow);
        const job = await job_service.createJob({ title: 'overlap-job' });
        const cat = await category_service.createCategory('overlap-cat');
        job_id = job.id;
        category_id = cat.id;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('UC-ENTRY-001: overlap 통합 - 두 수동 엔트리 부분 중복 감지', async () => {
        const entry_a = await time_entry_service.createManualEntry({
            job_id,
            category_id,
            started_at: '2025-06-01T10:00:00.000Z',
            ended_at: '2025-06-01T11:00:00.000Z',
        });
        const overlaps = await time_entry_service.detectOverlaps(
            job_id,
            '2025-06-01T10:30:00.000Z',
            '2025-06-01T11:30:00.000Z',
        );
        expect(overlaps.map((e) => e.id)).toEqual([entry_a.id]);
    });

    it('UC-ENTRY-001: overlap 통합 - 겹치지 않는 엔트리 감지 없음', async () => {
        await time_entry_service.createManualEntry({
            job_id,
            category_id,
            started_at: '2025-06-01T10:00:00.000Z',
            ended_at: '2025-06-01T11:00:00.000Z',
        });
        const overlaps = await time_entry_service.detectOverlaps(
            job_id,
            '2025-06-01T11:00:00.000Z',
            '2025-06-01T12:00:00.000Z',
        );
        expect(overlaps).toEqual([]);
    });

    it('UC-ENTRY-001: overlap 통합 - 자동(timer) 엔트리는 감지 대상에서 제외', async () => {
        await uow.timeEntryRepo.upsertTimeEntry(
            makeEntry({
                job_id,
                category_id,
                started_at: '2025-06-01T10:00:00.000Z',
                ended_at: '2025-06-01T11:00:00.000Z',
                is_manual: false,
            }),
        );
        const overlaps = await time_entry_service.detectOverlaps(
            job_id,
            '2025-06-01T10:30:00.000Z',
            '2025-06-01T10:45:00.000Z',
        );
        expect(overlaps).toEqual([]);
    });

    it('UC-ENTRY-002: new_first 통합 - 기존 부분 겹침 → 종료 시각(ended_at) 조정', async () => {
        const entry_a = await time_entry_service.createManualEntry({
            job_id,
            category_id,
            started_at: '2025-06-01T10:00:00.000Z',
            ended_at: '2025-06-01T11:00:00.000Z',
        });
        const new_b = makeEntry({
            job_id,
            category_id,
            started_at: '2025-06-01T10:30:00.000Z',
            ended_at: '2025-06-01T11:30:00.000Z',
        });
        const adjusted = await time_entry_service.resolveOverlap(new_b, [entry_a], 'new_first');
        expect(adjusted).toHaveLength(1);
        const stored_a = await uow.timeEntryRepo.getTimeEntryById(entry_a.id);
        expect(stored_a).not.toBeNull();
        expect(stored_a!.started_at).toBe('2025-06-01T10:00:00.000Z');
        expect(stored_a!.ended_at).toBe('2025-06-01T10:30:00.000Z');
        expect(stored_a!.duration_seconds).toBe(30 * 60);
    });

    it('UC-ENTRY-002: new_first 통합 - 기존이 새 범위에 완전 포함 → 삭제', async () => {
        const entry_a = await time_entry_service.createManualEntry({
            job_id,
            category_id,
            started_at: '2025-06-01T10:30:00.000Z',
            ended_at: '2025-06-01T10:45:00.000Z',
        });
        const new_b = makeEntry({
            job_id,
            category_id,
            started_at: '2025-06-01T10:00:00.000Z',
            ended_at: '2025-06-01T11:00:00.000Z',
        });
        const adjusted = await time_entry_service.resolveOverlap(new_b, [entry_a], 'new_first');
        expect(adjusted).toEqual([]);
        expect(await uow.timeEntryRepo.getTimeEntryById(entry_a.id)).toBeNull();
    });

    it('UC-ENTRY-002: new_first 통합 - 기존이 새 범위를 완전 포함 → 분할', async () => {
        const entry_a = await time_entry_service.createManualEntry({
            job_id,
            category_id,
            started_at: '2025-06-01T10:00:00.000Z',
            ended_at: '2025-06-01T12:00:00.000Z',
        });
        const new_b = makeEntry({
            job_id,
            category_id,
            started_at: '2025-06-01T10:30:00.000Z',
            ended_at: '2025-06-01T11:00:00.000Z',
        });
        const pieces = await time_entry_service.resolveOverlap(new_b, [entry_a], 'new_first');
        expect(pieces).toHaveLength(2);
        expect(await uow.timeEntryRepo.getTimeEntryById(entry_a.id)).toBeNull();
        const all = await uow.timeEntryRepo.getTimeEntries({ job_id });
        const manual = all.filter((e) => e.is_manual).sort((a, b) => a.started_at.localeCompare(b.started_at));
        expect(manual).toHaveLength(2);
        expect(manual[0]!.started_at).toBe('2025-06-01T10:00:00.000Z');
        expect(manual[0]!.ended_at).toBe('2025-06-01T10:30:00.000Z');
        expect(manual[1]!.started_at).toBe('2025-06-01T11:00:00.000Z');
        expect(manual[1]!.ended_at).toBe('2025-06-01T12:00:00.000Z');
    });

    it('UC-ENTRY-002: existing_first 통합 - 새 엔트리 부분 잘림', async () => {
        const entry_a = await time_entry_service.createManualEntry({
            job_id,
            category_id,
            started_at: '2025-06-01T10:00:00.000Z',
            ended_at: '2025-06-01T11:00:00.000Z',
        });
        const new_b = makeEntry({
            id: 'new-b-partial',
            job_id,
            category_id,
            started_at: '2025-06-01T10:30:00.000Z',
            ended_at: '2025-06-01T11:30:00.000Z',
        });
        const result = await time_entry_service.resolveOverlap(new_b, [entry_a], 'existing_first');
        expect(result).toHaveLength(1);
        expect(result[0]!.started_at).toBe('2025-06-01T11:00:00.000Z');
        expect(result[0]!.ended_at).toBe('2025-06-01T11:30:00.000Z');
        expect(result[0]!.duration_seconds).toBe(30 * 60);
    });

    it('UC-ENTRY-002: existing_first 통합 - 새 엔트리 완전 포함 → 빈 배열', async () => {
        const entry_a = await time_entry_service.createManualEntry({
            job_id,
            category_id,
            started_at: '2025-06-01T10:00:00.000Z',
            ended_at: '2025-06-01T12:00:00.000Z',
        });
        const new_b = makeEntry({
            job_id,
            category_id,
            started_at: '2025-06-01T10:30:00.000Z',
            ended_at: '2025-06-01T11:00:00.000Z',
        });
        const result = await time_entry_service.resolveOverlap(new_b, [entry_a], 'existing_first');
        expect(result).toEqual([]);
    });
});
