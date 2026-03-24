export function getElapsedMs(accumulated_ms: number, current_segment_start: string | null, is_paused: boolean): number {
    if (is_paused || !current_segment_start) {
        return accumulated_ms;
    }
    return accumulated_ms + (Date.now() - new Date(current_segment_start).getTime());
}

export function formatDuration(total_seconds: number): string {
    const hours = Math.floor(total_seconds / 3600);
    const minutes = Math.floor((total_seconds % 3600) / 60);
    const seconds = total_seconds % 60;
    return [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':');
}

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
