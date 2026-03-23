export interface ProcessedSearchResult {
    content: string;
    score: number;
    commit_hash: string;
    date: string;
    file_paths: string[];
    reason_known: boolean;
    reason_inferred: boolean;
    change_type: string;
    author: string;
    confidence_score: number;
    impact: string;
    risk_notes?: string;
}

export interface PostProcessedResult {
    results: ProcessedSearchResult[];
    metadata: {
        total_raw_results: number;
        after_dedup: number;
        after_filter: number;
        time_range: { earliest: string; latest: string };
    };
}
