export interface TimeEntry {
    id: string;
    job_id: string;
    category_id: string;
    started_at: string;
    ended_at: string;
    duration_seconds: number;
    note: string;
    is_manual: boolean;
    created_at: string;
    updated_at: string;
}

export interface TimeEntryFilter {
    job_id?: string;
    category_id?: string;
    from_date?: string;
    to_date?: string;
}
