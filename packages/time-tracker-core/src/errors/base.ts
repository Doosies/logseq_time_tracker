export class TimeTrackerError extends Error {
    readonly code: string;

    constructor(message: string, code: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'TimeTrackerError';
        this.code = code;
    }
}

export class ValidationError extends TimeTrackerError {
    readonly field?: string;

    constructor(message: string, field?: string) {
        super(message, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
        if (field !== undefined) {
            this.field = field;
        }
    }
}

export class StateTransitionError extends TimeTrackerError {
    readonly from_status: string;
    readonly to_status: string;

    constructor(from_status: string, to_status: string, message?: string) {
        super(message ?? `Invalid transition from '${from_status}' to '${to_status}'`, 'STATE_TRANSITION_ERROR');
        this.name = 'StateTransitionError';
        this.from_status = from_status;
        this.to_status = to_status;
    }
}

export class StorageError extends TimeTrackerError {
    readonly operation: string;

    constructor(message: string, operation: string) {
        super(message, 'STORAGE_ERROR');
        this.name = 'StorageError';
        this.operation = operation;
    }
}

export class TimerError extends TimeTrackerError {
    constructor(message: string) {
        super(message, 'TIMER_ERROR');
        this.name = 'TimerError';
    }
}

export class ReferenceIntegrityError extends TimeTrackerError {
    readonly entity: string;
    readonly entity_id: string;

    constructor(message: string, entity: string, id: string) {
        super(message, 'REFERENCE_INTEGRITY_ERROR');
        this.name = 'ReferenceIntegrityError';
        this.entity = entity;
        this.entity_id = id;
    }
}
