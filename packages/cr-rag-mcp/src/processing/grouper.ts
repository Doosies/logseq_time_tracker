import type { RawCommit } from '../types/git.js';

export interface GroupInfo {
    group_id: string;
    group_size: number;
    group_index: number;
}

const DEFAULT_GROUP_GAP_MINUTES = 30;

/** `iso_next` is the later commit in chronological order (older → newer). */
function minutesFromPreviousToCurrent(iso_prev: string, iso_next: string): number {
    const t_prev = Date.parse(iso_prev);
    const t_next = Date.parse(iso_next);
    if (Number.isNaN(t_prev) || Number.isNaN(t_next)) {
        return Number.POSITIVE_INFINITY;
    }
    return (t_next - t_prev) / 60_000;
}

export function detectGroups(commits: RawCommit[], gap_minutes = DEFAULT_GROUP_GAP_MINUTES): Map<string, GroupInfo> {
    const result = new Map<string, GroupInfo>();
    const current_group: RawCommit[] = [];

    function flushGroup(): void {
        if (current_group.length <= 1) {
            current_group.length = 0;
            return;
        }
        const group_id = current_group[0]!.hash;
        const group_size = current_group.length;
        for (let i = 0; i < current_group.length; i++) {
            const c = current_group[i]!;
            result.set(c.hash, {
                group_id,
                group_size,
                group_index: i,
            });
        }
        current_group.length = 0;
    }

    for (const c of commits) {
        if (current_group.length === 0) {
            current_group.push(c);
            continue;
        }
        const prev = current_group[current_group.length - 1]!;
        const same_author = prev.author === c.author;
        const delta_min = minutesFromPreviousToCurrent(prev.date, c.date);
        const gap_ok = delta_min >= 0 && delta_min <= gap_minutes;
        if (same_author && gap_ok) {
            current_group.push(c);
        } else {
            flushGroup();
            current_group.push(c);
        }
    }
    flushGroup();

    return result;
}
