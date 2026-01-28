---
name: mcp-testing
description: MCP 서버 테스트 전략
---

# MCP 테스트

## 테스트 레벨

### 1. 단위 테스트
개별 함수 테스트:
```typescript
describe('parseCoverage', () => {
  it('should parse coverage output', () => {
    const input = "Coverage: 85%";
    expect(parseCoverage(input)).toBe(0.85);
  });
});
```

### 2. 통합 테스트
MCP 서버 전체 테스트:
```typescript
it('should return coverage data', async () => {
  const result = await callTool('get_coverage', {
    project_path: './test-project'
  });
  expect(result.total).toBeGreaterThan(0.8);
});
```

### 3. E2E 테스트
실제 Cursor에서 테스트:
```
1. mcp-servers.json에 등록
2. Cursor 재시작
3. QA 에이전트가 사용하는지 확인
```

## 완료 기준
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] E2E 테스트 성공
