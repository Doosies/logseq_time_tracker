import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';

export interface AgentRecord {
    outcome: string;
    retries: number;
    errors: string[];
}

export interface Decision {
    phase: string;
    decision: string;
    rationale: string;
    alternatives: string[];
}

export interface Issue {
    phase: string;
    issue: string;
    resolution: string;
    impact: string;
}

export interface FilesChanged {
    created: string[];
    modified: string[];
    deleted: string[];
}

export interface QualityGates {
    [key: string]: string | null;
}

export interface CycleData {
    cycle_id: string;
    task_type: string;
    task_description: string;
    started_at: string;
    completed_at: string | null;
    success: boolean | null;
    failure_reason: string | null;
    workflow: string[];
    agents: Record<string, AgentRecord>;
    files_changed: FilesChanged;
    quality_gates: QualityGates;
    decisions: Decision[];
    issues_encountered: Issue[];
    notes: string;
}

const DEFAULT_AGENTS: Record<string, AgentRecord> = {
    planner: { outcome: 'pending', retries: 0, errors: [] },
    developer: { outcome: 'pending', retries: 0, errors: [] },
    qa: { outcome: 'pending', retries: 0, errors: [] },
    security: { outcome: 'pending', retries: 0, errors: [] },
    docs: { outcome: 'pending', retries: 0, errors: [] },
    'system-improvement': { outcome: 'pending', retries: 0, errors: [] },
};

const DEFAULT_QUALITY_GATES: QualityGates = {
    readlints: null,
    type_check: null,
    lint: null,
    test: null,
    build: null,
    security: null,
};

export async function readCycle(cycles_dir: string, cycle_id: string): Promise<CycleData> {
    const file_path = path.join(cycles_dir, `${cycle_id}.json`);
    const content = await readFile(file_path, 'utf-8');
    return JSON.parse(content) as CycleData;
}

export async function writeCycle(cycles_dir: string, cycle_id: string, data: CycleData): Promise<void> {
    await mkdir(cycles_dir, { recursive: true });
    const file_path = path.join(cycles_dir, `${cycle_id}.json`);
    await writeFile(file_path, JSON.stringify(data, null, 4) + '\n', 'utf-8');
}

export async function listCycleFiles(cycles_dir: string, date: string): Promise<string[]> {
    let entries: string[];
    try {
        entries = await readdir(cycles_dir);
    } catch {
        return [];
    }

    const prefix = `${date}-`;
    return entries
        .filter((f) => f.startsWith(prefix) && f.endsWith('.json'))
        .map((f) => f.replace(/\.json$/, ''))
        .sort();
}

export async function getNextSequence(cycles_dir: string, date: string): Promise<number> {
    const existing = await listCycleFiles(cycles_dir, date);
    if (existing.length === 0) return 1;

    let max_seq = 0;
    for (const id of existing) {
        const parts = id.split('-');
        const last_part = parts[parts.length - 1] ?? '0';
        const seq = parseInt(last_part, 10);
        if (!isNaN(seq) && seq > max_seq) {
            max_seq = seq;
        }
    }
    return max_seq + 1;
}

export function generateCycleId(date: string, sequence: number): string {
    return `${date}-${String(sequence).padStart(3, '0')}`;
}

export function createEmptyCycle(cycle_id: string, task_type: string, description: string): CycleData {
    return {
        cycle_id,
        task_type,
        task_description: description,
        started_at: new Date().toISOString(),
        completed_at: null,
        success: null,
        failure_reason: null,
        workflow: [],
        agents: JSON.parse(JSON.stringify(DEFAULT_AGENTS)),
        files_changed: { created: [], modified: [], deleted: [] },
        quality_gates: { ...DEFAULT_QUALITY_GATES },
        decisions: [],
        issues_encountered: [],
        notes: '',
    };
}
