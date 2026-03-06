import { describe, it, expect } from 'vitest';
import { compilePattern, matchesUrl, compilePatterns } from '../url_matcher';

describe('url_matcher', () => {
    describe('compilePattern', () => {
        it('* 를 .* 로 변환한다', () => {
            const regex = compilePattern('*');
            expect(regex.test('anything')).toBe(true);
            expect(regex.test('')).toBe(true);
        });

        it('? 를 . 으로 변환한다', () => {
            const regex = compilePattern('a?c');
            expect(regex.test('abc')).toBe(true);
            expect(regex.test('adc')).toBe(true);
            expect(regex.test('ac')).toBe(false);
        });

        it('특수문자를 이스케이프한다', () => {
            const regex = compilePattern('test.com');
            expect(regex.test('test.com')).toBe(true);
            expect(regex.test('testXcom')).toBe(false);
        });

        it('빈 문자열은 빈 문자열만 매칭한다', () => {
            const regex = compilePattern('');
            expect(regex.test('')).toBe(true);
            expect(regex.test('something')).toBe(false);
        });

        it('ecount URL 패턴을 올바르게 변환한다', () => {
            const regex = compilePattern('*://zeus*.ecount.com/*');
            expect(regex.test('https://zeus01.ecount.com/ecerp/ES080100')).toBe(true);
            expect(regex.test('http://zeus99.ecount.com/')).toBe(true);
            expect(regex.test('https://test.ecount.com/')).toBe(false);
        });
    });

    describe('matchesUrl', () => {
        it('패턴과 URL이 일치하면 true를 반환한다', () => {
            expect(matchesUrl('https://zeus01.ecount.com/page', ['*://zeus*.ecount.com/*'])).toBe(true);
        });

        it('패턴과 URL이 불일치하면 false를 반환한다', () => {
            expect(matchesUrl('https://google.com', ['*://zeus*.ecount.com/*'])).toBe(false);
        });

        it('빈 패턴 배열이면 false를 반환한다', () => {
            expect(matchesUrl('https://zeus01.ecount.com/', [])).toBe(false);
        });

        it('여러 패턴 중 하나라도 일치하면 true를 반환한다', () => {
            const patterns = ['*://zeus*.ecount.com/*', '*://test.ecount.com/*'];
            expect(matchesUrl('https://test.ecount.com/page', patterns)).toBe(true);
        });

        it('모든 패턴이 불일치하면 false를 반환한다', () => {
            const patterns = ['*://zeus*.ecount.com/*', '*://test.ecount.com/*'];
            expect(matchesUrl('https://other.example.com/', patterns)).toBe(false);
        });
    });

    describe('compilePatterns', () => {
        it('여러 패턴을 한번에 컴파일한다', () => {
            const patterns = ['*://zeus*.ecount.com/*', '*://test.ecount.com/*'];
            const compiled = compilePatterns(patterns);
            expect(compiled).toHaveLength(2);
            expect(compiled[0]!.test('https://zeus01.ecount.com/')).toBe(true);
            expect(compiled[1]!.test('https://test.ecount.com/page')).toBe(true);
        });

        it('빈 배열은 빈 배열을 반환한다', () => {
            expect(compilePatterns([])).toEqual([]);
        });
    });
});
