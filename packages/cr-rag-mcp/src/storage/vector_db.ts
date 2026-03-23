import {
    ChromaClient,
    IncludeEnum,
    Schema,
    VectorIndexConfig,
    type ChromaClientArgs,
    type Collection,
    type Metadata,
    type Where,
} from 'chromadb';

import type { CommitDocumentMetadata } from '../types/documents.js';

/** 단일 쿼리 유사도 검색 결과 (Chroma query row 기반). */
export interface ChromaQueryResult {
    id: string;
    document: string | null;
    distance: number;
    metadata: CommitDocumentMetadata;
}

export interface VectorStoreOptions {
    /** `ChromaClient` 생성자 인자 (host, port, ssl 등). 기본: localhost:8000. */
    chroma_client_args?: Partial<ChromaClientArgs>;
    /** 컬렉션 이름. */
    collection_name: string;
    /**
     * 로컬 embedded 서버 사용 시 `chroma run --path <persist_directory>` 로 지정하는
     * 영속 디렉터리(문서화 목적). JS 클라이언트는 HTTP로만 연결하므로 서버를 별도로 띄워야 함.
     */
    persist_directory?: string;
}

function is_string_array(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((x) => typeof x === 'string');
}

function parse_commit_metadata(raw: Metadata | null | undefined): CommitDocumentMetadata {
    if (!raw || typeof raw !== 'object') {
        throw new Error('Chroma metadata missing or invalid');
    }
    const doc_type = raw['doc_type'];
    if (doc_type !== 'commit') {
        throw new Error(`Expected doc_type "commit", got ${String(doc_type)}`);
    }
    const commit_hash = raw['commit_hash'];
    const commit_short = raw['commit_short'];
    const project_id = raw['project_id'];
    const branch = raw['branch'];
    const author = raw['author'];
    const committed_at = raw['committed_at'];
    const change_type = raw['change_type'];
    const files_changed = raw['files_changed'];
    const total_additions = raw['total_additions'];
    const total_deletions = raw['total_deletions'];
    const file_paths = raw['file_paths'];
    const symbols_modified = raw['symbols_modified'];
    const file_roles = raw['file_roles'];
    const reason_known = raw['reason_known'];
    const reason_inferred = raw['reason_inferred'];
    const reason_supplemented = raw['reason_supplemented'];
    const confidence_score = raw['confidence_score'];
    const verified_at = raw['verified_at'];
    const impact = raw['impact'];

    if (
        typeof commit_hash !== 'string' ||
        typeof commit_short !== 'string' ||
        typeof project_id !== 'string' ||
        typeof branch !== 'string' ||
        typeof author !== 'string' ||
        typeof committed_at !== 'string' ||
        typeof change_type !== 'string' ||
        typeof files_changed !== 'number' ||
        typeof total_additions !== 'number' ||
        typeof total_deletions !== 'number' ||
        !is_string_array(file_paths) ||
        !is_string_array(symbols_modified) ||
        !is_string_array(file_roles) ||
        typeof reason_known !== 'boolean' ||
        typeof reason_inferred !== 'boolean' ||
        typeof reason_supplemented !== 'boolean' ||
        typeof confidence_score !== 'number' ||
        typeof verified_at !== 'string' ||
        typeof impact !== 'string'
    ) {
        throw new Error('Chroma metadata fields have unexpected types');
    }

    const base: CommitDocumentMetadata = {
        doc_type: 'commit',
        commit_hash,
        commit_short,
        project_id,
        branch,
        author,
        committed_at,
        change_type,
        files_changed,
        total_additions,
        total_deletions,
        file_paths,
        symbols_modified,
        file_roles,
        reason_known,
        reason_inferred,
        reason_supplemented,
        confidence_score,
        verified_at,
        impact,
    };

    const conventional = raw['conventional_type'];
    const risk = raw['risk_notes'];
    let out: CommitDocumentMetadata = base;

    if (conventional !== undefined && conventional !== null) {
        if (typeof conventional !== 'string') {
            throw new Error('conventional_type must be string when set');
        }
        out = { ...out, conventional_type: conventional };
    }
    if (risk !== undefined && risk !== null) {
        if (typeof risk !== 'string') {
            throw new Error('risk_notes must be string when set');
        }
        out = { ...out, risk_notes: risk };
    }

    const group_id = raw['group_id'];
    const group_size = raw['group_size'];
    const group_index = raw['group_index'];

    if (group_id !== undefined && group_id !== null) {
        if (typeof group_id !== 'string') {
            throw new Error('group_id must be string when set');
        }
        out = { ...out, group_id };
    }
    if (group_size !== undefined && group_size !== null) {
        if (typeof group_size !== 'number') {
            throw new Error('group_size must be number when set');
        }
        out = { ...out, group_size };
    }
    if (group_index !== undefined && group_index !== null) {
        if (typeof group_index !== 'number') {
            throw new Error('group_index must be number when set');
        }
        out = { ...out, group_index };
    }

    return out;
}

/** ChromaDB 1.5+ rejects empty list metadata values; use a sentinel when absent. */
function chromaNonEmptyStringList(values: string[]): string[] {
    return values.length > 0 ? values : ['(none)'];
}

function commit_metadata_to_chroma(meta: CommitDocumentMetadata): Metadata {
    const row: Metadata = {
        doc_type: meta.doc_type,
        commit_hash: meta.commit_hash,
        commit_short: meta.commit_short,
        project_id: meta.project_id,
        branch: meta.branch,
        author: meta.author,
        committed_at: meta.committed_at,
        change_type: meta.change_type,
        files_changed: meta.files_changed,
        total_additions: meta.total_additions,
        total_deletions: meta.total_deletions,
        file_paths: chromaNonEmptyStringList(meta.file_paths),
        symbols_modified: chromaNonEmptyStringList(meta.symbols_modified),
        file_roles: chromaNonEmptyStringList(meta.file_roles),
        reason_known: meta.reason_known,
        reason_inferred: meta.reason_inferred,
        reason_supplemented: meta.reason_supplemented,
        confidence_score: meta.confidence_score,
        verified_at: meta.verified_at,
        impact: meta.impact,
    };
    if (meta.conventional_type !== undefined) {
        row['conventional_type'] = meta.conventional_type;
    }
    if (meta.risk_notes !== undefined) {
        row['risk_notes'] = meta.risk_notes;
    }
    if (meta.group_id !== undefined) {
        row['group_id'] = meta.group_id;
    }
    if (meta.group_size !== undefined) {
        row['group_size'] = meta.group_size;
    }
    if (meta.group_index !== undefined) {
        row['group_index'] = meta.group_index;
    }
    return row;
}

export class VectorStore {
    private client: ChromaClient | undefined;
    private collection: Collection | undefined;
    private readonly options: VectorStoreOptions;

    constructor(options: VectorStoreOptions) {
        this.options = options;
    }

    async init(): Promise<void> {
        this.client = new ChromaClient(this.options.chroma_client_args ?? {});
        const schema = new Schema();
        schema.createIndex(new VectorIndexConfig({ space: 'cosine' }));
        this.collection = await this.client.getOrCreateCollection({
            name: this.options.collection_name,
            schema,
            embeddingFunction: null,
        });
    }

    private getCollectionOrThrow(): Collection {
        if (!this.collection) {
            throw new Error('VectorStore.init() must be called before use');
        }
        return this.collection;
    }

    async upsert(id: string, content: string, embedding: number[], metadata: CommitDocumentMetadata): Promise<void> {
        const coll = this.getCollectionOrThrow();
        await coll.upsert({
            ids: [id],
            embeddings: [embedding],
            documents: [content],
            metadatas: [commit_metadata_to_chroma(metadata)],
        });
    }

    async query(embedding: number[], n_results: number, where?: Where): Promise<ChromaQueryResult[]> {
        const coll = this.getCollectionOrThrow();
        const result = await coll.query({
            queryEmbeddings: [embedding],
            nResults: n_results,
            include: [IncludeEnum.distances, IncludeEnum.documents, IncludeEnum.metadatas],
            ...(where !== undefined ? { where } : {}),
        });
        const rows = result.rows()[0];
        if (!rows) {
            return [];
        }
        const out: ChromaQueryResult[] = [];
        for (const row of rows) {
            const dist = row.distance;
            if (dist === undefined || dist === null) {
                continue;
            }
            const meta = parse_commit_metadata(row.metadata ?? null);
            out.push({
                id: row.id,
                document: row.document ?? null,
                distance: dist,
                metadata: meta,
            });
        }
        return out;
    }

    async count(): Promise<number> {
        const coll = this.getCollectionOrThrow();
        return coll.count();
    }

    /**
     * 메타 `commit_hash`(및 선택적 `project_id`)로 단일 레코드 조회 — 보충 사유 등 갱신용.
     */
    async getFirstByCommitHash(commit_hash: string, project_id?: string): Promise<ChromaQueryResult | null> {
        const coll = this.getCollectionOrThrow();
        const where: Where =
            project_id !== undefined
                ? ({ $and: [{ commit_hash }, { project_id }] } as Where)
                : ({ commit_hash } as Where);
        const result = await coll.get({
            where,
            limit: 1,
            include: [IncludeEnum.documents, IncludeEnum.metadatas],
        });
        const row = result.rows()[0];
        if (!row?.id || row.metadata == null) {
            return null;
        }
        const meta = parse_commit_metadata(row.metadata as Metadata);
        return {
            id: row.id,
            document: row.document ?? null,
            distance: 0,
            metadata: meta,
        };
    }
}
