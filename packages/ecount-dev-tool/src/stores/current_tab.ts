import { writable, derived } from 'svelte/store';
import type { ParsedUrl } from '@/types';
import { getCurrentTabUrl, parseEcountUrl } from '@/services';

/**
 * 현재 탭의 URL을 저장하는 Svelte Store입니다.
 */
export const current_tab_url = writable<string | null>(null);

/**
 * 파싱된 URL 정보를 저장하는 Svelte Store입니다.
 * ecount.com URL이 아닌 경우 null입니다.
 */
export const parsed_url = writable<ParsedUrl | null>(null);

/**
 * 현재 페이지가 ecount.com 페이지인지 여부를 나타내는 derived Store입니다.
 */
export const is_ecount_page = derived(parsed_url, ($parsed_url) => $parsed_url !== null);

/**
 * 현재 활성화된 탭의 URL을 로드하고 파싱합니다.
 * 
 * Chrome Tab API를 사용하여 현재 탭의 URL을 가져오고,
 * ecount.com URL인 경우 파싱하여 stores를 업데이트합니다.
 * 
 * @example
 * ```typescript
 * import { loadCurrentTab, parsed_url } from '@/stores/current_tab';
 * 
 * // 탭 정보 로드
 * await loadCurrentTab();
 * 
 * // 파싱된 URL 읽기
 * $parsed_url?.current_server; // 'test', 'zeus01' 등
 * ```
 */
export async function loadCurrentTab(): Promise<void> {
    const url = await getCurrentTabUrl();
    current_tab_url.set(url);

    if (url) {
        const parsed = parseEcountUrl(url);
        parsed_url.set(parsed);
    } else {
        parsed_url.set(null);
    }
}
