/**
 * 현재 활성화된 Chrome 탭을 가져옵니다.
 * 
 * 현재 창의 활성 탭을 조회합니다. 탭이 없거나 오류가 발생하면 null을 반환합니다.
 * 
 * @returns 현재 탭 객체 또는 null
 * 
 * @example
 * ```typescript
 * const tab = await getCurrentTab();
 * if (tab) {
 *   console.log('현재 탭 URL:', tab.url);
 * }
 * ```
 */
export async function getCurrentTab(): Promise<chrome.tabs.Tab | null> {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        return tabs[0] || null;
    } catch (error) {
        console.error('Failed to get current tab:', error);
        return null;
    }
}

/**
 * Chrome 탭의 URL을 업데이트합니다.
 * 
 * 지정된 탭의 URL을 새로운 URL로 변경합니다. 오류 발생 시 예외를 throw합니다.
 * 
 * @param tab_id - 업데이트할 탭 ID
 * @param url - 새로운 URL
 * @throws Chrome API 오류 발생 시 예외 throw
 * 
 * @example
 * ```typescript
 * const tab = await getCurrentTab();
 * if (tab?.id) {
 *   await updateTabUrl(tab.id, 'https://new-url.com');
 * }
 * ```
 */
export async function updateTabUrl(tab_id: number, url: string): Promise<void> {
    try {
        await chrome.tabs.update(tab_id, { url });
    } catch (error) {
        console.error('Failed to update tab URL:', error);
        throw error;
    }
}

/**
 * Chrome 탭에 스크립트를 실행합니다.
 * 
 * Content Script를 주입하여 페이지 컨텍스트에서 함수를 실행합니다.
 * 주입된 함수는 독립적이어야 하며 외부 모듈을 import할 수 없습니다.
 * 
 * @param tab_id - 스크립트를 실행할 탭 ID
 * @param func - 실행할 함수 (독립적이어야 함)
 * @throws Chrome API 오류 발생 시 예외 throw
 * 
 * @example
 * ```typescript
 * await executeScript(tabId, () => {
 *   const input = document.getElementById('id');
 *   if (input) input.value = 'test';
 * });
 * ```
 */
export async function executeScript(tab_id: number, func: () => void): Promise<void> {
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tab_id },
            func,
        });
    } catch (error) {
        console.error('Failed to execute script:', error);
        throw error;
    }
}

/**
 * 현재 활성화된 Chrome 탭의 URL을 가져옵니다.
 * 
 * 현재 탭의 URL을 조회합니다. 탭이 없거나 URL이 없으면 null을 반환합니다.
 * 
 * @returns 현재 탭의 URL 또는 null
 * 
 * @example
 * ```typescript
 * const url = await getCurrentTabUrl();
 * if (url) {
 *   console.log('현재 URL:', url);
 * }
 * ```
 */
export async function getCurrentTabUrl(): Promise<string | null> {
    const tab = await getCurrentTab();
    return tab?.url || null;
}
