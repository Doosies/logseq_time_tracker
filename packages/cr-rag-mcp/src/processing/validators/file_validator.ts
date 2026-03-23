import type { StructuredFacts } from '../../types/facts.js';
import type { CommitSummary } from '../../types/summary.js';
import type { Violation } from '../../types/verification.js';

/** 알려진 소스/설정 확장자만 매칭해 console.log 등 점 표기법 오탐을 줄임 */
const KNOWN_CODE_FILE_EXTENSIONS =
    'ts|tsx|js|jsx|mjs|cjs|css|html|json|yaml|yml|md|py|go|rs|java|c|cpp|h|hpp|svelte|vue|scss|less|xml|sql|sh|bat|env|toml|ini|cfg|conf';

const FILE_PATH_RE = new RegExp(`[\\w\\-./]+\\.(?:${KNOWN_CODE_FILE_EXTENSIONS})(?![\\w])`, 'g');

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
