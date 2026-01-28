---
name: mcp-design
description: MCP 서버 설계 원칙
---

# MCP 서버 설계

## 설계 원칙

### 1. 단일 책임
하나의 MCP 서버 = 하나의 명확한 기능
```
✅ vitest-coverage-analyzer
❌ test-tools (너무 광범위)
```

### 2. 간단한 인터페이스
최소한의 파라미터:
```typescript
// ✅ 좋은 예
get_coverage({ project_path: string })

// ❌ 나쁜 예
get_coverage({ 
  project_path, 
  config, 
  options, 
  advanced_settings 
})
```

### 3. 오류 처리
명확한 에러 메시지:
```typescript
if (!fs.existsSync(project_path)) {
  throw new Error(`Project not found: ${project_path}`);
}
```

## 도구 정의

```typescript
{
  name: "get_coverage",
  description: "Vitest 커버리지 분석 결과 반환",
  inputSchema: {
    type: "object",
    properties: {
      project_path: {
        type: "string",
        description: "프로젝트 루트 경로"
      }
    },
    required: ["project_path"]
  }
}
```

## 완료 기준
- [ ] 도구 인터페이스 설계
- [ ] 입출력 스키마 정의
- [ ] 에러 케이스 정의
