import { Server } from '@modelcontextprotocol/sdk/server/index.js';

/** MCP 서버에 추가 도구를 붙일 때 사용하는 확장 포인트(현재는 플레이스홀더). */
export function registerTools(_server: Server) {
    // 추가 도구 등록을 위한 확장 포인트
    console.error('도구 등록 완료');
}
