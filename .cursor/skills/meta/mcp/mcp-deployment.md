---
name: mcp-deployment
description: 배포 및 등록 절차
---

# MCP 배포

## 배포 절차

### 1. 빌드
```bash
cd .cursor/mcp-servers/my-server
npm run build
```

### 2. mcp-servers.json 등록
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

### 3. Cursor 재시작
Cursor를 완전히 종료하고 다시 시작

### 4. 확인
에이전트가 새 MCP 도구 인식하는지 확인

## 관련 Skill 업데이트

```markdown
qa/coverage-check.md에 추가:

### MCP 도구 활용

\`\`\`typescript
const coverage = await mcp.get_coverage({ 
  project_path: "." 
});
\`\`\`
```

## 완료 기준
- [ ] 빌드 성공
- [ ] mcp-servers.json 등록
- [ ] Cursor에서 인식
- [ ] 에이전트가 사용
- [ ] 관련 Skill 업데이트
