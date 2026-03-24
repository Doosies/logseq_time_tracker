import type { TimeEntry, TimeEntryFilter } from '../../../types/time_entry';
import type { ITimeEntryRepository } from '../repositories';

function matchesFilters(entry: TimeEntry, filters?: TimeEntryFilter): boolean {
    if (!filters) {
        return true;
    }
    if (filters.job_id !== undefined && entry.job_id !== filters.job_id) {
        return false;
    }
    if (filters.category_id !== undefined && entry.category_id !== filters.category_id) {
        return false;
    }
    if (filters.from_date !== undefined && entry.started_at < filters.from_date) {
        return false;
    }
    if (filters.to_date !== undefined && entry.started_at > filters.to_date) {
        return false;
    }
    return true;
}

export class MemoryTimeEntryRepository implements ITimeEntryRepository {
    private readonly entries = new Map<string, TimeEntry>();

    getSnapshot(): Map<string, TimeEntry> {
        const snapshot = new Map<string, TimeEntry>();
        for (const [id, e] of this.entries) {
            snapshot.set(id, structuredClone(e));
        }
        return snapshot;
    }

    restoreFromSnapshot(data: Map<string, TimeEntry>): void {
        this.entries.clear();
        for (const [id, e] of data) {
            this.entries.set(id, structuredClone(e));
        }
    }

    async getTimeEntries(filters?: TimeEntryFilter): Promise<TimeEntry[]> {
        return Array.from(this.entries.values())
            .filter((e) => matchesFilters(e, filters))
            .map((e) => structuredClone(e));
    }

    async getTimeEntryById(id: string): Promise<TimeEntry | null> {
        const e = this.entries.get(id);
        return e ? structuredClone(e) : null;
    }

    async upsertTimeEntry(entry: TimeEntry): Promise<void> {
        this.entries.set(entry.id, structuredClone(entry));
    }

    async deleteTimeEntry(id: string): Promise<void> {
        this.entries.delete(id);
    }

    async deleteByJobId(job_id: string): Promise<void> {
        for (const [id, e] of this.entries) {
            if (e.job_id === job_id) {
                this.entries.delete(id);
            }
        }
    }
}
