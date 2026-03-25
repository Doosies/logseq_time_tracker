import { describe, expect, it } from 'vitest';
import { isValidTransition } from './job_status';

describe('isValidTransition', () => {
    it('UC-TYPE-001: pending → in_progress 허용', () => {
        expect(isValidTransition('pending', 'in_progress')).toBe(true);
    });

    it('UC-TYPE-001: pending → cancelled 허용', () => {
        expect(isValidTransition('pending', 'cancelled')).toBe(true);
    });

    it('UC-TYPE-001: pending → completed 허용', () => {
        expect(isValidTransition('pending', 'completed')).toBe(true);
    });

    it('UC-TYPE-001: in_progress → paused 허용', () => {
        expect(isValidTransition('in_progress', 'paused')).toBe(true);
    });

    it('UC-TYPE-001: in_progress → completed 허용', () => {
        expect(isValidTransition('in_progress', 'completed')).toBe(true);
    });

    it('UC-TYPE-001: in_progress → cancelled 허용', () => {
        expect(isValidTransition('in_progress', 'cancelled')).toBe(true);
    });

    it('UC-TYPE-001: paused → in_progress 허용', () => {
        expect(isValidTransition('paused', 'in_progress')).toBe(true);
    });

    it('UC-TYPE-001: paused → completed 허용', () => {
        expect(isValidTransition('paused', 'completed')).toBe(true);
    });

    it('UC-TYPE-001: paused → cancelled 허용', () => {
        expect(isValidTransition('paused', 'cancelled')).toBe(true);
    });

    it('UC-TYPE-001: completed → pending 허용', () => {
        expect(isValidTransition('completed', 'pending')).toBe(true);
    });

    it('UC-TYPE-001: cancelled → pending 허용', () => {
        expect(isValidTransition('cancelled', 'pending')).toBe(true);
    });

    it('UC-TYPE-002: pending → paused 거부', () => {
        expect(isValidTransition('pending', 'paused')).toBe(false);
    });

    it('UC-TYPE-002: in_progress → pending 거부', () => {
        expect(isValidTransition('in_progress', 'pending')).toBe(false);
    });

    it('UC-TYPE-002: paused → pending 거부', () => {
        expect(isValidTransition('paused', 'pending')).toBe(false);
    });

    it('UC-TYPE-002: completed → in_progress 거부', () => {
        expect(isValidTransition('completed', 'in_progress')).toBe(false);
    });

    it('UC-TYPE-002: completed → paused 거부', () => {
        expect(isValidTransition('completed', 'paused')).toBe(false);
    });

    it('UC-TYPE-002: cancelled → in_progress 거부', () => {
        expect(isValidTransition('cancelled', 'in_progress')).toBe(false);
    });

    it('UC-TYPE-002: completed → cancelled 거부', () => {
        expect(isValidTransition('completed', 'cancelled')).toBe(false);
    });

    it('UC-TYPE-002: cancelled → completed 거부', () => {
        expect(isValidTransition('cancelled', 'completed')).toBe(false);
    });
});
