# Personal MCP Server

Cursor에서 사용 가능한 TypeScript 기반 Model Context Protocol (MCP) 서버입니다.

## 기능

### 도구 (Tools)

- **get_current_time** - 현재 시간 조회
  - 형식: `iso`, `locale`, `timestamp`
- **calculate** - 간단한 수학 계산
  - 예: `2 + 2`, `10 * 5`

### 리소스 (Resources)

- **info://server** - 서버 정보 조회

## 설치

```bash
# 의존성 설치
pnpm install

# 빌드
pnpm build
```

## 개발

```bash
# 타입 체크
pnpm type-check

# Watch 모드
pnpm dev
```

## Cursor에서 사용하기

### 1. 빌드

```bash
cd packages/mcp-server
pnpm build
```

### 2. Cursor 설정

#### Windows
Cursor Settings → Features → Model Context Protocol → Add New MCP Server

```json
{
  "mcpServers": {
    "personal": {
      "command": "node",
      "args": ["D:/personal/packages/mcp-server/dist/index.js"],
      "transport": "stdio"
    }
  }
}
```

#### macOS/Linux
```json
{
  "mcpServers": {
    "personal": {
      "command": "node",
      "args": ["/path/to/personal/packages/mcp-server/dist/index.js"],
      "transport": "stdio"
    }
  }
}
```

### 3. Cursor 재시작

설정 후 Cursor를 재시작하면 MCP 서버가 자동으로 시작됩니다.

## 사용 예제

Cursor의 Composer나 Chat에서 다음과 같이 사용할 수 있습니다:

```
현재 시간을 알려줘
```

```
25 * 4를 계산해줘
```

## 프로젝트 구조

```
src/
├── index.ts           # 메인 서버
├── tools/
│   └── index.ts      # 도구 등록
└── resources/
    └── index.ts      # 리소스 등록
```

## 도구 추가하기

`src/index.ts`의 `ListToolsRequestSchema` 핸들러에 새 도구를 추가하세요:

```typescript
{
  name: "my_tool",
  description: "도구 설명",
  inputSchema: {
    type: "object",
    properties: {
      param: {
        type: "string",
        description: "파라미터 설명"
      }
    },
    required: ["param"]
  }
}
```

그리고 `CallToolRequestSchema` 핸들러에 구현을 추가하세요:

```typescript
case "my_tool": {
  const param = args?.param as string;
  return {
    content: [{
      type: "text",
      text: `결과: ${param}`
    }]
  };
}
```

## 디버깅

서버 로그는 Cursor의 Output 패널 (MCP Logs)에서 확인할 수 있습니다.

```typescript
console.error("디버그 메시지"); // stderr로 출력
```

## 참고 자료

- [MCP 공식 문서](https://modelcontextprotocol.io/)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Cursor MCP 문서](https://docs.cursor.com/context/model-context-protocol)
