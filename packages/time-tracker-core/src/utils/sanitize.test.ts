import { describe, expect, it } from 'vitest';
import { ValidationError } from '../errors';
import { sanitizeText } from './sanitize';

describe('sanitizeText', () => {
    it('UC-UTIL-003: HTML 태그를 제거하고 앞뒤 공백을 trim해야 함', () => {
        expect(sanitizeText('  hello <b>world</b>  ', 100)).toBe('hello world');
    });

    it('UC-UTIL-004: max_length를 초과하면 ValidationError를 던져야 함', () => {
        expect(() => sanitizeText('abcdef', 3)).toThrow(ValidationError);
    });

    it('UC-UTIL-005: 길이가 max_length 이하이면 정제된 문자열을 반환해야 함', () => {
        expect(sanitizeText('abc', 3)).toBe('abc');
    });
});
