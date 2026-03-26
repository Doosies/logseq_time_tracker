import { describe, expect, it } from 'vitest';
import { generateId } from './id';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('generateId', () => {
    it('UC-UTIL-001: UUID v4 형식의 문자열을 반환해야 함', () => {
        const id = generateId();
        expect(id).toMatch(UUID_V4_REGEX);
    });

    it('UC-UTIL-002: 연속 호출 시 서로 다른 값을 반환해야 함', () => {
        const a = generateId();
        const b = generateId();
        expect(a).not.toBe(b);
    });
});
