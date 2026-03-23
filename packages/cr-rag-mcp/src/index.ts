#!/usr/bin/env node

import { connectMcpServerStdio, createMcpServer } from './server/mcp_server.js';

async function main() {
    const { server } = await createMcpServer();
    await connectMcpServerStdio(server);
}

main().catch((err) => {
    console.error('Failed to start MCP server:', err);
    process.exit(1);
});
