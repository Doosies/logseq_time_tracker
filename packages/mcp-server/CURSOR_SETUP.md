# Cursor MCP 서버 설정 가이드

## 설정 파일 위치

### Windows
```
%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
```

또는 Cursor Settings UI 사용:
1. `Ctrl+,` (설정 열기)
2. Features → Model Context Protocol
3. `+ Add New MCP Server`

### macOS
```
~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

### Linux
```
~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

## 설정 예제

### 기본 설정
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

### 환경 변수 사용
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

### 여러 서버 등록
```json
{
  "mcpServers": {
    "personal": {
      "command": "node",
      "args": ["D:/personal/packages/mcp-server/dist/index.js"],
      "transport": "stdio"
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allow"],
      "transport": "stdio"
    }
  }
}
```

## 확인 방법

1. Cursor 재시작
2. Composer (Ctrl+I) 또는 Chat 열기
3. 다음 명령어로 테스트:
   - "현재 시간을 알려줘"
   - "10 * 5를 계산해줘"

## 로그 확인

Cursor에서 MCP 서버 로그 확인:
1. `View` → `Output`
2. 드롭다운에서 `MCP Logs` 선택

## 문제 해결

### 서버가 시작되지 않음
- Node.js 설치 확인: `node --version`
- 빌드 확인: `pnpm build`
- 경로 확인: 절대 경로 사용

### 도구가 보이지 않음
- Cursor 재시작
- 설정 파일 문법 확인 (JSON 유효성)
- 로그 확인

### 권한 오류 (Windows)
```json
{
  "command": "cmd",
  "args": ["/c", "node", "D:/personal/packages/mcp-server/dist/index.js"]
}
```

## 자동 시작 스크립트 (선택사항)

### Windows (start-mcp.bat)
```batch
@echo off
cd /d D:\personal\packages\mcp-server
node dist\index.js
```

### macOS/Linux (start-mcp.sh)
```bash
#!/bin/bash
cd /path/to/personal/packages/mcp-server
node dist/index.js
```

설정에서 스크립트 사용:
```json
{
  "command": "D:/personal/packages/mcp-server/start-mcp.bat"
}
```
