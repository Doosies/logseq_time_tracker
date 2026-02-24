import type { PageInfo } from '@/types/server';

/**
 * 로그인 화면에 값을 입력합니다.
 * quickLogin.js의 inputLogin 함수를 그대로 이관합니다.
 *
 * 이 함수는 content script로 실행되므로 DOM API를 직접 사용합니다.
 */
export function inputLogin(key: string, value: string): void {
    const [company, id] = key.split('§');
    (document.getElementById('com_code') as HTMLInputElement).value = company ?? '';
    (document.getElementById('id') as HTMLInputElement).value = id ?? '';
    (document.getElementById('passwd') as HTMLInputElement).value = value;
}

/**
 * 3.0 서버를 로컬로 변경합니다.
 * serverChange.js의 switchV3TestServer 함수를 그대로 이관합니다.
 */
export function switchV3TestServer(): void {
    const url = new URL(top!.location.href);
    url.searchParams.set('__v3domains', 'test');
    top!.location.href = url.href;
}

/**
 * 5.0 서버를 로컬로 변경합니다.
 * serverChange.js의 switchV5TestServer 함수를 그대로 이관합니다.
 */
export function switchV5TestServer(): void {
    const url = new URL(top!.location.href);
    url.host = 'test.ecount.com:5001';
    url.href = url.href.replace('ECERP/ECP/ECP050M', 'ec5/view/erp');
    top!.location.href = url.href;
}

/**
 * 페이지 정보를 가져옵니다 (MAIN world에서 실행).
 * serverChange.js의 debugAndGetPageInfo 함수를 그대로 이관합니다.
 */
export function debugAndGetPageInfo(): PageInfo {
    const debug_info: PageInfo = {
        hasSetDevMode: typeof top?.$ECount?.setDevMode === 'function',
        hasECountApp: typeof top?.$ECountApp !== 'undefined',
        hasGetContext: false,
        hasConfig: false,
        zoneNum: null,
        error: null,
    };

    try {
        if (debug_info.hasECountApp) {
            debug_info.hasGetContext = typeof top!.$ECountApp!.getContext === 'function';
            if (debug_info.hasGetContext) {
                const context = top!.$ECountApp!.getContext();
                debug_info.hasConfig = context != null && typeof context.config !== 'undefined';
                if (debug_info.hasConfig) {
                    debug_info.zoneNum = context.config.ec_zone_num;
                }
            }
        }
    } catch (e) {
        debug_info.error = (e as Error).toString();
    }
    return debug_info;
}
