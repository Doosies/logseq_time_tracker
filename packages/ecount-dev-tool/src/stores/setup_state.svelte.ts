const STORAGE_KEY = 'setup_completed';

let is_first_launch = $state(false);

/**
 * chrome.storage.local에서 setup_completed 플래그를 확인한다.
 * 플래그가 없으면 첫 설치로 판단한다.
 */
export async function initializeSetupState(): Promise<void> {
    try {
        const result = await chrome.storage.local.get(STORAGE_KEY);
        is_first_launch = !result[STORAGE_KEY];
    } catch {
        is_first_launch = false;
    }
}

export function isFirstLaunch(): boolean {
    return is_first_launch;
}

/**
 * 설정 완료 표시. 가져오기 완료 또는 건너뛰기 시 호출한다.
 */
export async function markSetupCompleted(): Promise<void> {
    is_first_launch = false;
    try {
        await chrome.storage.local.set({ [STORAGE_KEY]: true });
    } catch {
        // 저장 실패해도 현재 세션에서는 false로 유지됨
    }
}

/**
 * 테스트용 리셋 함수.
 */
export function resetSetupState(): void {
    is_first_launch = false;
}
