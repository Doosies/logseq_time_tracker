import OpenAI from 'openai';

import type { CrRagConfig } from '../types/config.js';
import type { StructuredFacts } from '../types/facts.js';
import type { CommitSummary, DiffSizeGate } from '../types/summary.js';
import { estimateDiffSize } from './diff_gate.js';

const DEFAULT_SMALL_MAX_LINES = 200;
const LLM_MODEL = 'gpt-4o-mini';

const CHANGE_TYPES = new Set<CommitSummary['change_type']>([
    'bugfix',
    'feature',
    'refactor',
    'optimization',
    'chore',
    'unknown',
]);

export class LargeDiffError extends Error {
    constructor(
        public commit_hash: string,
        public gate: DiffSizeGate,
    ) {
        super(`Large diff detected: ${gate.total_lines} lines, ~$${gate.estimated_cost_usd.toFixed(4)}`);
        this.name = 'LargeDiffError';
    }
}

export interface LlmSummarizerOptions {
    /** When omitted, uses `OPENAI_API_KEY` (see OpenAI SDK defaults). */
    api_key?: string;
    /** Injected client for tests; if set, `api_key` is ignored. */
    client?: OpenAI;
    /** Defaults to gpt-4o-mini. */
    model?: string;
    config?: CrRagConfig;
}

export class LlmSummarizer {
    private readonly client: OpenAI;
    private readonly model: string;
    private readonly config: CrRagConfig | undefined;

    constructor(options: LlmSummarizerOptions = {}) {
        this.client = options.client ?? new OpenAI(options.api_key ? { apiKey: options.api_key } : undefined);
        this.model = options.model ?? LLM_MODEL;
        this.config = options.config;
    }

    async summarize(
        facts: StructuredFacts,
        diff_text: string,
    ): Promise<{ summary: CommitSummary; gate: DiffSizeGate }> {
        const diff_lines = splitDiffLines(diff_text);
        const gate = estimateDiffSize(diff_lines, this.config);

        if (gate.tier === 'large') {
            throw new LargeDiffError(facts.commit_hash, gate);
        }

        const small_max = this.config?.diff_size_gate?.small_max_lines ?? DEFAULT_SMALL_MAX_LINES;
        const effective_diff = gate.tier === 'medium' ? truncateDiff(diff_lines, small_max) : diff_text;

        const summary = await this.callLlm(facts, effective_diff);
        return { summary, gate };
    }

    private async callLlm(facts: StructuredFacts, diff_text: string): Promise<CommitSummary> {
        const user_payload = {
            structured_facts: facts,
            diff: diff_text,
        };

        const completion = await this.client.chat.completions.create({
            model: this.model,
            temperature: 0.1,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: JSON.stringify(user_payload),
                },
            ],
        });

        const raw = completion.choices[0]?.message?.content;
        if (!raw || typeof raw !== 'string') {
            throw new Error('OpenAI chat completion returned empty content');
        }

        return parseCommitSummaryJson(raw);
    }
}

export function truncateDiff(diff_lines: string[], max_lines: number): string {
    if (diff_lines.length <= max_lines) {
        return diff_lines.join('\n');
    }
    const head = diff_lines.slice(0, max_lines);
    const omitted = diff_lines.length - max_lines;
    return [...head, `[diff truncated: ${omitted} lines omitted]`].join('\n');
}

function splitDiffLines(diff_text: string): string[] {
    if (diff_text.length === 0) {
        return [];
    }
    return diff_text.split(/\r?\n/);
}

const SYSTEM_PROMPT = `You are a commit analyst. Output a single JSON object only (no markdown).

Classification for "why" (reason) — three levels:
1) Known: the commit message clearly states the motivation → set reason_known true, reason_inferred false, put the reason in "reason".
2) Inferred (technical only): the diff/message allows a plausible technical explanation (e.g. null check, API rename) → set reason_inferred true, reason_known false, and include a short technical note in "reason". In "what", you may prefix or embed segments with the tag [추론된내용] only for inferred technical points.
3) Unknown: insufficient evidence → reason_known false, reason_inferred false, reason null.

Rules:
- "what": Describe changes grounded in the diff and structured facts. Be accurate; do not invent file-level details not supported by the input.
- Never guess business/product motivations or ticket intent. If unclear, use level 3.
- "impact" and "risk_notes": technical scope only; mark uncertainty briefly if needed.
- change_type must be one of: bugfix, feature, refactor, optimization, chore, unknown.

Required JSON keys (exact names, booleans not strings):
what (string), reason_known (boolean), reason_inferred (boolean), reason (string or null),
change_type (string), impact (string), risk_notes (string or null)`;

function parseCommitSummaryJson(raw: string): CommitSummary {
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error('LLM response was not valid JSON');
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('LLM JSON must be a non-array object');
    }

    const o = parsed as Record<string, unknown>;

    const what = o['what'];
    const reason_known = o['reason_known'];
    const reason_inferred = o['reason_inferred'];
    const reason = o['reason'];
    const change_type = o['change_type'];
    const impact = o['impact'];
    const risk_notes = o['risk_notes'];

    if (typeof what !== 'string') {
        throw new Error('CommitSummary.what must be a string');
    }
    if (typeof reason_known !== 'boolean' || typeof reason_inferred !== 'boolean') {
        throw new Error('CommitSummary reason flags must be booleans');
    }
    if (reason !== null && typeof reason !== 'string') {
        throw new Error('CommitSummary.reason must be string or null');
    }
    if (typeof change_type !== 'string' || !CHANGE_TYPES.has(change_type as CommitSummary['change_type'])) {
        throw new Error('CommitSummary.change_type is invalid');
    }
    if (typeof impact !== 'string') {
        throw new Error('CommitSummary.impact must be a string');
    }
    if (risk_notes !== null && typeof risk_notes !== 'string') {
        throw new Error('CommitSummary.risk_notes must be string or null');
    }

    return {
        what,
        reason_known,
        reason_inferred,
        reason: reason as string | null,
        change_type: change_type as CommitSummary['change_type'],
        impact,
        risk_notes: risk_notes as string | null,
    };
}
