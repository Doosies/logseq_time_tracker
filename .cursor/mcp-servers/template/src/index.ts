#!/usr/bin/env node

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

// List available tools
server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "example_tool",
    description: "예시 도구",
    inputSchema: {
      type: "object",
      properties: {
        input: {
          type: "string",
          description: "입력 파라미터"
        }
      },
      required: ["input"]
    }
  }]
}));

// Handle tool calls
server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "example_tool") {
    const { input } = request.params.arguments || {};
    
    try {
      // 도구 로직 구현
      const result = { message: `Processed: ${input}` };
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ 
            error: error instanceof Error ? error.message : String(error) 
          })
        }],
        isError: true
      };
    }
  }
  
  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
