export interface UserScript {
    id: string;
    name: string;
    enabled: boolean;
    url_patterns: string[];
    code: string;
    run_at: 'document_idle';
    created_at: number;
    updated_at: number;
}
