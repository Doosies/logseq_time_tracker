import { describe, it, expect } from 'vitest';

// 예제 테스트
describe('example test suite', () => {
    it('should pass basic assertion', () => {
        expect(1 + 1).toBe(2);
    });

    it('should handle string comparison', () => {
        const greeting = 'Hello, Logseq!';
        expect(greeting).toContain('Logseq');
    });
});
