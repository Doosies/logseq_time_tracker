import type { StatusKind } from './job_status';

export interface JobHistory {
    id: string;
    job_id: string;
    from_status: StatusKind | null;
    to_status: StatusKind;
    reason: string;
    occurred_at: string;
    created_at: string;
}

export interface HistoryFilter {
    job_id?: string;
    from_date?: string;
    to_date?: string;
}
