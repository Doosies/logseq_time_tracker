import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';

import type { CommitDocumentMetadata } from '../types/documents.js';
import type { PipelineState } from '../types/pipeline.js';

const COMMIT_HASH_PATTERN = /^[a-fA-F0-9]{7,40}$/;

function isSafePipelineSnapshotFileName(name: string): boolean {
    if (!name.startsWith('pipeline_') || !name.endsWith('.json')) {
        return false;
    }
    if (name.includes('..') || name.includes('/') || name.includes('\\')) {
        return false;
    }
    return true;
}

/** `project_id`를 파일/디렉터리 이름에 안전한 슬러그로 변환합니다 (경로 탈출 방지). */
export function toSafeSlug(input: string): string {
    return input.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/** Git 커밋 해시 형식(7~40자 16진수) 여부. */
export function isValidCommitHash(hash: string): boolean {
    return COMMIT_HASH_PATTERN.test(hash);
}

export class JsonMetaStore {
    constructor(private base_dir: string) {}

    /** `path.join` 결과가 `base_dir` 하위인지 검증한 뒤 정규화된 절대 경로를 반환합니다. */
    private pathUnderBase(...parts: string[]): string {
        const full = resolve(join(this.base_dir, ...parts));
        const base_resolved = resolve(this.base_dir);
        const base_cmp = process.platform === 'win32' ? base_resolved.toLowerCase() : base_resolved;
        const full_cmp = process.platform === 'win32' ? full.toLowerCase() : full;
        const prefix = base_cmp.endsWith(sep) ? base_cmp : base_cmp + sep;
        if (full_cmp !== base_cmp && !full_cmp.startsWith(prefix)) {
            throw new Error('Path escapes base directory');
        }
        return full;
    }

    private commit_doc_dir(project_id: string): string {
        return this.pathUnderBase('commit_docs', toSafeSlug(project_id));
    }

    async savePipelineState(state: PipelineState): Promise<void> {
        await mkdir(this.base_dir, { recursive: true });
        const path = this.pathUnderBase(`pipeline_${toSafeSlug(state.project_id)}.json`);
        await writeFile(path, JSON.stringify(state, null, 2));
    }

    async loadPipelineState(project_id: string): Promise<PipelineState | null> {
        const path = this.pathUnderBase(`pipeline_${toSafeSlug(project_id)}.json`);
        try {
            const data = await readFile(path, 'utf-8');
            return JSON.parse(data) as PipelineState;
        } catch {
            return null;
        }
    }

    async saveCommitDocumentMetadata(meta: CommitDocumentMetadata): Promise<void> {
        if (!isValidCommitHash(meta.commit_hash)) {
            throw new Error('commit_hash must be 7–40 hexadecimal characters');
        }
        const dir = this.commit_doc_dir(meta.project_id);
        await mkdir(dir, { recursive: true });
        const path = this.pathUnderBase('commit_docs', toSafeSlug(meta.project_id), `${meta.commit_hash}.json`);
        await writeFile(path, JSON.stringify(meta, null, 2));
    }

    async loadCommitDocumentMetadata(project_id: string, commit_hash: string): Promise<CommitDocumentMetadata | null> {
        if (!isValidCommitHash(commit_hash)) {
            return null;
        }
        const path = this.pathUnderBase('commit_docs', toSafeSlug(project_id), `${commit_hash}.json`);
        try {
            const data = await readFile(path, 'utf-8');
            return JSON.parse(data) as CommitDocumentMetadata;
        } catch {
            return null;
        }
    }

    async listCommitDocumentHashes(project_id: string): Promise<string[]> {
        const dir = this.commit_doc_dir(project_id);
        try {
            const names = await readdir(dir);
            return names.filter((n) => n.endsWith('.json')).map((n) => n.slice(0, -'.json'.length));
        } catch {
            return [];
        }
    }

    /** `pipeline_*.json` 스냅샷 목록 (리소스 overview 등). */
    async listPipelineStates(): Promise<PipelineState[]> {
        let names: string[];
        try {
            names = await readdir(this.base_dir);
        } catch {
            return [];
        }
        const states: PipelineState[] = [];
        for (const name of names) {
            if (!isSafePipelineSnapshotFileName(name)) {
                continue;
            }
            try {
                const file_path = this.pathUnderBase(name);
                const raw = await readFile(file_path, 'utf-8');
                states.push(JSON.parse(raw) as PipelineState);
            } catch {
                continue;
            }
        }
        return states;
    }
}
