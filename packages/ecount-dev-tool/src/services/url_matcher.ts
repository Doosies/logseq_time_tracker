/**
 * Tampermonkey @include glob 패턴을 RegExp로 변환
 * - `*` -> `.*` (0개 이상 아무 문자)
 * - `?` -> `.` (정확히 1개 아무 문자)
 * - 나머지 특수문자는 리터럴 이스케이프
 */
export function compilePattern(pattern: string): RegExp {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const with_wildcards = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');
    return new RegExp(`^${with_wildcards}$`);
}

export function compilePatterns(patterns: string[]): RegExp[] {
    return patterns.map(compilePattern);
}

export function matchesUrl(url: string, patterns: string[]): boolean {
    if (patterns.length === 0) return false;
    return patterns.some((pattern) => compilePattern(pattern).test(url));
}
