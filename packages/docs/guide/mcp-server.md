# MCP Server

이 프로젝트는 Cursor에서 사용할 수 있는 Model Context Protocol (MCP) 서버를 포함합니다.

## MCP란?

Model Context Protocol은 AI 어시스턴트가 외부 도구와 데이터에 접근할 수 있게 해주는 표준 프로토콜입니다.

## 기능

### 🛠️ 도구 (Tools)

MCP 서버는 다음 도구를 제공합니다:

#### get_current_time

현재 시간을 다양한 형식으로 반환합니다.

**파라미터:**

- `format`: `"iso"` | `"locale"` | `"timestamp"` (기본값: `"iso"`)

**예제:**

```
현재 시간을 알려줘
ISO 형식으로 현재 시간 보여줘
```

#### calculate

간단한 수학 계산을 수행합니다.

**파라미터:**

- `expression`: 계산할 수식 (예: `"2 + 2"`, `"10 * 5"`)

**예제:**

```
25 곱하기 4는?
(100 + 50) / 3을 계산해줘
```

### 📚 리소스 (Resources)

#### info://server

서버 정보 및 사용 가능한 도구 목록을 제공합니다.

## 빠른 시작

### 1. 빌드

```bash
cd packages/mcp-server
pnpm build
```

### 2. Cursor 설정

**Windows:**

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

**macOS/Linux:**

```json
{
    "mcpServers": {
        "personal": {
            "command": "node",
            "args": ["/absolute/path/to/packages/mcp-server/dist/index.js"],
            "transport": "stdio"
        }
    }
}
```

### 3. 설정 방법

#### UI로 설정

1. Cursor Settings (`Ctrl+,`)
2. Features → Model Context Protocol
3. `+ Add New MCP Server`
4. 위의 JSON 설정 입력

#### 파일로 설정

- Windows: `%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
- macOS: `~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- Linux: `~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

### 4. Cursor 재시작

설정 후 Cursor를 재시작하면 MCP 서버가 자동으로 연결됩니다.

## 사용 예제

Cursor의 Composer (`Ctrl+I`) 또는 Chat에서:

```
현재 시간을 알려줘
```

```
100 나누기 4는 얼마야?
```

```
서버 정보를 보여줘
```

## 개발

### 프로젝트 구조

```
packages/mcp-server/
├── src/
│   ├── index.ts          # 메인 서버
│   ├── tools/
│   │   └── index.ts      # 도구 등록
│   └── resources/
│       └── index.ts      # 리소스 등록
├── package.json
├── tsconfig.json
├── README.md
└── CURSOR_SETUP.md
```

### 새 도구 추가하기

1. **도구 정의** (`src/index.ts`의 `ListToolsRequestSchema`):

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

2. **도구 구현** (`src/index.ts`의 `CallToolRequestSchema`):

```typescript
case "my_tool": {
  const param = args?.param as string;

  // 도구 로직 구현
  const result = processParam(param);

  return {
    content: [{
      type: "text",
      text: `결과: ${result}`
    }]
  };
}
```

3. **빌드 및 재시작**:

```bash
pnpm build
# Cursor 재시작
```

### 디버깅

서버 로그 확인:

1. Cursor에서 `View` → `Output`
2. 드롭다운에서 `MCP Logs` 선택

코드에서 로그 출력:

```typescript
console.error('디버그 메시지'); // stderr로 출력됨
```

### Watch 모드

개발 중 자동 빌드:

```bash
pnpm dev
```

## 문제 해결

### 서버가 시작되지 않음

- Node.js 버전 확인: `node --version` (v20 이상 권장)
- 빌드 확인: `pnpm build`
- 경로 확인: 절대 경로 사용
- 로그 확인: Cursor Output → MCP Logs

### 도구가 보이지 않음

- Cursor 완전히 재시작
- 설정 파일 JSON 문법 확인
- 빌드 완료 확인: `dist/index.js` 파일 존재 확인

### 권한 오류 (Windows)

`cmd /c` 사용:

```json
{
    "command": "cmd",
    "args": ["/c", "node", "D:/personal/packages/mcp-server/dist/index.js"]
}
```

## 고급 설정

### 환경 변수

```json
{
    "mcpServers": {
        "personal": {
            "command": "node",
            "args": ["D:/personal/packages/mcp-server/dist/index.js"],
            "transport": "stdio",
            "env": {
                "NODE_ENV": "development",
                "DEBUG": "true"
            }
        }
    }
}
```

### 여러 서버 사용

```json
{
    "mcpServers": {
        "personal": {
            /* ... */
        },
        "filesystem": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "D:/allowed/path"],
            "transport": "stdio"
        }
    }
}
```

## 참고 자료

- [MCP 공식 문서](https://modelcontextprotocol.io/)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Cursor MCP 문서](https://docs.cursor.com/context/model-context-protocol)
- [MCP 서버 예제](https://github.com/modelcontextprotocol/servers)
