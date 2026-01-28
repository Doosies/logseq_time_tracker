# MCP Server Template

자동 생성된 MCP 서버 템플릿입니다.

## 설치

```bash
npm install
```

## 빌드

```bash
npm run build
```

## 테스트

```bash
npm test
```

## 등록

`.cursor/mcp-servers.json`에 추가:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": [".cursor/mcp-servers/my-server/dist/index.js"]
    }
  }
}
```

## 사용법

에이전트가 자동으로 도구를 인식하고 사용합니다.
