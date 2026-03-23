import type { CommitSummary } from '../../types/summary.js';
import type { Violation } from '../../types/verification.js';

const INFERENCE_TAG_RE = /\[추론된내용\](.*?)(?=\[추론된내용\]|$)/gs;
const BUSINESS_KEYWORDS = ['기획', '요청', '사용자 피드백', 'PM', '기획팀', '요구사항'];

export function validateInferences(summary: CommitSummary): {
    violations: Violation[];
    total: number;
    valid: number;
} {
    const violations: Violation[] = [];
    const inferences = [...summary.what.matchAll(INFERENCE_TAG_RE)];

    if (summary.reason_inferred && inferences.length === 0) {
        violations.push({
            type: 'unsupported_inference',
            detail: 'reason_inferred=true이지만 [추론된내용] 태그가 없음',
            severity: 'error',
        });
    }

    if (!summary.reason_inferred && inferences.length > 0) {
        violations.push({
            type: 'unsupported_inference',
            detail: 'reason_inferred=false이지만 [추론된내용] 태그가 존재',
            severity: 'error',
        });
    }

    for (const match of inferences) {
        const text = match[1]?.trim() ?? '';
        for (const keyword of BUSINESS_KEYWORDS) {
            if (text.includes(keyword)) {
                violations.push({
                    type: 'business_speculation',
                    detail: `추론에 비즈니스 추측 포함: "${keyword}"`,
                    severity: 'error',
                });
            }
        }
    }

    return {
        violations,
        total: inferences.length,
        valid: inferences.length - violations.filter((v) => v.severity === 'error').length,
    };
}
