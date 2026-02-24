import type { ParsedUrl, TabState } from '#types/server';
import { parseEcountUrl } from '#services/url_service';
import { getCurrentTab } from '#services/tab_service';

let current_url = $state('');
let tab_id = $state(0);
let parsed = $state<ParsedUrl | null>(null);
let is_loading = $state(true);

const is_stage = $derived(parsed?.environment === 'stage');
const is_supported = $derived(parsed !== null && parsed.environment !== 'unknown');

export function getTabState(): TabState {
    return {
        url: current_url,
        tab_id,
        parsed,
        is_stage,
        is_loading,
    };
}

export function isSupported(): boolean {
    return is_supported;
}

/**
 * popup 오픈 시 현재 탭 정보를 로드합니다.
 */
export async function initializeTabState(): Promise<void> {
    is_loading = true;
    try {
        const tab = await getCurrentTab();
        if (tab?.url && tab.id) {
            current_url = tab.url;
            tab_id = tab.id;
            parsed = parseEcountUrl(tab.url);
        }
    } catch (e) {
        console.error('탭 정보 로드 실패:', e);
    } finally {
        is_loading = false;
    }
}
