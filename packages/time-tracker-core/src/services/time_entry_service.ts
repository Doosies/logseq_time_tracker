import type { ILogger } from '../adapters/logger';
import type { IUnitOfWork } from '../adapters/storage/unit_of_work';
import type { TimeEntry } from '../types/time_entry';
import { ValidationError } from '../errors';
import { sanitizeText, generateId } from '../utils';
import { MAX_NOTE_LENGTH } from '../constants/config';

export interface ManualEntryParams {
    job_id: string;
    category_id: string;
    started_at: string;
    ended_at: string;
    note?: string;
}

export interface ITimeEntryService {
    createManualEntry(params: ManualEntryParams): Promise<TimeEntry>;
    detectOverlaps(job_id: string, started_at: string, ended_at: string, exclude_id?: string): Promise<TimeEntry[]>;
    resolveOverlap(
        new_entry: TimeEntry,
        existing: TimeEntry[],
        strategy: 'new_first' | 'existing_first',
    ): Promise<TimeEntry[]>;
    updateEntry(
        id: string,
        updates: Partial<Pick<TimeEntry, 'started_at' | 'ended_at' | 'note' | 'category_id'>>,
    ): Promise<TimeEntry>;
    deleteEntry(id: string): Promise<void>;
}

function intervalsOverlap(start_a: string, end_a: string, start_b: string, end_b: string): boolean {
    return start_a < end_b && end_a > start_b;
}

function computeDurationSeconds(started_at: string, ended_at: string): number {
    return Math.floor((Date.parse(ended_at) - Date.parse(started_at)) / 1000);
}

function subtractInterval(
    seg_start: string,
    seg_end: string,
    block_start: string,
    block_end: string,
): { start: string; end: string }[] {
    if (!intervalsOverlap(seg_start, seg_end, block_start, block_end)) {
        return [{ start: seg_start, end: seg_end }];
    }
    const out: { start: string; end: string }[] = [];
    if (seg_start < block_start) {
        const end_left = seg_end < block_start ? seg_end : block_start;
        if (end_left > seg_start) {
            out.push({ start: seg_start, end: end_left });
        }
    }
    if (seg_end > block_end) {
        const start_right = seg_start > block_end ? seg_start : block_end;
        if (seg_end > start_right) {
            out.push({ start: start_right, end: seg_end });
        }
    }
    return out;
}

export class TimeEntryService implements ITimeEntryService {
    constructor(
        private readonly _uow: IUnitOfWork,
        private readonly _logger?: ILogger,
    ) {}

    async createManualEntry(params: ManualEntryParams): Promise<TimeEntry> {
        const job_id_trim = params.job_id?.trim() ?? '';
        if (job_id_trim.length === 0) {
            throw new ValidationError('Job id is required', 'job_id');
        }
        const job = await this._uow.jobRepo.getJobById(job_id_trim);
        if (!job) {
            throw new ValidationError(`Job not found: ${job_id_trim}`, 'job_id');
        }
        const category = await this._uow.categoryRepo.getCategoryById(params.category_id);
        if (!category) {
            throw new ValidationError(`Category not found: ${params.category_id}`, 'category_id');
        }
        if (Date.parse(params.ended_at) < Date.parse(params.started_at)) {
            throw new ValidationError('ended_at must be greater than or equal to started_at', 'ended_at');
        }
        const duration_seconds = computeDurationSeconds(params.started_at, params.ended_at);
        const note = params.note !== undefined ? sanitizeText(params.note, MAX_NOTE_LENGTH) : '';
        const now = new Date().toISOString();
        const entry: TimeEntry = {
            id: generateId(),
            job_id: job_id_trim,
            category_id: params.category_id,
            started_at: params.started_at,
            ended_at: params.ended_at,
            duration_seconds,
            note,
            is_manual: true,
            created_at: now,
            updated_at: now,
        };
        return this._uow.transaction(async (uow) => {
            await uow.timeEntryRepo.upsertTimeEntry(entry);
            this._logger?.debug('Manual time entry created', { id: entry.id });
            return entry;
        });
    }

    async detectOverlaps(
        job_id: string,
        started_at: string,
        ended_at: string,
        exclude_id?: string,
    ): Promise<TimeEntry[]> {
        const all = await this._uow.timeEntryRepo.getTimeEntries({ job_id });
        return all
            .filter((e) => e.is_manual)
            .filter((e) => exclude_id === undefined || e.id !== exclude_id)
            .filter((e) => intervalsOverlap(e.started_at, e.ended_at, started_at, ended_at))
            .sort((a, b) => a.started_at.localeCompare(b.started_at));
    }

    async resolveOverlap(
        new_entry: TimeEntry,
        existing: TimeEntry[],
        strategy: 'new_first' | 'existing_first',
    ): Promise<TimeEntry[]> {
        if (strategy === 'new_first') {
            return this._resolveOverlapNewFirst(new_entry, existing);
        }
        return this._resolveOverlapExistingFirst(new_entry, existing);
    }

    private async _resolveOverlapNewFirst(new_entry: TimeEntry, existing: TimeEntry[]): Promise<TimeEntry[]> {
        const sorted = [...existing].sort((a, b) => a.started_at.localeCompare(b.started_at));
        return this._uow.transaction(async (uow) => {
            const upserted: TimeEntry[] = [];
            for (const ex of sorted) {
                if (!intervalsOverlap(ex.started_at, ex.ended_at, new_entry.started_at, new_entry.ended_at)) {
                    continue;
                }
                const inside_new = ex.started_at >= new_entry.started_at && ex.ended_at <= new_entry.ended_at;
                if (inside_new) {
                    await uow.timeEntryRepo.deleteTimeEntry(ex.id);
                    continue;
                }
                const contains_new = ex.started_at < new_entry.started_at && ex.ended_at > new_entry.ended_at;
                if (contains_new) {
                    const left_end = new_entry.started_at;
                    const right_start = new_entry.ended_at;
                    const left_dur = computeDurationSeconds(ex.started_at, left_end);
                    const right_dur = computeDurationSeconds(right_start, ex.ended_at);
                    await uow.timeEntryRepo.deleteTimeEntry(ex.id);
                    const now = new Date().toISOString();
                    if (left_dur > 0) {
                        const left: TimeEntry = {
                            ...ex,
                            id: generateId(),
                            ended_at: left_end,
                            duration_seconds: left_dur,
                            updated_at: now,
                            created_at: ex.created_at,
                        };
                        await uow.timeEntryRepo.upsertTimeEntry(left);
                        upserted.push(left);
                    }
                    if (right_dur > 0) {
                        const right: TimeEntry = {
                            ...ex,
                            id: generateId(),
                            started_at: right_start,
                            duration_seconds: right_dur,
                            updated_at: now,
                            created_at: ex.created_at,
                        };
                        await uow.timeEntryRepo.upsertTimeEntry(right);
                        upserted.push(right);
                    }
                    continue;
                }
                if (ex.ended_at > new_entry.ended_at) {
                    const next_start = new_entry.ended_at;
                    const dur = computeDurationSeconds(next_start, ex.ended_at);
                    if (dur <= 0) {
                        await uow.timeEntryRepo.deleteTimeEntry(ex.id);
                        continue;
                    }
                    const updated: TimeEntry = {
                        ...ex,
                        started_at: next_start,
                        duration_seconds: dur,
                        updated_at: new Date().toISOString(),
                    };
                    await uow.timeEntryRepo.upsertTimeEntry(updated);
                    upserted.push(updated);
                    continue;
                }
                if (ex.started_at < new_entry.started_at) {
                    const next_end = new_entry.started_at;
                    const dur = computeDurationSeconds(ex.started_at, next_end);
                    if (dur <= 0) {
                        await uow.timeEntryRepo.deleteTimeEntry(ex.id);
                        continue;
                    }
                    const updated: TimeEntry = {
                        ...ex,
                        ended_at: next_end,
                        duration_seconds: dur,
                        updated_at: new Date().toISOString(),
                    };
                    await uow.timeEntryRepo.upsertTimeEntry(updated);
                    upserted.push(updated);
                }
            }
            return upserted;
        });
    }

    private _resolveOverlapExistingFirst(new_entry: TimeEntry, existing: TimeEntry[]): TimeEntry[] {
        const sorted = [...existing].sort((a, b) => a.started_at.localeCompare(b.started_at));
        let fragments: { start: string; end: string }[] = [{ start: new_entry.started_at, end: new_entry.ended_at }];
        for (const ex of sorted) {
            if (!intervalsOverlap(ex.started_at, ex.ended_at, new_entry.started_at, new_entry.ended_at)) {
                continue;
            }
            const next: { start: string; end: string }[] = [];
            for (const seg of fragments) {
                next.push(...subtractInterval(seg.start, seg.end, ex.started_at, ex.ended_at));
            }
            fragments = next;
            if (fragments.length === 0) {
                break;
            }
        }
        const now = new Date().toISOString();
        const result: TimeEntry[] = [];
        for (let i = 0; i < fragments.length; i += 1) {
            const { start, end } = fragments[i]!;
            const dur = computeDurationSeconds(start, end);
            if (dur <= 0) {
                continue;
            }
            result.push({
                ...new_entry,
                id: fragments.length === 1 ? new_entry.id : i === 0 ? new_entry.id : generateId(),
                started_at: start,
                ended_at: end,
                duration_seconds: dur,
                updated_at: now,
            });
        }
        return result;
    }

    async updateEntry(
        id: string,
        updates: Partial<Pick<TimeEntry, 'started_at' | 'ended_at' | 'note' | 'category_id'>>,
    ): Promise<TimeEntry> {
        const existing = await this._uow.timeEntryRepo.getTimeEntryById(id);
        if (!existing) {
            throw new ValidationError(`Time entry not found: ${id}`, 'id');
        }
        if (updates.category_id !== undefined) {
            const cat = await this._uow.categoryRepo.getCategoryById(updates.category_id);
            if (!cat) {
                throw new ValidationError(`Category not found: ${updates.category_id}`, 'category_id');
            }
        }
        let started_at = existing.started_at;
        let ended_at = existing.ended_at;
        if (updates.started_at !== undefined) {
            started_at = updates.started_at;
        }
        if (updates.ended_at !== undefined) {
            ended_at = updates.ended_at;
        }
        if (updates.started_at !== undefined || updates.ended_at !== undefined) {
            if (Date.parse(ended_at) < Date.parse(started_at)) {
                throw new ValidationError('ended_at must be greater than or equal to started_at', 'ended_at');
            }
        }
        const duration_seconds =
            updates.started_at !== undefined || updates.ended_at !== undefined
                ? computeDurationSeconds(started_at, ended_at)
                : existing.duration_seconds;
        let note = existing.note;
        if (updates.note !== undefined) {
            note = sanitizeText(updates.note, MAX_NOTE_LENGTH);
        }
        const category_id = updates.category_id ?? existing.category_id;
        const now = new Date().toISOString();
        const entry: TimeEntry = {
            ...existing,
            started_at,
            ended_at,
            duration_seconds,
            note,
            category_id,
            updated_at: now,
        };
        return this._uow.transaction(async (uow) => {
            await uow.timeEntryRepo.upsertTimeEntry(entry);
            return entry;
        });
    }

    async deleteEntry(id: string): Promise<void> {
        const existing = await this._uow.timeEntryRepo.getTimeEntryById(id);
        if (!existing) {
            throw new ValidationError(`Time entry not found: ${id}`, 'id');
        }
        await this._uow.transaction(async (uow) => {
            await uow.timeEntryRepo.deleteTimeEntry(id);
        });
        this._logger?.debug('Time entry deleted', { id });
    }
}
