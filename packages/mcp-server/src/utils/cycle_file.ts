import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';

/** 사이클 JSON의 단일 에이전트 실행 기록. */
export interface AgentRecord {
    outcome: string;
    retries: number;
    errors: string[];
}

/** 기록할 결정사항(단계·근거·대안). */
export interface Decision {
    phase: string;
    decision: string;
    rationale: string;
    alternatives: string[];
}

/** 기록할 이슈(단계·해결·영향도). */
export interface Issue {
    phase: string;
    issue: string;
    resolution: string;
    impact: string;
}

/** 완료 시점에 수집하는 변경 파일 분류(추가/수정/삭제). */
export interface FilesChanged {
    created: string[];
    modified: string[];
    deleted: string[];
}

/** 품질 게이트 단계별 통과 여부(null 미실행). */
export interface QualityGates {
    [key: string]: string | null;
}

/** 사이클 메트릭 JSON 한 건의 전체 스키마. */
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

/** cycles_dir에서 `{cycle_id}.json`을 읽어 파싱합니다. */
export async function readCycle(cycles_dir: string, cycle_id: string): Promise<CycleData> {
    const file_path = path.join(cycles_dir, `${cycle_id}.json`);
    const content = await readFile(file_path, 'utf-8');
    return JSON.parse(content) as CycleData;
}

/** 디렉터리를 보장한 뒤 사이클 JSON을 4칸 들여쓰기로 저장합니다. */
export async function writeCycle(cycles_dir: string, cycle_id: string, data: CycleData): Promise<void> {
    await mkdir(cycles_dir, { recursive: true });
    const file_path = path.join(cycles_dir, `${cycle_id}.json`);
    await writeFile(file_path, JSON.stringify(data, null, 4) + '\n', 'utf-8');
}

/** 해당 날짜 접두(`YYYY-MM-DD-`)의 사이클 ID 목록을 정렬해 반환합니다. */
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

/** 같은 날짜에 이미 있는 사이클 시퀀스 최댓값+1을 반환합니다. */
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

/** `YYYY-MM-DD-NNN` 형식의 사이클 ID 문자열을 만듭니다. */
export function generateCycleId(date: string, sequence: number): string {
    return `${date}-${String(sequence).padStart(3, '0')}`;
}

/** 기본 agents·quality_gates·빈 배열로 초기화된 새 CycleData 객체를 반환합니다. */
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
