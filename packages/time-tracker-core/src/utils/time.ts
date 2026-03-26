/** YYYY-MM-DDThh:mm:ss[.frac][Z|±hh:mm|±hhmm] — API에서 쓰는 ISO 8601 datetime 부분집합 */
const ISO8601_DATETIME_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2}|[+-]\d{4})$/;

/**
 * ISO 8601 datetime 문자열이 구조·범위상 유효한지 검사합니다.
 * 날짜 전용(`YYYY-MM-DD`)이나 주간 표기 등은 포함하지 않습니다.
 */
export function isValidISO8601(value: string): boolean {
    if (typeof value !== 'string' || value.length === 0) {
        return false;
    }
    const match = value.match(ISO8601_DATETIME_RE);
    if (!match) {
        return false;
    }
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = Number(match[6]);
    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return false;
    }
    if (hour > 23 || minute > 59 || second > 59) {
        return false;
    }
    const time_ms = new Date(value).getTime();
    return !Number.isNaN(time_ms);
}

export function getElapsedMs(accumulated_ms: number, current_segment_start: string | null, is_paused: boolean): number {
    if (is_paused || !current_segment_start) {
        return accumulated_ms;
    }
    return accumulated_ms + (Date.now() - new Date(current_segment_start).getTime());
}

/** Formats a non-negative second count as `HH:MM:SS` with zero padding. */
export function formatDuration(total_seconds: number): string {
    const hours = Math.floor(total_seconds / 3600);
    const minutes = Math.floor((total_seconds % 3600) / 60);
    const seconds = total_seconds % 60;
    return [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':');
}

/** Formats a UTC ISO string for display in `ko-KR` locale (24h date-time). */
export function formatLocalDateTime(utc_iso: string): string {
    const date = new Date(utc_iso);
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(date);
}
