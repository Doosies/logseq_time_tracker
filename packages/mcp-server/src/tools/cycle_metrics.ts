import { execSync } from 'node:child_process';
import {
    readCycle,
    writeCycle,
    listCycleFiles,
    getNextSequence,
    generateCycleId,
    createEmptyCycle,
} from '../utils/cycle_file.js';
import type { Decision, Issue } from '../utils/cycle_file.js';

interface ToolResult {
    [key: string]: unknown;
    content: Array<{ type: 'text'; text: string }>;
}

function textResult(text: string): ToolResult {
    return { content: [{ type: 'text', text }] };
}

function getTodayDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// --- Tool Definitions ---

export const CYCLE_TOOL_DEFINITIONS = [
    {
        name: 'cycle_init',
        description: '새 작업 사이클을 초기화합니다. cycle_id를 자동 생성하고 started_at을 현재 시간으로 설정합니다.',
        inputSchema: {
            type: 'object' as const,
            properties: {
                task_type: {
                    type: 'string',
                    enum: ['feature', 'bugfix', 'refactor', 'docs', 'hotfix', 'chore'],
                    description: '태스크 유형',
                },
                task_description: {
                    type: 'string',
                    description: '태스크 설명',
                },
            },
            required: ['task_type', 'task_description'],
        },
    },
    {
        name: 'cycle_get',
        description: '특정 사이클의 전체 데이터를 조회합니다.',
        inputSchema: {
            type: 'object' as const,
            properties: {
                cycle_id: {
                    type: 'string',
                    description: '사이클 ID (YYYY-MM-DD-NNN)',
                },
            },
            required: ['cycle_id'],
        },
    },
    {
        name: 'cycle_update',
        description: '사이클 데이터를 부분 업데이트합니다. 배열 필드는 append, 객체 필드는 merge됩니다.',
        inputSchema: {
            type: 'object' as const,
            properties: {
                cycle_id: {
                    type: 'string',
                    description: '사이클 ID (YYYY-MM-DD-NNN)',
                },
                workflow_append: {
                    type: 'string',
                    description: 'workflow 배열에 추가할 에이전트명',
                },
                agent_name: {
                    type: 'string',
                    description: '업데이트할 에이전트 이름',
                },
                agent_outcome: {
                    type: 'string',
                    description: '에이전트 결과 (success, failure, skipped)',
                },
                decision: {
                    type: 'object',
                    description: '추가할 결정사항',
                    properties: {
                        phase: { type: 'string' },
                        decision: { type: 'string' },
                        rationale: { type: 'string' },
                        alternatives: { type: 'array', items: { type: 'string' } },
                    },
                    required: ['phase', 'decision', 'rationale', 'alternatives'],
                },
                issue: {
                    type: 'object',
                    description: '추가할 이슈',
                    properties: {
                        phase: { type: 'string' },
                        issue: { type: 'string' },
                        resolution: { type: 'string' },
                        impact: { type: 'string' },
                    },
                    required: ['phase', 'issue', 'resolution', 'impact'],
                },
                quality_gates: {
                    type: 'object',
                    description: '업데이트할 품질 게이트 (키-값 쌍)',
                },
                notes: {
                    type: 'string',
                    description: '메모 (기존 값을 대체)',
                },
            },
            required: ['cycle_id'],
        },
    },
    {
        name: 'cycle_complete',
        description:
            '사이클을 완료 처리합니다. completed_at을 현재 시간으로 설정하고 git diff로 files_changed를 수집합니다.',
        inputSchema: {
            type: 'object' as const,
            properties: {
                cycle_id: {
                    type: 'string',
                    description: '사이클 ID (YYYY-MM-DD-NNN)',
                },
                success: {
                    type: 'boolean',
                    description: '성공 여부',
                },
                failure_reason: {
                    type: 'string',
                    description: '실패 사유 (실패 시)',
                },
            },
            required: ['cycle_id', 'success'],
        },
    },
    {
        name: 'cycle_list',
        description: '특정 날짜의 사이클 목록을 조회합니다.',
        inputSchema: {
            type: 'object' as const,
            properties: {
                date: {
                    type: 'string',
                    description: '조회할 날짜 (YYYY-MM-DD, 기본: 오늘)',
                },
            },
        },
    },
    {
        name: 'cycle_summary',
        description: '특정 날짜의 사이클 통계를 집계합니다.',
        inputSchema: {
            type: 'object' as const,
            properties: {
                date: {
                    type: 'string',
                    description: '조회할 날짜 (YYYY-MM-DD, 기본: 오늘)',
                },
            },
        },
    },
];

// --- Handlers ---

export async function handleCycleInit(args: Record<string, unknown>, cycles_dir: string): Promise<ToolResult> {
    const task_type = args['task_type'] as string;
    const task_description = args['task_description'] as string;

    if (!task_type || !task_description) {
        throw new Error('task_type과 task_description은 필수입니다');
    }

    const date = getTodayDate();
    const sequence = await getNextSequence(cycles_dir, date);
    const cycle_id = generateCycleId(date, sequence);
    const cycle = createEmptyCycle(cycle_id, task_type, task_description);

    await writeCycle(cycles_dir, cycle_id, cycle);

    return textResult(`사이클 초기화 완료: ${cycle_id}\nstarted_at: ${cycle.started_at}`);
}

/** 지정한 cycle_id의 사이클 JSON 전체를 텍스트로 반환합니다. */
export async function handleCycleGet(args: Record<string, unknown>, cycles_dir: string): Promise<ToolResult> {
    const cycle_id = args['cycle_id'] as string;
    if (!cycle_id) throw new Error('cycle_id는 필수입니다');

    const cycle = await readCycle(cycles_dir, cycle_id);
    return textResult(JSON.stringify(cycle, null, 2));
}

export async function handleCycleUpdate(args: Record<string, unknown>, cycles_dir: string): Promise<ToolResult> {
    const cycle_id = args['cycle_id'] as string;
    if (!cycle_id) throw new Error('cycle_id는 필수입니다');

    const cycle = await readCycle(cycles_dir, cycle_id);
    const changes: string[] = [];

    if (args['workflow_append']) {
        const value = args['workflow_append'] as string;
        cycle.workflow.push(value);
        changes.push(`workflow += ${value}`);
    }

    if (args['agent_name'] && args['agent_outcome']) {
        const name = args['agent_name'] as string;
        const outcome = args['agent_outcome'] as string;
        if (cycle.agents[name]) {
            cycle.agents[name].outcome = outcome;
        } else {
            cycle.agents[name] = { outcome, retries: 0, errors: [] };
        }
        changes.push(`agents.${name}.outcome = ${outcome}`);
    }

    if (args['decision']) {
        const decision = args['decision'] as Decision;
        cycle.decisions.push(decision);
        changes.push(`decisions += "${decision.decision}"`);
    }

    if (args['issue']) {
        const issue = args['issue'] as Issue;
        cycle.issues_encountered.push(issue);
        changes.push(`issues += "${issue.issue}"`);
    }

    if (args['quality_gates']) {
        const gates = args['quality_gates'] as Record<string, string | null>;
        Object.assign(cycle.quality_gates, gates);
        changes.push(`quality_gates updated: ${Object.keys(gates).join(', ')}`);
    }

    if (args['notes'] !== undefined) {
        cycle.notes = args['notes'] as string;
        changes.push('notes updated');
    }

    await writeCycle(cycles_dir, cycle_id, cycle);

    return textResult(`사이클 ${cycle_id} 업데이트 완료:\n${changes.join('\n')}`);
}

export async function handleCycleComplete(args: Record<string, unknown>, cycles_dir: string): Promise<ToolResult> {
    const cycle_id = args['cycle_id'] as string;
    const success = args['success'] as boolean;

    if (!cycle_id) throw new Error('cycle_id는 필수입니다');
    if (typeof success !== 'boolean') throw new Error('success는 boolean 필수입니다');

    const cycle = await readCycle(cycles_dir, cycle_id);

    cycle.completed_at = new Date().toISOString();
    cycle.success = success;

    if (args['failure_reason']) {
        cycle.failure_reason = args['failure_reason'] as string;
    }

    try {
        const diff_output = execSync('git diff --name-status HEAD~1', {
            encoding: 'utf-8',
            timeout: 10000,
        }).trim();

        if (diff_output) {
            for (const line of diff_output.split('\n')) {
                const [status, ...file_parts] = line.split('\t');
                const file_path = file_parts.join('\t');
                if (!file_path) continue;

                if (status?.startsWith('A')) {
                    cycle.files_changed.created.push(file_path);
                } else if (status?.startsWith('M') || status?.startsWith('R')) {
                    cycle.files_changed.modified.push(file_path);
                } else if (status?.startsWith('D')) {
                    cycle.files_changed.deleted.push(file_path);
                }
            }
        }
    } catch {
        // git diff 실패 시 files_changed는 비워둠
    }

    await writeCycle(cycles_dir, cycle_id, cycle);

    return textResult(`사이클 ${cycle_id} 완료 처리:\nsuccess: ${success}\ncompleted_at: ${cycle.completed_at}`);
}

export async function handleCycleList(args: Record<string, unknown>, cycles_dir: string): Promise<ToolResult> {
    const date = (args['date'] as string) || getTodayDate();
    const cycles = await listCycleFiles(cycles_dir, date);

    if (cycles.length === 0) {
        return textResult(`${date}에 해당하는 사이클이 없습니다.`);
    }

    const lines = [`${date} 사이클 목록 (${cycles.length}개):`, ''];
    for (const cycle_id of cycles) {
        try {
            const cycle = await readCycle(cycles_dir, cycle_id);
            const status = cycle.success === true ? '✅' : cycle.success === false ? '❌' : '⏳';
            lines.push(`${status} ${cycle_id}: ${cycle.task_type} - ${cycle.task_description}`);
        } catch {
            lines.push(`⚠️ ${cycle_id}: (읽기 실패)`);
        }
    }

    return textResult(lines.join('\n'));
}

export async function handleCycleSummary(args: Record<string, unknown>, cycles_dir: string): Promise<ToolResult> {
    const date = (args['date'] as string) || getTodayDate();
    const cycle_ids = await listCycleFiles(cycles_dir, date);

    if (cycle_ids.length === 0) {
        return textResult(`${date}에 해당하는 사이클이 없습니다.`);
    }

    let total = 0;
    let successful = 0;
    let failed = 0;
    let in_progress = 0;
    const type_counts: Record<string, number> = {};

    for (const cycle_id of cycle_ids) {
        try {
            const cycle = await readCycle(cycles_dir, cycle_id);
            total++;

            if (cycle.success === true) successful++;
            else if (cycle.success === false) failed++;
            else in_progress++;

            type_counts[cycle.task_type] = (type_counts[cycle.task_type] || 0) + 1;
        } catch {
            total++;
        }
    }

    const type_summary = Object.entries(type_counts)
        .map(([t, c]) => `  ${t}: ${c}개`)
        .join('\n');

    return textResult(
        [
            `📊 ${date} 사이클 통계`,
            '',
            `전체: ${total}개`,
            `  ✅ 성공: ${successful}개`,
            `  ❌ 실패: ${failed}개`,
            `  ⏳ 진행 중: ${in_progress}개`,
            '',
            '태스크 유형별:',
            type_summary,
        ].join('\n'),
    );
}
