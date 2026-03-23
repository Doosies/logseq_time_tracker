import type { StructuredFacts } from '../../types/facts.js';
import type { CommitSummary } from '../../types/summary.js';
import type { Violation } from '../../types/verification.js';

const FILE_PATH_RE = /[\w\-./]+\.\w+/g;

export function validateFiles(summary: CommitSummary, facts: StructuredFacts): Violation[] {
    const violations: Violation[] = [];
    const diff_files = new Set(facts.files.map((f) => f.path));

    const mentioned_files = summary.what.match(FILE_PATH_RE) ?? [];
    for (const file of mentioned_files) {
        if (!diff_files.has(file) && !isPartialMatch(file, diff_files)) {
            violations.push({
                type: 'file_not_in_diff',
                detail: `요약에서 "${file}"을 언급했지만 diff에 없음`,
                severity: 'error',
            });
        }
    }

    return violations;
}

function isPartialMatch(mentioned: string, diff_files: Set<string>): boolean {
    return [...diff_files].some((f) => f.endsWith(mentioned) || mentioned.endsWith(f));
}
