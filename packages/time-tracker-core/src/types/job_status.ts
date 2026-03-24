export type StatusKind = 'pending' | 'in_progress' | 'paused' | 'cancelled' | 'completed';

export const VALID_TRANSITIONS: Record<StatusKind, readonly StatusKind[]> = {
    pending: ['in_progress', 'cancelled', 'completed'],
    in_progress: ['paused', 'completed', 'cancelled'],
    paused: ['in_progress', 'completed', 'cancelled'],
    completed: ['pending'],
    cancelled: ['pending'],
} as const;

export function isValidTransition(from: StatusKind, to: StatusKind): boolean {
    return VALID_TRANSITIONS[from].includes(to);
}
