import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatDuration, formatLocalDateTime, getElapsedMs, isValidISO8601 } from './time';

describe('formatDuration', () => {
    it('0초일 때 00:00:00을 반환해야 함', () => {
        expect(formatDuration(0)).toBe('00:00:00');
    });

    it('초·분에 앞자리 0 패딩이 적용되어야 함', () => {
        expect(formatDuration(5)).toBe('00:00:05');
        expect(formatDuration(65)).toBe('00:01:05');
    });

    it('1시간 이상일 때 시:분:초 형식이어야 함', () => {
        expect(formatDuration(3661)).toBe('01:01:01');
    });
});

describe('getElapsedMs', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-06-01T12:00:00.000Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('일시정지면 누적 시간만 반환해야 함', () => {
        expect(getElapsedMs(1000, '2025-06-01T11:00:00.000Z', true)).toBe(1000);
    });

    it('시작 세그먼트가 없으면 누적 시간만 반환해야 함', () => {
        expect(getElapsedMs(2000, null, false)).toBe(2000);
    });

    it('진행 중이면 누적 시간에 경과 시간을 더해야 함', () => {
        expect(getElapsedMs(1000, '2025-06-01T11:00:00.000Z', false)).toBe(1000 + 3600000);
    });
});

describe('formatLocalDateTime', () => {
    it('유효한 ISO 문자열을 연도가 포함된 문자열로 변환해야 함', () => {
        const result = formatLocalDateTime('2025-06-01T15:30:00.000Z');
        expect(result.length).toBeGreaterThan(0);
        expect(result).toMatch(/2025/);
    });
});

describe('isValidISO8601', () => {
    it('UC-TYPE-003: 유효한 ISO8601 문자열 검증', () => {
        expect(isValidISO8601('2026-03-25T12:00:00.000Z')).toBe(true);
        expect(isValidISO8601('2026-03-25T12:00:00+09:00')).toBe(true);
    });

    it('UC-TYPE-004: 잘못된 ISO8601 문자열 거부', () => {
        expect(isValidISO8601('not-a-date')).toBe(false);
        expect(isValidISO8601('2026/03/25')).toBe(false);
        expect(isValidISO8601('2026-13-01T00:00:00Z')).toBe(false);
    });
});
