export interface ScriptResult {
    success: boolean;
    result?: unknown;
    error?: string;
}

export async function executeUserScript(tab_id: number, code: string): Promise<ScriptResult> {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab_id },
            world: 'MAIN',
            func: (injected_code: string) => {
                return new Function(injected_code)();
            },
            args: [code],
        });
        return {
            success: true,
            result: results?.[0]?.result,
        };
    } catch (e) {
        return {
            success: false,
            error: e instanceof Error ? e.message : String(e),
        };
    }
}
