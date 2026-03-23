export interface PipelineState {
    project_id: string;
    last_processed_commit: string;
    last_run_at: string;
    total_processed: number;
    total_failed: number;
    failed_items: FailedItem[];
}

export interface FailedItem {
    type: 'commit' | 'mr';
    id: string;
    error: string;
    failed_at: string;
    retry_count: number;
}
