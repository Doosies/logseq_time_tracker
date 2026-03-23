import type { DiffSizeGate } from '../types/summary.js';
import type { CrRagConfig } from '../types/config.js';

const DEFAULT_SMALL_MAX = 500;
const DEFAULT_MEDIUM_MAX = 2000;
const TOKENS_PER_LINE = 4;
const COST_PER_INPUT_TOKEN = 0.00000015;

export function estimateDiffSize(diff_lines: string[], config?: CrRagConfig): DiffSizeGate {
    const small_max = config?.diff_size_gate?.small_max_lines ?? DEFAULT_SMALL_MAX;
    const medium_max = config?.diff_size_gate?.medium_max_lines ?? DEFAULT_MEDIUM_MAX;

    const total_lines = diff_lines.length;
    const estimated_tokens = Math.ceil(total_lines * TOKENS_PER_LINE);
    const estimated_cost_usd = estimated_tokens * COST_PER_INPUT_TOKEN;

    let tier: DiffSizeGate['tier'];
    let strategy: DiffSizeGate['strategy'];

    if (total_lines <= small_max) {
        tier = 'small';
        strategy = 'auto';
    } else if (total_lines <= medium_max) {
        tier = 'medium';
        strategy = 'split';
    } else {
        tier = 'large';
        strategy = 'confirm';
    }

    return { total_lines, estimated_tokens, estimated_cost_usd, tier, strategy };
}
