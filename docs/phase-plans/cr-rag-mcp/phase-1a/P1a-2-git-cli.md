# P1a-2: Git CLI 수집기

## 목표

`simple-git` 라이브러리를 사용하여 로컬 Git 리포지토리에서 커밋 목록과 diff를 추출하는 모듈을 구현한다. 벌크/증분/단건 수집 모드를 지원한다.

---

## 선행 조건

- P1a-1 완료 — 패키지 scaffolding, `simple-git` 의존성 설치

---

## 참조 설계 문서

| 문서                  | 섹션                        | 참조 내용                                   |
| --------------------- | --------------------------- | ------------------------------------------- |
| `02-data-pipeline.md` | §2-1 Phase 1: 로컬 Git 기반 | git log/show/diff 명령, 벌크/증분 전략      |
| `02-data-pipeline.md` | §10 파이프라인 실행 모드    | Bulk/Incremental/Single 모드, PipelineState |
| `05-mcp-interface.md` | §2-5 ingest_commits         | IngestCommitsInput/Output 인터페이스        |

---

## 생성/수정 파일 목록

| 파일                        | 역할                                                |
| --------------------------- | --------------------------------------------------- |
| `src/collection/git_cli.ts` | Git CLI 래퍼 — 커밋 목록, diff, stat 조회           |
| `src/types/git.ts`          | Git 관련 타입 (RawCommit, RawDiff 등)               |
| `src/types/pipeline.ts`     | PipelineState, FailedItem 타입                      |
| `src/storage/meta_store.ts` | PipelineState 저장/조회 (JSON 파일 기반, 최소 구현) |

---

## 구현 상세

### src/types/git.ts

```typescript
export interface RawCommit {
    hash: string;
    short_hash: string;
    author: string;
    date: string; // ISO 8601
    subject: string;
    body: string;
}

export interface RawDiff {
    commit_hash: string;
    files: RawDiffFile[];
    raw_patch: string; // 전체 diff 텍스트
}

export interface RawDiffFile {
    path: string;
    status: 'added' | 'modified' | 'deleted' | 'renamed';
    old_path?: string;
    additions: number;
    deletions: number;
    patch: string; // 파일별 diff
}
```

### src/types/pipeline.ts

```typescript
export interface PipelineState {
    project_id: string;
    last_processed_commit: string;
    last_run_at: string;
    total_processed: number;
    total_failed: number;
    failed_items: FailedItem[];
}

export interface FailedItem {
    type: 'commit' | 'mr';
    id: string;
    error: string;
    failed_at: string;
    retry_count: number;
}
```

### src/collection/git_cli.ts 핵심

```typescript
import simpleGit, { type SimpleGit } from 'simple-git';
import type { RawCommit, RawDiff, RawDiffFile } from '../types/git.js';

export interface GitCollectorOptions {
    repo_path: string;
    since_date?: string;
    until_date?: string;
}

export class GitCollector {
    private git: SimpleGit;

    constructor(private options: GitCollectorOptions) {
        this.git = simpleGit(options.repo_path);
    }

    async listCommits(since?: string): Promise<RawCommit[]> {
        const log = await this.git.log({
            '--since': since ?? this.options.since_date,
            '--until': this.options.until_date,
            '--format': {
                hash: '%H',
                short_hash: '%h',
                author: '%an',
                date: '%aI',
                subject: '%s',
                body: '%b',
            },
        });
        return log.all.map((entry) => ({
            hash: entry.hash,
            short_hash: entry.short_hash ?? entry.hash.slice(0, 7),
            author: entry.author_name ?? '',
            date: entry.date ?? '',
            subject: entry.message ?? '',
            body: entry.body ?? '',
        }));
    }

    async getDiff(commit_hash: string): Promise<RawDiff> {
        const diff_summary = await this.git.diffSummary([`${commit_hash}^`, commit_hash]);
        const raw_patch = await this.git.diff([`${commit_hash}^`, commit_hash]);

        const files: RawDiffFile[] = diff_summary.files.map((f) => ({
            path: f.file,
            status: this.inferStatus(f),
            additions: f.insertions,
            deletions: f.deletions,
            patch: '', // 파일별 패치는 raw_patch에서 분리
        }));

        return { commit_hash, files, raw_patch };
    }

    async getCommitDiffStat(
        commit_hash: string,
    ): Promise<{ additions: number; deletions: number; files_changed: number }> {
        const summary = await this.git.diffSummary([`${commit_hash}^`, commit_hash]);
        return {
            additions: summary.insertions,
            deletions: summary.deletions,
            files_changed: summary.changed,
        };
    }

    private inferStatus(file: { file: string; insertions: number; deletions: number }): RawDiffFile['status'] {
        // simple-git의 diffSummary는 status를 직접 제공하지 않으므로 추론
        // 정확한 status는 git show --name-status로 별도 조회 가능
        return 'modified';
    }
}
```

### 바이너리/자동생성 파일 필터

```typescript
const EXCLUDED_PATTERNS = [
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
```

### PipelineState 저장 (meta_store.ts 최소 구현)

```typescript
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { PipelineState } from '../types/pipeline.js';

export class JsonMetaStore {
    constructor(private base_dir: string) {}

    async savePipelineState(state: PipelineState): Promise<void> {
        await mkdir(this.base_dir, { recursive: true });
        const path = join(this.base_dir, `pipeline_${state.project_id.replace(/\//g, '_')}.json`);
        await writeFile(path, JSON.stringify(state, null, 2));
    }

    async loadPipelineState(project_id: string): Promise<PipelineState | null> {
        const path = join(this.base_dir, `pipeline_${project_id.replace(/\//g, '_')}.json`);
        try {
            const data = await readFile(path, 'utf-8');
            return JSON.parse(data);
        } catch {
            return null;
        }
    }
}
```

---

## 완료 기준

- [ ] 로컬 리포에서 커밋 목록 조회 성공
- [ ] 특정 커밋의 diff (파일 목록 + 패치) 추출 성공
- [ ] 벌크 모드 (since_date 이후 전체 커밋) 동작
- [ ] 증분 모드 (last_processed_commit 이후) 동작
- [ ] 바이너리/자동생성 파일 필터 동작
- [ ] PipelineState JSON 저장/로드 동작
- [ ] `pnpm type-check` 성공

---

## 다음 단계

→ P1a-3: 구조화 팩트 추출 (`P1a-3-fact-extraction.md`)
