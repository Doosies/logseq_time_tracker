/**
 * URL hash에서 스크립트 ID 추출
 * 예: "#abc123" → "abc123", "#new" → "new"
 */
export function parseHash(): string | null {
    const hash = window.location.hash.slice(1);
    if (!hash) return null;
    if (hash === 'new') return 'new';
    // 관대한 파싱: UUID 검증 생략, EditorPage에서 최종 검증
    return hash;
}

/**
 * 편집 페이지를 새 탭에서 열기
 */
export async function openEditor(script_id?: string): Promise<void> {
    const url = chrome.runtime.getURL(`src/editor.html#${script_id || 'new'}`);
    await chrome.tabs.create({ url });
}

/**
 * 현재 탭 닫기
 */
export async function closeEditor(): Promise<void> {
    const tab = await chrome.tabs.getCurrent();
    if (tab?.id) {
        await chrome.tabs.remove(tab.id);
    }
}
