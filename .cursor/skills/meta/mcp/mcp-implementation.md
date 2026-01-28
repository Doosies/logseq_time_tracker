---
name: mcp-implementation
description: TypeScript 구현 가이드
---

# MCP 구현

## 기본 구조

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "my-mcp-server",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "my_tool",
    description: "도구 설명",
    inputSchema: {
      type: "object",
      properties: {
        param: { type: "string" }
      }
    }
  }]
}));

server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "my_tool") {
    // 구현
    return {
      content: [{
        type: "text",
        text: JSON.stringify(result)
      }]
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

## 완료 기준
- [ ] MCP 서버 구현
- [ ] 도구 핸들러 작성
- [ ] 테스트 통과
