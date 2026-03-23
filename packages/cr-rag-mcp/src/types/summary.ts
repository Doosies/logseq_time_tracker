export interface CommitSummary {
    /** Diff 기반 설명. 기술적 추론 시 `[추론된내용]` 태그 포함 가능. */
    what: string;
    reason_known: boolean;
    reason_inferred: boolean;
    reason: string | null;
    change_type: 'bugfix' | 'feature' | 'refactor' | 'optimization' | 'chore' | 'unknown';
    impact: string;
    risk_notes: string | null;
}

export interface DiffSizeGate {
    total_lines: number;
    estimated_tokens: number;
    estimated_cost_usd: number;
    tier: 'normal' | 'oversized';
    strategy: 'full' | 'sample';
}

export interface ReasonSupplement {
    commit_hash: string;
    reason: string;
    supplemented_by: string;
    supplemented_at: string;
}
