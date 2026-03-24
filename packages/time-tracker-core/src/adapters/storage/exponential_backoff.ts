export interface ExponentialBackoffOptions {
    max_attempts: number;
    base_delay_ms: number;
    /** Injected for tests; defaults to `setTimeout` + Promise. */
    sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Runs `operation` up to `max_attempts` times with delays `base_delay_ms * 2^attempt` after failures.
 */
export async function runWithExponentialBackoff<T>(
    options: ExponentialBackoffOptions,
    operation: () => Promise<T>,
): Promise<T> {
    const sleep_fn = options.sleep ?? defaultSleep;
    let last_error: unknown;
    for (let attempt = 0; attempt < options.max_attempts; attempt++) {
        try {
            return await operation();
        } catch (e) {
            last_error = e;
            if (attempt < options.max_attempts - 1) {
                const delay = options.base_delay_ms * Math.pow(2, attempt);
                await sleep_fn(delay);
            }
        }
    }
    throw last_error;
}
