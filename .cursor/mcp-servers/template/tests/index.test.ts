import { describe, it, expect } from 'vitest';

describe('Example MCP Server', () => {
  it('should process input', () => {
    const input = 'test';
    const result = { message: `Processed: ${input}` };
    expect(result.message).toBe('Processed: test');
  });
});
