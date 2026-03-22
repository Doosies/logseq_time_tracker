# P1a-8: MCP 서버 + 기본 Tools

## 목표

`@modelcontextprotocol/sdk`로 stdio MCP 서버를 구성하고, 3개 Tool(`search_review_context`, `ingest_commits`, `supplement_reason`)과 1개 Resource(`project://overview`)를 구현한다. Cursor에서 Tools를 호출할 수 있도록 한다.

---

## 선행 조건

- P1a-7 완료 — 후처리 적용 검색 동작
- P1a-2~6 파이프라인 전체 동작

---

## 참조 설계 문서

| 문서                  | 섹션                       | 참조 내용                                |
| --------------------- | -------------------------- | ---------------------------------------- |
| `05-mcp-interface.md` | §2-1 search_review_context | 입출력 스키마, MCP Tool 정의 JSON        |
| `05-mcp-interface.md` | §2-5 ingest_commits        | 입출력 스키마, 벌크/증분/단건 모드       |
| `05-mcp-interface.md` | §2-6 supplement_reason     | 입출력 스키마, 임베딩 재생성             |
| `05-mcp-interface.md` | §3-1 project://overview    | ProjectOverviewResource 스키마           |
| `05-mcp-interface.md` | §4 사용 시나리오           | 4가지 시나리오 (회귀 감지, 맥락 파악 등) |
| `05-mcp-interface.md` | §6 에러 처리               | 상황별 응답 테이블                       |
| `01-architecture.md`  | §4 배포 진화 경로 Phase 1  | stdio 단일 프로세스                      |

---

## 생성/수정 파일 목록

| 파일                                 | 역할                                       |
| ------------------------------------ | ------------------------------------------ |
| `src/index.ts`                       | MCP 서버 엔트리포인트 (placeholder 교체)   |
| `src/server/mcp_server.ts`           | MCP 서버 인스턴스 생성, Tool/Resource 등록 |
| `src/tools/search_review_context.ts` | search_review_context Tool 핸들러          |
| `src/tools/ingest_commits.ts`        | ingest_commits Tool 핸들러                 |
| `src/tools/supplement_reason.ts`     | supplement_reason Tool 핸들러              |
| `src/resources/project_overview.ts`  | project://overview Resource 핸들러         |
| `src/pipeline/ingest_pipeline.ts`    | 인제스트 파이프라인 오케스트레이션         |

---

## 구현 상세

### src/index.ts

```typescript
#!/usr/bin/env node
import { createMcpServer } from './server/mcp_server.js';

async function main() {
    const server = await createMcpServer();
    await server.connect(process.stdin, process.stdout);
}

main().catch((err) => {
    console.error('Failed to start MCP server:', err);
    process.exit(1);
});
```

### src/server/mcp_server.ts 핵심

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerSearchReviewContext } from '../tools/search_review_context.js';
import { registerIngestCommits } from '../tools/ingest_commits.js';
import { registerSupplementReason } from '../tools/supplement_reason.js';
import { registerProjectOverview } from '../resources/project_overview.js';
import { VectorStore } from '../storage/vector_db.js';
import { JsonMetaStore } from '../storage/meta_store.js';
import { EmbeddingGenerator } from '../processing/embedder.js';
import { SearchEngine } from '../search/engine.js';
import { PostProcessor } from '../search/post_processor.js';

export interface ServerContext {
    vector_store: VectorStore;
    meta_store: JsonMetaStore;
    embedder: EmbeddingGenerator;
    search_engine: SearchEngine;
    post_processor: PostProcessor;
}

export async function createMcpServer() {
    const data_dir = process.env.CR_RAG_DATA_DIR ?? '.cr-rag-data';
    const api_key = process.env.OPENAI_API_KEY;
    if (!api_key) throw new Error('OPENAI_API_KEY is required');

    const vector_store = new VectorStore(data_dir);
    await vector_store.init();

    const meta_store = new JsonMetaStore(`${data_dir}/meta`);
    const embedder = new EmbeddingGenerator(api_key);
    const search_engine = new SearchEngine(vector_store, embedder);
    const post_processor = new PostProcessor();

    const ctx: ServerContext = {
        vector_store,
        meta_store,
        embedder,
        search_engine,
        post_processor,
    };

    const server = new Server({ name: 'cr-rag-mcp', version: '0.1.0' }, { capabilities: { tools: {}, resources: {} } });

    registerSearchReviewContext(server, ctx);
    registerIngestCommits(server, ctx);
    registerSupplementReason(server, ctx);
    registerProjectOverview(server, ctx);

    const transport = new StdioServerTransport();
    await server.connect(transport);

    return server;
}
```

### src/tools/search_review_context.ts 핵심

```typescript
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type { ServerContext } from '../server/mcp_server.js';

export function registerSearchReviewContext(server: Server, ctx: ServerContext) {
    server.setRequestHandler('tools/call', async (request) => {
        if (request.params.name !== 'search_review_context') return;

        const { diff_text, file_paths, limit = 5, include_raw_diff = false } = request.params.arguments ?? {};

        const query_text = diff_text ?? (file_paths as string[])?.join('\n') ?? '';
        if (!query_text) {
            return { content: [{ type: 'text', text: JSON.stringify({ error: 'diff_text 또는 file_paths 필요' }) }] };
        }

        const raw_results = await ctx.search_engine.search(query_text, limit * 2);
        const processed = ctx.post_processor.process(raw_results);

        const output = {
            results: processed.results.map((r) => ({
                type: 'commit' as const,
                id: r.commit_hash,
                summary: r.content,
                change_type: r.change_type,
                similarity_score: r.score,
                confidence_score: r.confidence_score,
                reason_known: r.reason_known,
                reason_inferred: r.reason_inferred,
                metadata: {
                    author: r.author,
                    date: r.date,
                    files_changed: r.file_paths,
                },
                risk_notes: r.risk_notes,
            })),
            total_found: processed.metadata.total_raw_results,
            query_type: diff_text ? 'diff_similarity' : 'file_history',
            post_processing: processed.metadata,
        };

        return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }] };
    });

    server.setRequestHandler('tools/list', async () => ({
        tools: [
            {
                name: 'search_review_context',
                description: '코드 리뷰 시 관련 과거 변경 히스토리를 검색합니다.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        diff_text: { type: 'string', description: '리뷰 대상 diff 텍스트' },
                        file_paths: { type: 'array', items: { type: 'string' }, description: '리뷰 대상 파일 경로' },
                        limit: { type: 'number', default: 5, description: '최대 결과 수' },
                        include_raw_diff: { type: 'boolean', default: false, description: '원본 diff 포함 여부' },
                    },
                },
            },
        ],
    }));
}
```

### src/pipeline/ingest_pipeline.ts 핵심

```typescript
import { GitCollector } from '../collection/git_cli.js';
import { extractStructuredFacts } from '../processing/extractor.js';
import { LlmSummarizer } from '../processing/summarizer.js';
import { verifyCommitSummary } from '../processing/verifier.js';
import { buildContent } from '../processing/embedder.js';
import type { VectorStore } from '../storage/vector_db.js';
import type { EmbeddingGenerator } from '../processing/embedder.js';
import type { JsonMetaStore } from '../storage/meta_store.js';
import type { CrRagConfig } from '../types/config.js';

export interface IngestResult {
    processed: number;
    indexed: number;
    failed: number;
    skipped: number;
    errors: string[];
    duration_ms: number;
}

export async function runIngestPipeline(
    repo_path: string,
    project_id: string,
    mode: 'bulk' | 'incremental' | 'single',
    vector_store: VectorStore,
    embedder: EmbeddingGenerator,
    meta_store: JsonMetaStore,
    config?: CrRagConfig,
    options?: { since_date?: string; commit_hash?: string },
): Promise<IngestResult> {
    const start = Date.now();
    const collector = new GitCollector({ repo_path, since_date: options?.since_date });
    const summarizer = new LlmSummarizer(process.env.OPENAI_API_KEY!);

    let commits;
    if (mode === 'single' && options?.commit_hash) {
        commits = [{ hash: options.commit_hash } as any]; // 단건
    } else {
        const state = await meta_store.loadPipelineState(project_id);
        const since = mode === 'incremental' ? state?.last_processed_commit : undefined;
        commits = await collector.listCommits(since);
    }

    let indexed = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const commit of commits) {
        try {
            const diff = await collector.getDiff(commit.hash);
            const facts = extractStructuredFacts(commit, diff, config);
            const { summary, gate } = await summarizer.summarize(facts, diff.raw_patch);

            if (gate.strategy === 'confirm') {
                skipped++;
                continue;
            }

            const verification = verifyCommitSummary(summary, facts);
            if (!verification.passed) {
                failed++;
                errors.push(`${commit.hash}: verification failed`);
                continue;
            }

            const content = buildContent(facts, summary);
            const embedding = await embedder.embed(content);

            await vector_store.upsert(commit.hash, content, embedding, {
                doc_type: 'commit',
                commit_hash: commit.hash,
                commit_short: commit.hash.slice(0, 7),
                project_id,
                branch: '', // 로컬 git에서 추출
                author: facts.author,
                committed_at: facts.date,
                change_type: summary.change_type,
                conventional_type: facts.conventional_type,
                files_changed: facts.files.length,
                total_additions: facts.total_additions,
                total_deletions: facts.total_deletions,
                file_paths: facts.files.map((f) => f.path),
                symbols_modified: facts.files.flatMap((f) => f.functions_modified),
                file_roles: facts.files.map((f) => f.file_role),
                reason_known: summary.reason_known,
                reason_inferred: summary.reason_inferred,
                reason_supplemented: false,
                confidence_score: verification.confidence_score,
                verified_at: verification.verified_at,
                impact: summary.impact,
                risk_notes: summary.risk_notes,
            });

            indexed++;
        } catch (err) {
            failed++;
            errors.push(`${commit.hash}: ${(err as Error).message}`);
        }
    }

    return {
        processed: commits.length,
        indexed,
        failed,
        skipped,
        errors,
        duration_ms: Date.now() - start,
    };
}
```

### Cursor MCP 설정 (사용자 가이드)

```json
{
    "mcpServers": {
        "cr-rag-mcp": {
            "command": "node",
            "args": ["packages/cr-rag-mcp/dist/index.js"],
            "env": {
                "OPENAI_API_KEY": "${OPENAI_API_KEY}",
                "CR_RAG_DATA_DIR": ".cr-rag-data"
            }
        }
    }
}
```

---

## 완료 기준

- [ ] MCP 서버 stdio 시작 성공
- [ ] Cursor에서 `search_review_context` Tool 목록 표시
- [ ] `search_review_context` 호출 시 관련 히스토리 반환
- [ ] `ingest_commits` bulk/incremental 모드 동작
- [ ] `supplement_reason` 호출 시 임베딩 재생성
- [ ] `project://overview` Resource 응답
- [ ] 콜드 스타트 시 안내 메시지 반환 (인덱싱 0건)
- [ ] `pnpm type-check` 성공

---

## 다음 단계

→ P1a-9: E2E 검증 (`P1a-9-e2e-validation.md`)
