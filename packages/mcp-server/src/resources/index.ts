import { Server } from '@modelcontextprotocol/sdk/server/index.js';

/** MCP 서버에 추가 리소스를 붙일 때 사용하는 확장 포인트(현재는 플레이스홀더). */
export function registerResources(_server: Server) {
    // 추가 리소스 등록을 위한 확장 포인트
    console.error('리소스 등록 완료');
}
