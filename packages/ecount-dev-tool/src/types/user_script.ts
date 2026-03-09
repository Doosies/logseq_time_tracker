/**
 * 사용자 스크립트 실행 시점
 * - `document_start`: 페이지 DOM 로딩 전 실행 (Tampermonkey @run-at document-start와 동일)
 * - `document_idle`: 페이지 로딩 완료 후 실행 (기본값)
 */
export type RunAt = 'document_start' | 'document_idle';

export interface UserScript {
    id: string;
    name: string;
    enabled: boolean;
    url_patterns: string[];
    code: string;
    run_at: RunAt;
    created_at: number;
    updated_at: number;
}
