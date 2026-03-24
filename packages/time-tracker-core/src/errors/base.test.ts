import { describe, expect, it } from 'vitest';
import {
    ReferenceIntegrityError,
    StateTransitionError,
    StorageError,
    TimeTrackerError,
    TimerError,
    ValidationError,
} from './base';

describe('에러 클래스', () => {
    it('TimeTrackerError: name, code, message', () => {
        const err = new TimeTrackerError('msg', 'MY_CODE');
        expect(err.name).toBe('TimeTrackerError');
        expect(err.code).toBe('MY_CODE');
        expect(err.message).toBe('msg');
    });

    it("ValidationError: name='ValidationError', code='VALIDATION_ERROR', field", () => {
        const err = new ValidationError('bad', 'title');
        expect(err.name).toBe('ValidationError');
        expect(err.code).toBe('VALIDATION_ERROR');
        expect(err.field).toBe('title');
    });

    it('StateTransitionError: from_status, to_status, 기본 message', () => {
        const err = new StateTransitionError('pending', 'paused');
        expect(err.from_status).toBe('pending');
        expect(err.to_status).toBe('paused');
        expect(err.message).toBe("Invalid transition from 'pending' to 'paused'");
    });

    it('StorageError: operation', () => {
        const err = new StorageError('fail', 'read');
        expect(err.operation).toBe('read');
        expect(err.code).toBe('STORAGE_ERROR');
    });

    it("TimerError: code='TIMER_ERROR'", () => {
        const err = new TimerError('tick');
        expect(err.code).toBe('TIMER_ERROR');
        expect(err.name).toBe('TimerError');
    });

    it('ReferenceIntegrityError: entity, entity_id', () => {
        const err = new ReferenceIntegrityError('broken', 'Job', 'j1');
        expect(err.entity).toBe('Job');
        expect(err.entity_id).toBe('j1');
    });

    it('TimeTrackerError cause 체인', () => {
        const root = new Error('root');
        const err = new TimeTrackerError('wrapped', 'WRAP', { cause: root });
        expect(err.cause).toBe(root);
    });
});
