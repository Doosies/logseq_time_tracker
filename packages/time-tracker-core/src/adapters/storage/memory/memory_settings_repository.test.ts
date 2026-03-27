import { describe, expect, it } from 'vitest';

import type { ActiveTimerState } from '../../../types/settings';
import { MemorySettingsRepository } from './memory_settings_repository';

function makeActiveTimer(overrides: Partial<ActiveTimerState> = {}): ActiveTimerState {
    return {
        version: 1,
        job_id: 'job-1',
        category_id: 'cat-1',
        started_at: '2025-01-01T00:00:00.000Z',
        is_paused: false,
        accumulated_ms: 0,
        ...overrides,
    };
}

describe('MemorySettingsRepository', () => {
    it('UC-MEM-028: setSetting과 getSetting으로 값을 저장·조회한다', async () => {
        const repo = new MemorySettingsRepository();
        const state = makeActiveTimer();
        await repo.setSetting('active_timer', state);
        const got = await repo.getSetting('active_timer');
        expect(got).toEqual(state);
    });

    it('UC-MEM-029: 없는 키는 getSetting이 null을 반환한다', async () => {
        const repo = new MemorySettingsRepository();
        expect(await repo.getSetting('last_selected_category')).toBeNull();
    });

    it('UC-MEM-030: deleteSetting 후 getSetting은 null이다', async () => {
        const repo = new MemorySettingsRepository();
        await repo.setSetting('last_selected_category', 'x');
        await repo.deleteSetting('last_selected_category');
        expect(await repo.getSetting('last_selected_category')).toBeNull();
    });

    it('UC-MEM-031: structuredClone 격리 — set 후 객체 변경해도 저장 조회값은 불변', async () => {
        const repo = new MemorySettingsRepository();
        const state = makeActiveTimer({ job_id: 'j0' });
        await repo.setSetting('active_timer', state);
        state.job_id = 'mutated';
        const got = await repo.getSetting('active_timer');
        expect(got?.job_id).toBe('j0');
    });
});
