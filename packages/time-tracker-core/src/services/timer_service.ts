import type { ILogger } from '../adapters/logger';
import type { IUnitOfWork } from '../adapters/storage/unit_of_work';
import type { Job } from '../types/job';
import type { Category } from '../types/category';
import type { TimeEntry } from '../types/time_entry';
import type { ActiveTimerState } from '../types/settings';
import type { IDisposable } from '../types/disposable';
import type { IJobService } from './job_service';
import { TimerError } from '../errors';
import { generateId, getElapsedMs, sanitizeText } from '../utils';
import { MAX_REASON_LENGTH, MAX_NOTE_LENGTH, MAX_TITLE_LENGTH, TIMER_BACKUP_INTERVAL_MS } from '../constants/config';

export interface ITimerService extends IDisposable {
    start(job: Job, category: Category, reason?: string): Promise<void>;
    pause(reason: string): Promise<void>;
    resume(reason: string): Promise<void>;
    stop(reason: string): Promise<TimeEntry | null>;
    cancel(reason: string): Promise<TimeEntry | null>;
    getActiveJob(): Job | null;
    /** Persists active timer settings (e.g. `beforeunload`). */
    flushBeforeUnload(): Promise<void>;
    dispose(): void;
}

function clampNote(note: string): string {
    if (note.length <= MAX_NOTE_LENGTH) {
        return note;
    }
    return note.slice(0, MAX_NOTE_LENGTH);
}

export class TimerService implements ITimerService {
    private _active_job: Job | null = null;
    private _active_category: Category | null = null;
    private _current_segment_start: string | null = null;
    private _accumulated_ms = 0;
    private _is_paused = false;
    private _backup_interval: ReturnType<typeof setInterval> | null = null;
    private _session_started_at: string | null = null;

    constructor(
        private readonly _uow: IUnitOfWork,
        private readonly _job_service: IJobService,
        private readonly _logger?: ILogger,
    ) {}

    getActiveJob(): Job | null {
        return this._active_job;
    }

    async flushBeforeUnload(): Promise<void> {
        try {
            if (!this._active_job || !this._active_category) {
                return;
            }
            await this.persistActiveTimerState();
        } catch (e) {
            this._logger?.warn('flushBeforeUnload failed', { error: String(e) });
        }
    }

    dispose(): void {
        this.clearBackupInterval();
        void this._uow.settingsRepo.deleteSetting('active_timer');
        this._active_job = null;
        this._active_category = null;
        this._current_segment_start = null;
        this._accumulated_ms = 0;
        this._is_paused = false;
        this._session_started_at = null;
    }

    async start(job: Job, category: Category, reason?: string): Promise<void> {
        const safe_title = job.title.length > MAX_TITLE_LENGTH ? job.title.slice(0, MAX_TITLE_LENGTH) : job.title;
        const default_switch_label = `작업 전환: ${safe_title}`;
        const pause_reason = reason !== undefined ? sanitizeText(reason, MAX_REASON_LENGTH) : default_switch_label;
        const progress_reason = reason !== undefined ? sanitizeText(reason, MAX_REASON_LENGTH) : default_switch_label;

        if (this._active_job?.id === job.id) {
            this._active_category = category;
            await this.persistActiveTimerState();
            this.ensureBackupInterval();
            return;
        }

        if (this._active_job && this._active_category) {
            await this.flushSwitchAwayFromActiveJob(pause_reason);
        }

        if (job.status === 'completed' || job.status === 'cancelled') {
            await this._job_service.transitionStatus(job.id, 'pending', progress_reason);
        }

        await this._job_service.transitionStatus(job.id, 'in_progress', progress_reason);

        const now = new Date().toISOString();
        this._active_job = job;
        this._active_category = category;
        this._accumulated_ms = 0;
        this._current_segment_start = now;
        this._is_paused = false;
        this._session_started_at = now;

        await this.persistActiveTimerState();
        this.ensureBackupInterval();
    }

    async pause(reason: string): Promise<void> {
        if (!this._active_job) {
            throw new TimerError('No active timer');
        }
        if (this._is_paused) {
            throw new TimerError('Timer is already paused');
        }
        if (!this._current_segment_start) {
            throw new TimerError('Invalid timer state');
        }
        const reason_sanitized = sanitizeText(reason, MAX_REASON_LENGTH);
        this._accumulated_ms += Date.now() - new Date(this._current_segment_start).getTime();
        this._current_segment_start = null;
        this._is_paused = true;
        await this._job_service.transitionStatus(this._active_job.id, 'paused', reason_sanitized);
        await this.persistActiveTimerState();
    }

    async resume(reason: string): Promise<void> {
        if (!this._active_job) {
            throw new TimerError('No active timer');
        }
        if (!this._is_paused) {
            throw new TimerError('Timer is not paused');
        }
        const reason_sanitized = sanitizeText(reason, MAX_REASON_LENGTH);
        const now = new Date().toISOString();
        this._current_segment_start = now;
        this._is_paused = false;
        await this._job_service.transitionStatus(this._active_job.id, 'in_progress', reason_sanitized);
        await this.persistActiveTimerState();
    }

    async stop(reason: string): Promise<TimeEntry | null> {
        if (!this._active_job || !this._active_category) {
            throw new TimerError('No active timer');
        }
        const reason_sanitized = sanitizeText(reason, MAX_REASON_LENGTH);
        const duration_ms = getElapsedMs(this._accumulated_ms, this._current_segment_start, this._is_paused);
        const duration_seconds = Math.floor(duration_ms / 1000);
        const job = this._active_job;
        const category = this._active_category;
        const now = new Date().toISOString();
        let entry: TimeEntry | null = null;

        if (duration_seconds > 0) {
            entry = {
                id: generateId(),
                job_id: job.id,
                category_id: category.id,
                started_at: this._session_started_at ?? now,
                ended_at: now,
                duration_seconds,
                note: '',
                is_manual: false,
                created_at: now,
                updated_at: now,
            };
            await this._uow.timeEntryRepo.upsertTimeEntry(entry);
            await this._job_service.transitionStatus(job.id, 'completed', reason_sanitized);
        } else {
            await this._job_service.transitionStatus(job.id, 'paused', reason_sanitized);
        }

        await this.fullCleanup();
        return entry;
    }

    async cancel(reason: string): Promise<TimeEntry | null> {
        if (!this._active_job || !this._active_category) {
            throw new TimerError('No active timer');
        }
        const reason_sanitized = sanitizeText(reason, MAX_REASON_LENGTH);
        const duration_ms = getElapsedMs(this._accumulated_ms, this._current_segment_start, this._is_paused);
        const duration_seconds = Math.floor(duration_ms / 1000);
        const job = this._active_job;
        const category = this._active_category;
        const now = new Date().toISOString();
        let entry: TimeEntry | null = null;

        if (duration_seconds > 0) {
            const note = clampNote(`[cancelled] ${reason_sanitized}`);
            entry = {
                id: generateId(),
                job_id: job.id,
                category_id: category.id,
                started_at: this._session_started_at ?? now,
                ended_at: now,
                duration_seconds,
                note,
                is_manual: false,
                created_at: now,
                updated_at: now,
            };
            await this._uow.timeEntryRepo.upsertTimeEntry(entry);
        }

        await this._job_service.transitionStatus(job.id, 'cancelled', reason_sanitized);
        await this.fullCleanup();
        return entry;
    }

    private async flushSwitchAwayFromActiveJob(pause_reason: string): Promise<void> {
        const old_job = this._active_job!;
        const old_category = this._active_category!;
        const duration_ms = getElapsedMs(this._accumulated_ms, this._current_segment_start, this._is_paused);
        const duration_seconds = Math.floor(duration_ms / 1000);
        const now = new Date().toISOString();

        if (duration_seconds > 0) {
            const entry: TimeEntry = {
                id: generateId(),
                job_id: old_job.id,
                category_id: old_category.id,
                started_at: this._session_started_at ?? now,
                ended_at: now,
                duration_seconds,
                note: '',
                is_manual: false,
                created_at: now,
                updated_at: now,
            };
            await this._uow.timeEntryRepo.upsertTimeEntry(entry);
        }

        if (!this._is_paused) {
            await this._job_service.transitionStatus(old_job.id, 'paused', pause_reason);
        }

        this.clearBackupInterval();
        await this._uow.settingsRepo.deleteSetting('active_timer');
        this._active_job = null;
        this._active_category = null;
        this._current_segment_start = null;
        this._accumulated_ms = 0;
        this._is_paused = false;
        this._session_started_at = null;
    }

    private async persistActiveTimerState(): Promise<void> {
        if (!this._active_job || !this._active_category) {
            return;
        }
        const now = new Date().toISOString();
        const state: ActiveTimerState = {
            version: 1,
            job_id: this._active_job.id,
            category_id: this._active_category.id,
            started_at: this._current_segment_start ?? now,
            is_paused: this._is_paused,
            accumulated_ms: this._accumulated_ms,
        };
        if (this._is_paused) {
            state.paused_at = now;
        }
        await this._uow.settingsRepo.setSetting('active_timer', state);
    }

    private clearBackupInterval(): void {
        if (this._backup_interval) {
            clearInterval(this._backup_interval);
            this._backup_interval = null;
        }
    }

    private ensureBackupInterval(): void {
        if (this._backup_interval) {
            return;
        }
        this._backup_interval = setInterval(() => {
            void this.backupTick();
        }, TIMER_BACKUP_INTERVAL_MS);
    }

    private async backupTick(): Promise<void> {
        try {
            if (!this._active_job || !this._active_category) {
                return;
            }
            await this.persistActiveTimerState();
        } catch (e) {
            this._logger?.warn('Timer backup tick failed', { error: String(e) });
        }
    }

    private async fullCleanup(): Promise<void> {
        this.clearBackupInterval();
        await this._uow.settingsRepo.deleteSetting('active_timer');
        this._active_job = null;
        this._active_category = null;
        this._current_segment_start = null;
        this._accumulated_ms = 0;
        this._is_paused = false;
        this._session_started_at = null;
    }
}
