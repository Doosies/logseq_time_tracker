import { describe, expect, it } from 'vitest';
import { isValidTransition } from './job_status';

describe('isValidTransition', () => {
    it('pending → in_progress 허용', () => {
        expect(isValidTransition('pending', 'in_progress')).toBe(true);
    });

    it('pending → cancelled 허용', () => {
        expect(isValidTransition('pending', 'cancelled')).toBe(true);
    });

    it('pending → completed 허용', () => {
        expect(isValidTransition('pending', 'completed')).toBe(true);
    });

    it('in_progress → paused 허용', () => {
        expect(isValidTransition('in_progress', 'paused')).toBe(true);
    });

    it('in_progress → completed 허용', () => {
        expect(isValidTransition('in_progress', 'completed')).toBe(true);
    });

    it('in_progress → cancelled 허용', () => {
        expect(isValidTransition('in_progress', 'cancelled')).toBe(true);
    });

    it('paused → in_progress 허용', () => {
        expect(isValidTransition('paused', 'in_progress')).toBe(true);
    });

    it('paused → completed 허용', () => {
        expect(isValidTransition('paused', 'completed')).toBe(true);
    });

    it('paused → cancelled 허용', () => {
        expect(isValidTransition('paused', 'cancelled')).toBe(true);
    });

    it('completed → pending 허용', () => {
        expect(isValidTransition('completed', 'pending')).toBe(true);
    });

    it('cancelled → pending 허용', () => {
        expect(isValidTransition('cancelled', 'pending')).toBe(true);
    });

    it('pending → paused 거부', () => {
        expect(isValidTransition('pending', 'paused')).toBe(false);
    });

    it('in_progress → pending 거부', () => {
        expect(isValidTransition('in_progress', 'pending')).toBe(false);
    });

    it('paused → pending 거부', () => {
        expect(isValidTransition('paused', 'pending')).toBe(false);
    });

    it('completed → in_progress 거부', () => {
        expect(isValidTransition('completed', 'in_progress')).toBe(false);
    });

    it('completed → paused 거부', () => {
        expect(isValidTransition('completed', 'paused')).toBe(false);
    });

    it('cancelled → in_progress 거부', () => {
        expect(isValidTransition('cancelled', 'in_progress')).toBe(false);
    });

    it('completed → cancelled 거부', () => {
        expect(isValidTransition('completed', 'cancelled')).toBe(false);
    });

    it('cancelled → completed 거부', () => {
        expect(isValidTransition('cancelled', 'completed')).toBe(false);
    });
});
