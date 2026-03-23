import type { StructuredFacts } from '../../types/facts.js';
import type { CommitSummary } from '../../types/summary.js';
import type { Violation } from '../../types/verification.js';

const SYMBOL_RE = /\b([A-Z]\w+|[a-z]\w+(?:(?:Error|Service|Controller|Handler|Manager|Factory|Provider)\b)|\w+\(\))/g;

export function validateSymbols(summary: CommitSummary, facts: StructuredFacts): Violation[] {
    const violations: Violation[] = [];
    const diff_symbols = new Set(facts.files.flatMap((f) => f.functions_modified));

    if (diff_symbols.size === 0) return [];

    const mentioned = summary.what.match(SYMBOL_RE) ?? [];
    for (const symbol of mentioned) {
        const clean = symbol.replace(/\(\)$/, '');
        if (clean.length < 3) continue;
        if (!diff_symbols.has(clean) && !isCloseMatch(clean, diff_symbols)) {
            violations.push({
                type: 'symbol_not_in_diff',
                detail: `요약에서 "${clean}"을 언급했지만 diff hunk에 없음`,
                severity: 'warning',
            });
        }
    }

    return violations;
}

function isCloseMatch(symbol: string, diff_symbols: Set<string>): boolean {
    return [...diff_symbols].some((s) => s.toLowerCase() === symbol.toLowerCase());
}
