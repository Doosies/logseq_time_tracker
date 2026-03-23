import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { CommitDocumentMetadata } from '../types/documents.js';
import type { PipelineState } from '../types/pipeline.js';

export class JsonMetaStore {
    constructor(private base_dir: string) {}

    private commit_doc_dir(project_id: string): string {
        return join(this.base_dir, 'commit_docs', project_id.replace(/\//g, '_'));
    }

    async savePipelineState(state: PipelineState): Promise<void> {
        await mkdir(this.base_dir, { recursive: true });
        const path = join(this.base_dir, `pipeline_${state.project_id.replace(/\//g, '_')}.json`);
        await writeFile(path, JSON.stringify(state, null, 2));
    }

    async loadPipelineState(project_id: string): Promise<PipelineState | null> {
        const path = join(this.base_dir, `pipeline_${project_id.replace(/\//g, '_')}.json`);
        try {
            const data = await readFile(path, 'utf-8');
            return JSON.parse(data) as PipelineState;
        } catch {
            return null;
        }
    }

    async saveCommitDocumentMetadata(meta: CommitDocumentMetadata): Promise<void> {
        const dir = this.commit_doc_dir(meta.project_id);
        await mkdir(dir, { recursive: true });
        const path = join(dir, `${meta.commit_hash}.json`);
        await writeFile(path, JSON.stringify(meta, null, 2));
    }

    async loadCommitDocumentMetadata(project_id: string, commit_hash: string): Promise<CommitDocumentMetadata | null> {
        const path = join(this.commit_doc_dir(project_id), `${commit_hash}.json`);
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
            if (!name.startsWith('pipeline_') || !name.endsWith('.json')) {
                continue;
            }
            try {
                const raw = await readFile(join(this.base_dir, name), 'utf-8');
                states.push(JSON.parse(raw) as PipelineState);
            } catch {
                continue;
            }
        }
        return states;
    }
}
