export const DEFAULT_LOCK_NAME = 'time-tracker-db';
export const LOCK_TIMEOUT_MS = 5000;

type LockManagerLike = {
    request: (
        name: string,
        options: { ifAvailable?: boolean; signal?: AbortSignal },
        callback: (lock: unknown) => Promise<unknown>,
    ) => Promise<unknown>;
};

function getLockManager(): LockManagerLike | null {
    if (typeof navigator === 'undefined' || navigator.locks === undefined) {
        return null;
    }
    return navigator.locks as LockManagerLike;
}

/**
 * Optional Web Locks wrapper around `navigator.locks` with graceful degradation when unsupported.
 */
export class WebLocksManager {
    private _lock_held = false;
    private _lock_abort_controller: AbortController | null = null;
    private _release_holder: (() => void) | null = null;

    static isSupported(): boolean {
        return getLockManager() !== null;
    }

    /**
     * Tries to acquire an exclusive lock (`ifAvailable: true`). Resolves when the outcome is known;
     * the lock stays held until {@link releaseLock}.
     * When unsupported, resolves `true` without a real lock.
     */
    acquireLock(name: string = DEFAULT_LOCK_NAME): Promise<boolean> {
        const locks = getLockManager();
        if (locks === null) {
            this._lock_held = true;
            return Promise.resolve(true);
        }

        if (this._lock_held || this._release_holder !== null) {
            return Promise.resolve(false);
        }

        this._lock_abort_controller = new AbortController();
        const signal = this._lock_abort_controller.signal;
        const timeout_id = setTimeout(() => {
            this._lock_abort_controller?.abort();
        }, LOCK_TIMEOUT_MS);

        return new Promise<boolean>((resolve) => {
            void locks
                .request(name, { ifAvailable: true, signal }, async (lock: unknown) => {
                    clearTimeout(timeout_id);
                    if (lock == null) {
                        resolve(false);
                        return;
                    }
                    this._lock_held = true;
                    resolve(true);
                    await new Promise<void>((release_resolve) => {
                        this._release_holder = () => {
                            this._release_holder = null;
                            release_resolve();
                        };
                    });
                    this._lock_held = false;
                })
                .catch(() => {
                    clearTimeout(timeout_id);
                    this._lock_abort_controller = null;
                    this._lock_held = false;
                    this._release_holder = null;
                    resolve(false);
                })
                .finally(() => {
                    clearTimeout(timeout_id);
                    this._lock_abort_controller = null;
                });
        });
    }

    releaseLock(): void {
        if (this._release_holder !== null) {
            this._release_holder();
        }
        if (!WebLocksManager.isSupported()) {
            this._lock_held = false;
        }
    }

    isLockHeld(): boolean {
        return this._lock_held;
    }
}
