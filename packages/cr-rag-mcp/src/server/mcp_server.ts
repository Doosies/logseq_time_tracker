import { resolve } from 'node:path';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { EmbeddingGenerator } from '../processing/embedder.js';
import { PostProcessor } from '../search/post_processor.js';
import { SearchEngine } from '../search/engine.js';
import { JsonMetaStore } from '../storage/meta_store.js';
import { VectorStore } from '../storage/vector_db.js';
import { readProjectOverview } from '../resources/project_overview.js';
import { handleIngestCommits } from '../tools/ingest_commits.js';
import { handleSearchReviewContext } from '../tools/search_review_context.js';
import { handleSupplementReason } from '../tools/supplement_reason.js';

import type { ServerContext } from './server_context.js';

export type { ServerContext } from './server_context.js';

function readEnv(): {
    openai_api_key: string;
    data_dir: string;
    chroma_host: string;
    chroma_port: number;
    collection_name: string;
} {
    const openai_api_key = process.env['OPENAI_API_KEY'] ?? '';
    const data_dir = resolve(process.cwd(), process.env['CR_RAG_DATA_DIR'] ?? '.cr-rag-data');
    const chroma_host = process.env['CR_RAG_CHROMA_HOST'] ?? 'localhost';
    const chroma_port_raw = process.env['CR_RAG_CHROMA_PORT'] ?? '8000';
    const chroma_port = Number.parseInt(chroma_port_raw, 10);
    const collection_name = process.env['CR_RAG_COLLECTION_NAME'] ?? 'cr_rag_commits';

    return {
        openai_api_key,
        data_dir,
        chroma_host,
        chroma_port: Number.isFinite(chroma_port) ? chroma_port : 8000,
        collection_name,
    };
}

async function buildServerContext(): Promise<ServerContext> {
    const env = readEnv();
    if (!env.openai_api_key.trim()) {
        throw new Error('OPENAI_API_KEY is required to start cr-rag-mcp');
    }

    const vector_store = new VectorStore({
        chroma_client_args: {
            host: env.chroma_host,
            port: env.chroma_port,
        },
        collection_name: env.collection_name,
    });

    try {
        await vector_store.init();
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        throw new Error(
            `ChromaDB 연결 실패 (${env.chroma_host}:${env.chroma_port}). 서버가 떠 있는지 확인하세요: ${msg}`,
        );
    }

    const meta_store = new JsonMetaStore(env.data_dir);
    const embedder = new EmbeddingGenerator(env.openai_api_key);
    const search_engine = new SearchEngine(vector_store, embedder);
    const post_processor = new PostProcessor();

    return {
        vector_store,
        meta_store,
        embedder,
        search_engine,
        post_processor,
    };
}

const TOOL_DEFINITIONS = [
    {
        name: 'search_review_context',
        description: '코드 리뷰 맥락 검색: diff 텍스트를 쿼리로 벡터 검색하고 후처리된 유사 커밋을 반환합니다.',
        inputSchema: {
            type: 'object',
            properties: {
                diff_text: { type: 'string', description: '검색 쿼리로 쓸 unified diff 또는 변경 요약 텍스트' },
                file_paths: {
                    type: 'array',
                    items: { type: 'string' },
                    description: '선택: 결과를 이 경로와 겹치는 커밋으로만 좁힘',
                },
                limit: { type: 'number', description: '최대 결과 수', default: 10 },
                include_raw_diff: { type: 'boolean', description: '응답에 원본 diff_text 포함', default: false },
            },
            required: ['diff_text'],
        },
    },
    {
        name: 'ingest_commits',
        description: 'Git 저장소 커밋을 수집·요약·임베딩하여 Chroma에 인덱싱합니다.',
        inputSchema: {
            type: 'object',
            properties: {
                repo_path: { type: 'string', description: 'Git 저장소 루트 경로' },
                project_id: { type: 'string', description: '프로젝트 식별자 (메타·파일 경로에 사용)' },
                mode: {
                    type: 'string',
                    enum: ['bulk', 'incremental', 'single'],
                    description: 'bulk: 전체, incremental: 마지막 처리 이후, single: 단일 커밋',
                },
                since_date: { type: 'string', description: '증분 콜드 스타트 시 git --since (ISO 날짜)' },
                commit_hash: { type: 'string', description: 'mode=single일 때 대상 커밋 해시' },
            },
            required: ['repo_path', 'project_id', 'mode'],
        },
    },
    {
        name: 'supplement_reason',
        description: '인덱스된 커밋에 대해 보충 사유를 메타데이터에 반영하고 임베딩을 갱신합니다.',
        inputSchema: {
            type: 'object',
            properties: {
                commit_hash: { type: 'string' },
                reason: { type: 'string', description: '보충 사유 본문' },
                supplemented_by: { type: 'string', description: '기록할 사용자/시스템 식별' },
            },
            required: ['commit_hash', 'reason', 'supplemented_by'],
        },
    },
] as const;

export async function createMcpServer(): Promise<{ server: Server; context: ServerContext }> {
    const context = await buildServerContext();

    const server = new Server(
        {
            name: 'cr-rag-mcp',
            version: '0.0.1',
        },
        {
            capabilities: {
                tools: {},
                resources: {},
            },
        },
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [...TOOL_DEFINITIONS],
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        const payload = (args ?? {}) as Record<string, unknown>;

        switch (name) {
            case 'search_review_context':
                return handleSearchReviewContext(context, payload);
            case 'ingest_commits':
                return handleIngestCommits(context, payload);
            case 'supplement_reason':
                return handleSupplementReason(context, payload);
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    });

    server.setRequestHandler(ListResourcesRequestSchema, async () => ({
        resources: [
            {
                uri: 'project://overview',
                name: '프로젝트 인덱싱 개요',
                description: '총 문서 수, 파이프라인 스냅샷, 콜드 스타트 안내',
                mimeType: 'application/json',
            },
        ],
    }));

    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const { uri } = request.params;
        if (uri === 'project://overview') {
            return readProjectOverview(context);
        }
        throw new Error(`Unknown resource: ${uri}`);
    });

    return { server, context };
}

export async function connectMcpServerStdio(server: Server): Promise<void> {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('cr-rag-mcp server running (stdio)');
}
