import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryUnitOfWork } from '../adapters/storage/memory';
import { ValidationError } from '../errors';
import type { TimeEntry } from '../types/time_entry';
import { HistoryService } from './history_service';
import { JobService } from './job_service';
import { CategoryService } from './category_service';
import { TimeEntryService } from './time_entry_service';

function makeEntry(
    overrides: Partial<TimeEntry> & Pick<TimeEntry, 'id' | 'job_id' | 'category_id' | 'started_at' | 'ended_at'>,
): TimeEntry {
    const duration_seconds = Math.floor((Date.parse(overrides.ended_at) - Date.parse(overrides.started_at)) / 1000);
    return {
        note: '',
        is_manual: true,
        created_at: '2025-06-01T00:00:00.000Z',
        updated_at: '2025-06-01T00:00:00.000Z',
        duration_seconds,
        ...overrides,
    };
}

describe('TimeEntryService', () => {
    let uow: MemoryUnitOfWork;
    let job_service: JobService;
    let category_service: CategoryService;
    let time_entry_service: TimeEntryService;
    let job_id: string;
    let category_id: string;

    beforeEach(async () => {
        uow = new MemoryUnitOfWork();
        const history_service = new HistoryService(uow);
        job_service = new JobService(uow, history_service);
        category_service = new CategoryService(uow);
        time_entry_service = new TimeEntryService(uow);
        const job = await job_service.createJob({ title: 'j' });
        const cat = await category_service.createCategory('c');
        job_id = job.id;
        category_id = cat.id;
    });

    it('UC-ENTRY-001: detectOverlaps — partial overlap, no overlap, exact boundary; ignores non-manual', async () => {
        await uow.timeEntryRepo.upsertTimeEntry(
            makeEntry({
                id: 'e-partial',
                job_id,
                category_id,
                started_at: '2025-06-01T10:00:00.000Z',
                ended_at: '2025-06-01T12:00:00.000Z',
            }),
        );
        await uow.timeEntryRepo.upsertTimeEntry(
            makeEntry({
                id: 'e-later',
                job_id,
                category_id,
                started_at: '2025-06-01T14:00:00.000Z',
                ended_at: '2025-06-01T15:00:00.000Z',
            }),
        );
        await uow.timeEntryRepo.upsertTimeEntry(
            makeEntry({
                id: 'e-touch',
                job_id,
                category_id,
                started_at: '2025-06-01T12:00:00.000Z',
                ended_at: '2025-06-01T13:00:00.000Z',
            }),
        );
        await uow.timeEntryRepo.upsertTimeEntry(
            makeEntry({
                id: 'e-auto',
                job_id,
                category_id,
                started_at: '2025-06-01T08:00:00.000Z',
                ended_at: '2025-06-01T09:00:00.000Z',
                is_manual: false,
            }),
        );

        const partial = await time_entry_service.detectOverlaps(
            job_id,
            '2025-06-01T11:00:00.000Z',
            '2025-06-01T11:30:00.000Z',
        );
        expect(partial.map((e) => e.id)).toEqual(['e-partial']);

        const none = await time_entry_service.detectOverlaps(
            job_id,
            '2025-06-01T13:00:00.000Z',
            '2025-06-01T13:30:00.000Z',
        );
        expect(none).toHaveLength(0);

        const boundary = await time_entry_service.detectOverlaps(
            job_id,
            '2025-06-01T09:00:00.000Z',
            '2025-06-01T10:00:00.000Z',
        );
        expect(boundary).toHaveLength(0);

        const ignores_timer = await time_entry_service.detectOverlaps(
            job_id,
            '2025-06-01T08:00:00.000Z',
            '2025-06-01T08:30:00.000Z',
        );
        expect(ignores_timer).toHaveLength(0);
    });

    it('UC-ENTRY-002: resolveOverlap new_first (partial tail, partial head, delete contained, split) and existing_first (partial split, cancel contained, two fragments)', async () => {
        const new_entry = makeEntry({
            id: 'new-1',
            job_id,
            category_id,
            started_at: '2025-06-01T10:00:00.000Z',
            ended_at: '2025-06-01T11:00:00.000Z',
        });

        const tail_existing = makeEntry({
            id: 'ex-tail',
            job_id,
            category_id,
            started_at: '2025-06-01T10:30:00.000Z',
            ended_at: '2025-06-01T11:45:00.000Z',
        });
        await uow.timeEntryRepo.upsertTimeEntry(tail_existing);
        const tail_result = await time_entry_service.resolveOverlap(new_entry, [tail_existing], 'new_first');
        expect(tail_result).toHaveLength(1);
        expect(tail_result[0]!.id).toBe('ex-tail');
        expect(tail_result[0]!.started_at).toBe('2025-06-01T11:00:00.000Z');
        expect(tail_result[0]!.ended_at).toBe('2025-06-01T11:45:00.000Z');
        expect(tail_result[0]!.duration_seconds).toBe(45 * 60);

        await uow.timeEntryRepo.deleteTimeEntry('ex-tail');
        const head_existing = makeEntry({
            id: 'ex-head',
            job_id,
            category_id,
            started_at: '2025-06-01T09:00:00.000Z',
            ended_at: '2025-06-01T10:30:00.000Z',
        });
        await uow.timeEntryRepo.upsertTimeEntry(head_existing);
        const head_result = await time_entry_service.resolveOverlap(new_entry, [head_existing], 'new_first');
        expect(head_result).toHaveLength(1);
        expect(head_result[0]!.id).toBe('ex-head');
        expect(head_result[0]!.started_at).toBe('2025-06-01T09:00:00.000Z');
        expect(head_result[0]!.ended_at).toBe('2025-06-01T10:00:00.000Z');
        expect(head_result[0]!.duration_seconds).toBe(60 * 60);

        await uow.timeEntryRepo.deleteTimeEntry('ex-head');
        const inner = makeEntry({
            id: 'ex-inner',
            job_id,
            category_id,
            started_at: '2025-06-01T10:15:00.000Z',
            ended_at: '2025-06-01T10:45:00.000Z',
        });
        await uow.timeEntryRepo.upsertTimeEntry(inner);
        const del_result = await time_entry_service.resolveOverlap(new_entry, [inner], 'new_first');
        expect(del_result).toHaveLength(0);
        expect(await uow.timeEntryRepo.getTimeEntryById('ex-inner')).toBeNull();

        const outer = makeEntry({
            id: 'ex-outer',
            job_id,
            category_id,
            started_at: '2025-06-01T09:00:00.000Z',
            ended_at: '2025-06-01T13:00:00.000Z',
        });
        await uow.timeEntryRepo.upsertTimeEntry(outer);
        const split_result = await time_entry_service.resolveOverlap(new_entry, [outer], 'new_first');
        expect(split_result).toHaveLength(2);
        expect(await uow.timeEntryRepo.getTimeEntryById('ex-outer')).toBeNull();
        const starts = split_result.map((e) => e.started_at).sort();
        expect(starts).toEqual(['2025-06-01T09:00:00.000Z', '2025-06-01T11:00:00.000Z']);
        expect(split_result.some((e) => e.ended_at === '2025-06-01T10:00:00.000Z')).toBe(true);
        expect(split_result.some((e) => e.ended_at === '2025-06-01T13:00:00.000Z')).toBe(true);

        const wide_new = makeEntry({
            id: 'new-wide',
            job_id,
            category_id,
            started_at: '2025-06-01T08:00:00.000Z',
            ended_at: '2025-06-01T14:00:00.000Z',
        });
        const hole_existing = makeEntry({
            id: 'ex-hole',
            job_id,
            category_id,
            started_at: '2025-06-01T10:00:00.000Z',
            ended_at: '2025-06-01T11:00:00.000Z',
        });
        const ef_partial = await time_entry_service.resolveOverlap(wide_new, [hole_existing], 'existing_first');
        expect(ef_partial).toHaveLength(2);
        expect(ef_partial[0]!.started_at).toBe('2025-06-01T08:00:00.000Z');
        expect(ef_partial[0]!.ended_at).toBe('2025-06-01T10:00:00.000Z');
        expect(ef_partial[1]!.started_at).toBe('2025-06-01T11:00:00.000Z');
        expect(ef_partial[1]!.ended_at).toBe('2025-06-01T14:00:00.000Z');

        const narrow_new = makeEntry({
            id: 'new-narrow',
            job_id,
            category_id,
            started_at: '2025-06-01T10:30:00.000Z',
            ended_at: '2025-06-01T10:45:00.000Z',
        });
        const wrap = makeEntry({
            id: 'ex-wrap',
            job_id,
            category_id,
            started_at: '2025-06-01T10:00:00.000Z',
            ended_at: '2025-06-01T12:00:00.000Z',
        });
        const ef_cancel = await time_entry_service.resolveOverlap(narrow_new, [wrap], 'existing_first');
        expect(ef_cancel).toHaveLength(0);
    });

    it('UC-ENTRY-003: createManualEntry sets duration_seconds from interval', async () => {
        const entry = await time_entry_service.createManualEntry({
            job_id,
            category_id,
            started_at: '2025-06-01T10:00:00.000Z',
            ended_at: '2025-06-01T10:00:30.000Z',
            note: 'n',
        });
        expect(entry.duration_seconds).toBe(30);
        expect(entry.is_manual).toBe(true);
        const stored = await uow.timeEntryRepo.getTimeEntryById(entry.id);
        expect(stored?.duration_seconds).toBe(30);
    });

    it('UC-ENTRY-004: rejects ended_at before started_at; rejects empty job_id and unknown job', async () => {
        await expect(
            time_entry_service.createManualEntry({
                job_id,
                category_id,
                started_at: '2025-06-01T12:00:00.000Z',
                ended_at: '2025-06-01T11:00:00.000Z',
            }),
        ).rejects.toThrow(ValidationError);

        await expect(
            time_entry_service.createManualEntry({
                job_id: '   ',
                category_id,
                started_at: '2025-06-01T10:00:00.000Z',
                ended_at: '2025-06-01T11:00:00.000Z',
            }),
        ).rejects.toThrow(ValidationError);

        await expect(
            time_entry_service.createManualEntry({
                job_id: '00000000-0000-4000-8000-000000000099',
                category_id,
                started_at: '2025-06-01T10:00:00.000Z',
                ended_at: '2025-06-01T11:00:00.000Z',
            }),
        ).rejects.toThrow(ValidationError);
    });
});
