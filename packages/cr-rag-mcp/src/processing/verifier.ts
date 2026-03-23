import type { StructuredFacts } from '../types/facts.js';
import type { CommitSummary } from '../types/summary.js';
import type { VerificationResult } from '../types/verification.js';
import { validateFiles } from './validators/file_validator.js';
import { validateSymbols } from './validators/symbol_validator.js';
import { validateInferences } from './validators/inference_validator.js';

export function verifyCommitSummary(summary: CommitSummary, facts: StructuredFacts): VerificationResult {
    const file_violations = validateFiles(summary, facts);
    const symbol_violations = validateSymbols(summary, facts);
    const { violations: inference_violations, total, valid } = validateInferences(summary);

    const all_violations = [...file_violations, ...symbol_violations, ...inference_violations];
    const errors = all_violations.filter((v) => v.severity === 'error');

    const base_score = errors.length === 0 ? 1.0 : 0.0;
    const warning_penalty = all_violations.filter((v) => v.severity === 'warning').length * 0.1;
    const confidence_score = Math.max(0, base_score - warning_penalty);

    return {
        passed: errors.length === 0,
        violations: all_violations,
        confidence_score,
        inference_validity: {
            total_inferences: total,
            valid_inferences: valid,
            invalid_inferences: total - valid,
        },
        verified_at: new Date().toISOString(),
    };
}
