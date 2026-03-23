import simpleGit, { DiffNameStatus } from 'simple-git';
import type {
    DiffResult,
    DiffResultBinaryFile,
    DiffResultNameStatusFile,
    DiffResultTextFile,
    LogOptions,
    LogResult,
    SimpleGit,
} from 'simple-git';

import type { RawCommit, RawDiff, RawDiffFile } from '../types/git.js';

/** `git log` 커스텀 포맷 필드 (simple-git `log({ format })`와 정합) */
interface LogFormatFields {
    hash: string;
    short_hash: string;
    author: string;
    date: string;
    subject: string;
    body: string;
}

/** simple-git `log({ format })`와 동일한 필드명 — 값은 `git log --pretty` 스펙 문자열 */
const GIT_LOG_FORMAT: LogFormatFields = {
    hash: '%H',
    short_hash: '%h',
    author: '%an <%ae>',
    date: '%aI',
    subject: '%s',
    body: '%b',
};

export const EXCLUDED_PATTERNS = [
    /\.min\.(js|css)$/,
    /package-lock\.json$/,
    /pnpm-lock\.yaml$/,
    /yarn\.lock$/,
    /\.svg$/,
    /\.png$/,
    /\.jpg$/,
    /\.ico$/,
    /dist\//,
    /node_modules\//,
];

export function shouldSkipFile(path: string): boolean {
    return EXCLUDED_PATTERNS.some((pattern) => pattern.test(path));
}

/**
 * 커밋 수집 옵션.
 * - 벌크: `since`·`single_hash` 없음
 * - 증분: `since`만 지정 (`since..HEAD`, `symmetric: false`)
 * - 단건: `single_hash` 지정
 */
export interface ListCommitsOptions {
    max_count?: number;
    single_hash?: string;
    /** `git log --since` (ISO 날짜 문자열). `since`(커밋 앵커)가 없을 때 증분 콜드 스타트 등에 사용 */
    since_iso_date?: string;
}

function is_name_status_file(
    f: DiffResultTextFile | DiffResultBinaryFile | DiffResultNameStatusFile,
): f is DiffResultNameStatusFile {
    return 'status' in f && f.status !== undefined;
}

function map_name_status_to_raw(status: DiffNameStatus): 'added' | 'modified' | 'deleted' | 'renamed' {
    switch (status) {
        case DiffNameStatus.ADDED:
            return 'added';
        case DiffNameStatus.DELETED:
            return 'deleted';
        case DiffNameStatus.RENAMED:
            return 'renamed';
        case DiffNameStatus.COPIED:
            return 'modified';
        default:
            return 'modified';
    }
}

function extract_new_path_from_chunk(chunk: string): string | null {
    const lines = chunk.split('\n');
    for (const line of lines) {
        if (line.startsWith('+++ ')) {
            if (line.includes('/dev/null')) {
                continue;
            }
            const rest = line.includes('\t') ? line.split('\t')[0] : line;
            if (!rest) {
                continue;
            }
            const m = rest.match(/^\+\+\+ [Bb]\/(.+)$/);
            if (m?.[1]) {
                return m[1].trim();
            }
        }
    }
    const first = lines[0];
    if (!first?.startsWith('diff --git ')) {
        return null;
    }
    const m = first.match(/\bb\/(.+)$/);
    return m?.[1] ? m[1].trim() : null;
}

/**
 * `git diff` 출력을 파일 단위로 분할. 키는 새 경로(renamed 시 대상 경로).
 */
function split_unified_diff_by_file(patch: string): Map<string, string> {
    const map = new Map<string, string>();
    if (!patch.trim()) {
        return map;
    }
    const segments = patch.split(/\n(?=diff --git )/);
    for (const seg of segments) {
        const trimmed = seg.trimStart();
        if (!trimmed.startsWith('diff --git')) {
            continue;
        }
        const path = extract_new_path_from_chunk(trimmed);
        if (!path) {
            continue;
        }
        map.set(path, seg.startsWith('diff --git') ? seg : trimmed);
    }
    return map;
}

function file_path_for_summary(f: DiffResultTextFile | DiffResultBinaryFile | DiffResultNameStatusFile): string {
    return f.file;
}

export class GitCollector {
    private readonly git: SimpleGit;

    constructor(repo_path: string) {
        this.git = simpleGit(repo_path);
    }

    /** 현재 체크아웃 브랜치 이름 (detached면 `HEAD`). */
    async getCurrentBranch(): Promise<string> {
        const ref = await this.git.revparse(['--abbrev-ref', 'HEAD']);
        return ref.trim();
    }

    /**
     * 커밋 목록 조회.
     * - `since` 없음: 전체(벌크)
     * - `since` 있음: 해당 커밋 **직후**부터 `HEAD`까지(증분)
     * - `options.single_hash`: 해당 커밋만(단건)
     */
    async listCommits(since?: string, options?: ListCommitsOptions): Promise<RawCommit[]> {
        if (options?.single_hash) {
            const log_with_args = this.git.log as unknown as (
                args: string[],
                opts: LogOptions<LogFormatFields>,
            ) => Promise<LogResult<LogFormatFields>>;
            const log = await log_with_args(['-n', '1', options.single_hash], {
                format: GIT_LOG_FORMAT,
            });
            return log.all.map((e) => this.toRawCommit(e));
        }

        if (options?.since_iso_date && !since) {
            const log = await this.git.log({
                format: GIT_LOG_FORMAT,
                '--since': options.since_iso_date,
            } as LogOptions<LogFormatFields>);
            return log.all.map((e) => this.toRawCommit(e));
        }

        if (since) {
            const incremental_opts: LogOptions<LogFormatFields> = {
                format: GIT_LOG_FORMAT,
                from: since,
                to: 'HEAD',
                symmetric: false,
            };
            if (options?.max_count !== undefined) {
                incremental_opts.maxCount = options.max_count;
            }
            const log = await this.git.log(incremental_opts);
            return log.all.map((e) => this.toRawCommit(e));
        }

        const bulk_opts: LogOptions<LogFormatFields> = {
            format: GIT_LOG_FORMAT,
        };
        if (options?.max_count !== undefined) {
            bulk_opts.maxCount = options.max_count;
        }
        const log = await this.git.log(bulk_opts);
        return log.all.map((e) => this.toRawCommit(e));
    }

    private toRawCommit(entry: LogFormatFields): RawCommit {
        return {
            hash: entry.hash,
            short_hash: entry.short_hash,
            author: entry.author,
            date: entry.date,
            subject: entry.subject,
            body: entry.body ?? '',
        };
    }

    /**
     * 부모 대비 변경이 있는 커밋의 unified diff를 수집하고, 제외 패턴에 해당하는 파일은 결과에서 뺀다.
     */
    async getDiff(commit_hash: string): Promise<RawDiff> {
        const refs = await this.resolveDiffRefs(commit_hash);
        const diff_refs = [...refs];
        const raw_full = await this.git.diff([...diff_refs, '-p']);
        const patch_by_path = split_unified_diff_by_file(raw_full);
        const summary = await this.git.diffSummary([...diff_refs, '--find-renames', '--name-status']);

        const files: RawDiffFile[] = [];
        for (const f of summary.files) {
            const path = file_path_for_summary(f);
            if (shouldSkipFile(path)) {
                continue;
            }
            const patch = patch_by_path.get(path) ?? '';
            const additions = f.binary ? 0 : f.insertions;
            const deletions = f.binary ? 0 : f.deletions;
            let status: RawDiffFile['status'] = 'modified';
            let old_path: string | undefined;

            if (is_name_status_file(f)) {
                status = map_name_status_to_raw(f.status!);
                if (f.status === DiffNameStatus.RENAMED && f.from) {
                    old_path = f.from;
                }
            } else if (f.binary) {
                status = 'modified';
            }

            const row: RawDiffFile = {
                path,
                status,
                additions,
                deletions,
                patch,
            };
            if (old_path !== undefined) {
                row.old_path = old_path;
            }
            files.push(row);
        }

        const raw_patch = files
            .map((x) => x.patch)
            .filter(Boolean)
            .join('\n');

        return {
            commit_hash,
            files,
            raw_patch,
        };
    }

    /**
     * `git diff --stat` 기반 요약. simple-git `DiffResult`를 그대로 반환한다.
     */
    async getCommitDiffStat(commit_hash: string): Promise<DiffResult> {
        const refs = await this.resolveDiffRefs(commit_hash);
        return this.git.diffSummary([...refs, '--find-renames', '--name-status']);
    }

    /**
     * 루트 커밋은 `rev-parse hash^`가 실패하므로 `--root`를 사용한다.
     */
    private async resolveDiffRefs(commit_hash: string): Promise<[string, string] | ['--root', string]> {
        try {
            await this.git.revparse(`${commit_hash}^`);
            return [`${commit_hash}^`, commit_hash];
        } catch {
            return ['--root', commit_hash];
        }
    }
}
