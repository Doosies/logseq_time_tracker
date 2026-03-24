export interface ActiveTimerState {
    version: number;
    job_id: string;
    category_id: string;
    started_at: string;
    is_paused: boolean;
    paused_at?: string;
    accumulated_ms: number;
}

export type SettingsMap = {
    active_timer: ActiveTimerState;
    last_selected_category: string;
};

export type AppInitState = 'loading' | 'ready' | 'error';

export interface StorageState {
    mode: 'sqlite' | 'memory_fallback';
    fallback_reason?: string;
    fallback_since?: string;
}
