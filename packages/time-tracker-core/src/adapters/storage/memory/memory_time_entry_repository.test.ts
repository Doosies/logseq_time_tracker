import { describe, expect, it } from 'vitest';
import type { TimeEntry } from '../../../types/time_entry';
import { MemoryTimeEntryRepository } from './memory_time_entry_repository';

function makeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
    const now = '2025-06-01T12:00:00.000Z';
    return {
        id: 'e1',
        job_id: 'job-a',
        category_id: 'cat-a',
        started_at: '2025-06-01T10:00:00.000Z',
        ended_at: now,
        duration_seconds: 100,
        note: '',
        is_manual: false,
        created_at: now,
        updated_at: now,
        ...overrides,
    };
}

describe('MemoryTimeEntryRepository', () => {
    it('UC-MEM-014: upsertTimeEntry + getTimeEntryById', async () => {
        const repo = new MemoryTimeEntryRepository();
        const e = makeEntry();
        await repo.upsertTimeEntry(e);
        const got = await repo.getTimeEntryById('e1');
        expect(got?.job_id).toBe('job-a');
    });

    it('UC-MEM-015: getTimeEntries: 필터 없이 전체 반환', async () => {
        const repo = new MemoryTimeEntryRepository();
        await repo.upsertTimeEntry(makeEntry({ id: 'a' }));
        await repo.upsertTimeEntry(makeEntry({ id: 'b', job_id: 'job-b' }));
        const all = await repo.getTimeEntries();
        expect(all).toHaveLength(2);
    });

    it('UC-MEM-016: getTimeEntries: job_id 필터', async () => {
        const repo = new MemoryTimeEntryRepository();
        await repo.upsertTimeEntry(makeEntry({ id: 'a', job_id: 'j1' }));
        await repo.upsertTimeEntry(makeEntry({ id: 'b', job_id: 'j2' }));
        const filtered = await repo.getTimeEntries({ job_id: 'j1' });
        expect(filtered).toHaveLength(1);
        expect(filtered[0]?.id).toBe('a');
    });

    it('UC-STORE-004: getTimeEntries: from_date/to_date 필터', async () => {
        const repo = new MemoryTimeEntryRepository();
        await repo.upsertTimeEntry(makeEntry({ id: 'early', started_at: '2025-05-01T00:00:00.000Z' }));
        await repo.upsertTimeEntry(makeEntry({ id: 'mid', started_at: '2025-06-15T00:00:00.000Z' }));
        await repo.upsertTimeEntry(makeEntry({ id: 'late', started_at: '2025-07-01T00:00:00.000Z' }));
        const filtered = await repo.getTimeEntries({
            from_date: '2025-06-01T00:00:00.000Z',
            to_date: '2025-06-30T23:59:59.999Z',
        });
        expect(filtered.map((x) => x.id).sort()).toEqual(['mid']);
    });

    it('UC-MEM-017: deleteByJobId: 해당 job_id 엔트리 모두 삭제', async () => {
        const repo = new MemoryTimeEntryRepository();
        await repo.upsertTimeEntry(makeEntry({ id: 'a', job_id: 'j1' }));
        await repo.upsertTimeEntry(makeEntry({ id: 'b', job_id: 'j1' }));
        await repo.upsertTimeEntry(makeEntry({ id: 'c', job_id: 'j2' }));
        await repo.deleteByJobId('j1');
        const rest = await repo.getTimeEntries();
        expect(rest).toHaveLength(1);
        expect(rest[0]?.id).toBe('c');
    });

    it('UC-MEM-018: deleteTimeEntry: 단일 삭제', async () => {
        const repo = new MemoryTimeEntryRepository();
        await repo.upsertTimeEntry(makeEntry());
        await repo.deleteTimeEntry('e1');
        expect(await repo.getTimeEntryById('e1')).toBeNull();
    });
});
