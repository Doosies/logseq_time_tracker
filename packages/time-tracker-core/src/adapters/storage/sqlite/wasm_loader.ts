const WASM_FILENAME = 'sql-wasm.wasm';

function resolveWasmUrl(base_url: string): string {
    const with_slash = base_url.endsWith('/') ? base_url : `${base_url}/`;
    return `${with_slash}${WASM_FILENAME}`;
}

function loadViaXhr(url: string): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 0) {
                resolve(xhr.response as ArrayBuffer);
            } else {
                reject(new Error(`WASM XHR failed: status ${xhr.status}`));
            }
        };
        xhr.onerror = () => reject(new Error(`WASM XHR network error: ${url}`));
        xhr.send();
    });
}

async function loadViaFetch(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`WASM fetch failed: status ${response.status}`);
    }
    return response.arrayBuffer();
}

/**
 * Loads sql-wasm.wasm binary from the given base URL.
 * Tries XMLHttpRequest first (works in Electron custom protocols like lsp://),
 * then falls back to fetch().
 */
export async function loadWasmBinary(base_url: string): Promise<ArrayBuffer> {
    const url = resolveWasmUrl(base_url);

    try {
        return await loadViaXhr(url);
    } catch {
        // XHR failed, try fetch as fallback
    }

    return loadViaFetch(url);
}
