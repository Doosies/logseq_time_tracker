# P1a-6: ChromaDB 연동

## 목표

ChromaDB embedded 모드로 벡터 DB를 구성하고, 검증 통과한 커밋 요약을 임베딩하여 저장/검색한다. OpenAI text-embedding-3-small 모델을 사용한다.

---

## 선행 조건

- P1a-5 완료 — 검증(VerificationResult) 통과 가능

---

## 참조 설계 문서

| 문서               | 섹션                | 참조 내용                        |
| ------------------ | ------------------- | -------------------------------- |
| `03-data-model.md` | §2-1 CommitDocument | 스키마 (content + metadata)      |
| `03-data-model.md` | §3 Metadata Store   | JSON 기반 가공 데이터 저장       |
| `06-tech-stack.md` | §2-2 ChromaDB       | embedded 모드, 저장 경로, 제한   |
| `06-tech-stack.md` | §3-2 임베딩 모델    | text-embedding-3-small, 1536차원 |
| `03-data-model.md` | §6-4 시간 가중치    | time_decay_factor 공식           |

---

## 생성/수정 파일 목록

| 파일                         | 역할                                             |
| ---------------------------- | ------------------------------------------------ |
| `src/storage/vector_db.ts`   | ChromaDB 클라이언트 — 컬렉션 관리, upsert, query |
| `src/processing/embedder.ts` | OpenAI 임베딩 생성                               |
| `src/storage/meta_store.ts`  | JSON 기반 메타데이터 저장 (P1a-2에서 생성, 확장) |
| `src/types/documents.ts`     | CommitDocument 타입 (Vector DB 저장 형태)        |
| `src/search/engine.ts`       | 검색 엔진 — 유사도 검색 + 시간 가중치            |

---

## 구현 상세

### src/types/documents.ts

```typescript
export interface CommitDocumentMetadata {
    doc_type: 'commit';
    commit_hash: string;
    commit_short: string;
    project_id: string;
    branch: string;
    author: string;
    committed_at: string;
    change_type: string;
    conventional_type?: string;
    files_changed: number;
    total_additions: number;
    total_deletions: number;
    file_paths: string[];
    symbols_modified: string[];
    file_roles: string[];
    reason_known: boolean;
    reason_inferred: boolean;
    reason_supplemented: boolean;
    confidence_score: number;
    verified_at: string;
    impact: string;
    risk_notes?: string;
}
```

### src/processing/embedder.ts

```typescript
import OpenAI from 'openai';

export class EmbeddingGenerator {
    private client: OpenAI;

    constructor(
        api_key: string,
        private model = 'text-embedding-3-small',
    ) {
        this.client = new OpenAI({ apiKey: api_key });
    }

    async embed(text: string): Promise<number[]> {
        const response = await this.client.embeddings.create({
            model: this.model,
            input: text,
        });
        return response.data[0].embedding;
    }

    async embedBatch(texts: string[]): Promise<number[][]> {
        const response = await this.client.embeddings.create({
            model: this.model,
            input: texts,
        });
        return response.data.map((d) => d.embedding);
    }
}
```

### src/storage/vector_db.ts 핵심

```typescript
import { ChromaClient, type Collection } from 'chromadb';
import type { CommitDocumentMetadata } from '../types/documents.js';

export class VectorStore {
    private client: ChromaClient;
    private collection: Collection | null = null;

    constructor(private data_dir: string) {
        this.client = new ChromaClient({ path: data_dir });
    }

    async init(): Promise<void> {
        this.collection = await this.client.getOrCreateCollection({
            name: 'commits',
            metadata: { 'hnsw:space': 'cosine' },
        });
    }

    async upsert(id: string, content: string, embedding: number[], metadata: CommitDocumentMetadata): Promise<void> {
        if (!this.collection) throw new Error('Collection not initialized');
        await this.collection.upsert({
            ids: [id],
            documents: [content],
            embeddings: [embedding],
            metadatas: [metadata as Record<string, string | number | boolean>],
        });
    }

    async query(embedding: number[], n_results: number, where?: Record<string, unknown>): Promise<ChromaQueryResult[]> {
        if (!this.collection) throw new Error('Collection not initialized');
        const results = await this.collection.query({
            queryEmbeddings: [embedding],
            nResults: n_results,
            where: where as any,
        });

        return (results.ids[0] ?? []).map((id, i) => ({
            id,
            document: results.documents[0]?.[i] ?? '',
            metadata: results.metadatas[0]?.[i] as unknown as CommitDocumentMetadata,
            distance: results.distances?.[0]?.[i] ?? 0,
        }));
    }

    async count(): Promise<number> {
        if (!this.collection) throw new Error('Collection not initialized');
        return this.collection.count();
    }
}

export interface ChromaQueryResult {
    id: string;
    document: string;
    metadata: CommitDocumentMetadata;
    distance: number;
}
```

### src/search/engine.ts 핵심

```typescript
import type { VectorStore, ChromaQueryResult } from '../storage/vector_db.js';
import type { EmbeddingGenerator } from '../processing/embedder.js';

export class SearchEngine {
    constructor(
        private vector_store: VectorStore,
        private embedder: EmbeddingGenerator,
        private decay_rate = 0.01,
    ) {}

    async search(query_text: string, limit: number, filters?: Record<string, unknown>): Promise<SearchResult[]> {
        const query_embedding = await this.embedder.embed(query_text);
        const raw_results = await this.vector_store.query(
            query_embedding,
            limit * 2, // 시간 가중치 적용 후 재정렬을 위해 여유분
            filters,
        );

        return raw_results
            .map((r) => this.applyTimeWeight(r))
            .sort((a, b) => b.final_score - a.final_score)
            .slice(0, limit);
    }

    private applyTimeWeight(result: ChromaQueryResult): SearchResult {
        const similarity = 1 - result.distance; // cosine distance → similarity
        const days_ago = this.daysSince(result.metadata.committed_at);
        const time_decay = Math.exp(-this.decay_rate * days_ago);
        const final_score = similarity * time_decay;

        return {
            ...result,
            similarity_score: similarity,
            time_decay_factor: time_decay,
            final_score,
        };
    }

    private daysSince(date_str: string): number {
        const diff = Date.now() - new Date(date_str).getTime();
        return diff / (1000 * 60 * 60 * 24);
    }
}

export interface SearchResult extends ChromaQueryResult {
    similarity_score: number;
    time_decay_factor: number;
    final_score: number;
}
```

### content 생성 (임베딩 대상 텍스트)

```typescript
import type { StructuredFacts } from '../types/facts.js';
import type { CommitSummary } from '../types/summary.js';

export function buildContent(facts: StructuredFacts, summary: CommitSummary): string {
    const parts: string[] = [summary.what];

    if (summary.reason && summary.reason_known) {
        parts.push(summary.reason);
    }

    parts.push(`파일: ${facts.files.map((f) => f.path).join(', ')}`);

    const symbols = facts.files.flatMap((f) => f.functions_modified);
    if (symbols.length > 0) {
        parts.push(`심볼: ${symbols.join(', ')}`);
    }

    return parts.join('\n');
}
```

---

## 완료 기준

- [ ] ChromaDB embedded 모드 초기화 성공
- [ ] 커밋 요약 임베딩 + upsert 동작
- [ ] 유사도 검색 쿼리 동작 (diff 텍스트 기반)
- [ ] 시간 가중치 적용 확인 (최근 커밋이 상위 랭크)
- [ ] 메타데이터 필터 동작 (change_type, file_paths 등)
- [ ] 50건 인제스트 후 검색 시뮬레이션 가능
- [ ] `pnpm type-check` 성공

---

## 다음 단계

→ 검증 게이트 (`P1a-gate-validation.md`)
