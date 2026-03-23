import type { DiffSizeGate } from '../types/summary.js';
import type { CrRagConfig } from '../types/config.js';

const DEFAULT_NORMAL_MAX = 5000;
const TOKENS_PER_LINE = 4;
const COST_PER_INPUT_TOKEN = 0.00000015;

export function estimateDiffSize(diff_lines: string[], config?: CrRagConfig): DiffSizeGate {
    const normal_max = config?.diff_size_gate?.normal_max_lines ?? DEFAULT_NORMAL_MAX;

    const total_lines = diff_lines.length;
    const estimated_tokens = Math.ceil(total_lines * TOKENS_PER_LINE);
    const estimated_cost_usd = estimated_tokens * COST_PER_INPUT_TOKEN;

    let tier: DiffSizeGate['tier'];
    let strategy: DiffSizeGate['strategy'];

    if (total_lines <= normal_max) {
        tier = 'normal';
        strategy = 'full';
    } else {
        tier = 'oversized';
        strategy = 'sample';
    }

    return { total_lines, estimated_tokens, estimated_cost_usd, tier, strategy };
}
