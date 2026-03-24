import type { StorageState } from '../../types/settings';

type StorageMode = 'sqlite' | 'memory_fallback';

export type StorageStateListener = (state: StorageState) => void;

function buildState(mode: StorageMode, fallback_reason?: string, fallback_since?: string): StorageState {
    if (mode === 'sqlite') {
        return { mode: 'sqlite' };
    }
    if (fallback_reason !== undefined && fallback_since !== undefined) {
        return { mode: 'memory_fallback', fallback_reason, fallback_since };
    }
    if (fallback_reason !== undefined) {
        return { mode: 'memory_fallback', fallback_reason };
    }
    if (fallback_since !== undefined) {
        return { mode: 'memory_fallback', fallback_since };
    }
    return { mode: 'memory_fallback' };
}

/**
 * Tracks SQLite vs memory fallback and notifies subscribers on transition.
 */
export class StorageStateMachine {
    private _state: StorageState;
    private readonly _listeners = new Set<StorageStateListener>();

    constructor(initial_mode: StorageMode = 'sqlite') {
        this._state = buildState(initial_mode);
    }

    getState(): StorageState {
        return { ...this._state };
    }

    transitionToFallback(reason: string): void {
        if (this._state.mode === 'memory_fallback') {
            this._state = buildState('memory_fallback', reason, new Date().toISOString());
            this._emit();
            return;
        }
        this._state = buildState('memory_fallback', reason, new Date().toISOString());
        this._emit();
    }

    transitionToSqlite(): void {
        if (this._state.mode === 'sqlite') {
            return;
        }
        this._state = buildState('sqlite');
        this._emit();
    }

    subscribe(listener: StorageStateListener): () => void {
        this._listeners.add(listener);
        return () => {
            this._listeners.delete(listener);
        };
    }

    /** Clears all listeners (e.g. on {@link StorageManager.dispose}). */
    clearListeners(): void {
        this._listeners.clear();
    }

    private _emit(): void {
        const snapshot = this.getState();
        for (const listener of this._listeners) {
            listener(snapshot);
        }
    }
}
