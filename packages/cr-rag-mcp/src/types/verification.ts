export type ViolationType =
    | 'file_not_in_diff'
    | 'symbol_not_in_diff'
    | 'direction_mismatch'
    | 'scale_mismatch'
    | 'unsupported_inference'
    | 'business_speculation';

export interface Violation {
    type: ViolationType;
    detail: string;
    severity: 'error' | 'warning';
}

export interface VerificationResult {
    passed: boolean;
    violations: Violation[];
    confidence_score: number; // 0.0 ~ 1.0
    inference_validity: {
        total_inferences: number;
        valid_inferences: number;
        invalid_inferences: number;
    };
    verified_at: string;
}
