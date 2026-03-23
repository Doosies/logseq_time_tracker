export interface CommitDocumentMetadata {
    doc_type: 'commit';
    commit_hash: string;
    commit_short: string;
    project_id: string;
    branch: string;
    author: string;
    committed_at: string;
    change_type: string;
    conventional_type?: string;
    files_changed: number;
    total_additions: number;
    total_deletions: number;
    file_paths: string[];
    symbols_modified: string[];
    file_roles: string[];
    reason_known: boolean;
    reason_inferred: boolean;
    reason_supplemented: boolean;
    confidence_score: number;
    verified_at: string;
    impact: string;
    risk_notes?: string;
}
