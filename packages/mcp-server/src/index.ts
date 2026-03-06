import path from 'node:path';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { evaluate } from 'mathjs';
import { registerTools } from './tools/index.js';
import { registerResources } from './resources/index.js';
import {
    CYCLE_TOOL_DEFINITIONS,
    handleCycleInit,
    handleCycleGet,
    handleCycleUpdate,
    handleCycleComplete,
    handleCycleList,
    handleCycleSummary,
} from './tools/cycle_metrics.js';

const workspace_root =
    process.argv.find((_, i, a) => a[i - 1] === '--workspace') || process.env['WORKSPACE_ROOT'] || process.cwd();
const cycles_dir = path.join(workspace_root, '.cursor', 'metrics', 'cycles');

// MCP 서버 인스턴스 생성
const server = new Server(
    {
        name: 'personal-mcp-server',
        version: '0.1.0',
    },
    {
        capabilities: {
            tools: {},
            resources: {},
        },
    },
);

// 도구 및 리소스 등록
registerTools(server);
registerResources(server);

// 도구 목록 핸들러
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'get_current_time',
                description: '현재 시간을 반환합니다',
                inputSchema: {
                    type: 'object',
                    properties: {
                        format: {
                            type: 'string',
                            enum: ['iso', 'locale', 'timestamp'],
                            description: '시간 포맷 (iso, locale, timestamp)',
                            default: 'iso',
                        },
                    },
                },
            },
            {
                name: 'calculate',
                description: '간단한 수학 계산을 수행합니다',
                inputSchema: {
                    type: 'object',
                    properties: {
                        expression: {
                            type: 'string',
                            description: '계산할 수식 (예: 2 + 2, 10 * 5)',
                        },
                    },
                    required: ['expression'],
                },
            },
            ...CYCLE_TOOL_DEFINITIONS,
        ],
    };
});

// 도구 실행 핸들러
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
        case 'get_current_time': {
            const format = (args?.['format'] as string) || 'iso';
            const now = new Date();

            let time_string: string;
            switch (format) {
                case 'locale':
                    time_string = now.toLocaleString();
                    break;
                case 'timestamp':
                    time_string = now.getTime().toString();
                    break;
                case 'iso':
                default:
                    time_string = now.toISOString();
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: `현재 시간: ${time_string}`,
                    },
                ],
            };
        }

        case 'calculate': {
            const expression = args?.['expression'] as string;

            if (!expression) {
                throw new Error('expression 파라미터가 필요합니다');
            }

            try {
                // mathjs의 evaluate() 사용 (안전한 수식 파서)
                const result = evaluate(expression);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `${expression} = ${result}`,
                        },
                    ],
                };
            } catch (error) {
                throw new Error(`계산 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
            }
        }

        case 'cycle_init':
            return handleCycleInit(args as Record<string, unknown>, cycles_dir);
        case 'cycle_get':
            return handleCycleGet(args as Record<string, unknown>, cycles_dir);
        case 'cycle_update':
            return handleCycleUpdate(args as Record<string, unknown>, cycles_dir);
        case 'cycle_complete':
            return handleCycleComplete(args as Record<string, unknown>, cycles_dir);
        case 'cycle_list':
            return handleCycleList(args as Record<string, unknown>, cycles_dir);
        case 'cycle_summary':
            return handleCycleSummary(args as Record<string, unknown>, cycles_dir);

        default:
            throw new Error(`알 수 없는 도구: ${name}`);
    }
});

// 리소스 목록 핸들러
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: 'info://server',
                name: '서버 정보',
                description: 'MCP 서버에 대한 정보',
                mimeType: 'text/plain',
            },
        ],
    };
});

// 리소스 읽기 핸들러
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    if (uri === 'info://server') {
        return {
            contents: [
                {
                    uri,
                    mimeType: 'text/plain',
                    text: [
                        'Personal MCP Server v0.1.0',
                        '',
                        '사용 가능한 도구:',
                        '- get_current_time: 현재 시간 조회',
                        '- calculate: 수학 계산',
                        '- cycle_init: 작업 사이클 초기화',
                        '- cycle_get: 사이클 데이터 조회',
                        '- cycle_update: 사이클 부분 업데이트',
                        '- cycle_complete: 사이클 완료 처리',
                        '- cycle_list: 날짜별 사이클 목록',
                        '- cycle_summary: 날짜별 사이클 통계',
                        '',
                        '이 서버는 Cursor에서 사용할 수 있습니다.',
                    ].join('\n'),
                },
            ],
        };
    }

    throw new Error(`알 수 없는 리소스: ${uri}`);
});

// 서버 시작
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('Personal MCP Server 실행 중...');
}

main().catch((error) => {
    console.error('서버 오류:', error);
    process.exit(1);
});
