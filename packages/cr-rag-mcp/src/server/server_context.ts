import type { EmbeddingGenerator } from '../processing/embedder.js';
import type { PostProcessor } from '../search/post_processor.js';
import type { SearchEngine } from '../search/engine.js';
import type { JsonMetaStore } from '../storage/meta_store.js';
import type { VectorStore } from '../storage/vector_db.js';

/** MCP 도구·파이프라인이 공유하는 런타임 의존성(저장소, 임베딩, 검색, 후처리). */
export interface ServerContext {
    vector_store: VectorStore;
    meta_store: JsonMetaStore;
    embedder: EmbeddingGenerator;
    search_engine: SearchEngine;
    post_processor: PostProcessor;
}
