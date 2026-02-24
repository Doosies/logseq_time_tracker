/**
 * 현재 활성화된 탭을 가져옵니다.
 */
export async function getCurrentTab(): Promise<chrome.tabs.Tab | null> {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });
    return tab ?? null;
}

/**
 * 탭의 URL을 업데이트하고 popup을 닫습니다.
 */
export async function updateTabUrl(tab_id: number, url: string): Promise<void> {
    await chrome.tabs.update(tab_id, { url });
    window.close();
}

/**
 * 탭에서 content script를 실행합니다 (ISOLATED world).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Chrome scripting API의 타입 제약
export async function executeScript(tab_id: number, func: (...args: any[]) => any, args: any[] = []): Promise<any> {
    const results = await chrome.scripting.executeScript({
        target: { tabId: tab_id },
        func,
        args,
    });
    return results?.[0]?.result ?? null;
}

/**
 * 탭에서 MAIN world로 content script를 실행합니다.
 * 페이지의 JS 변수에 접근해야 할 때 사용합니다.
 */
export async function executeMainWorldScript<T>(tab_id: number, func: () => T): Promise<T | null> {
    const results = await chrome.scripting.executeScript({
        target: { tabId: tab_id },
        func,
        world: 'MAIN',
    });
    return (results?.[0]?.result as T) ?? null;
}
