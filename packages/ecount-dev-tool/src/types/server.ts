export type Environment = 'test' | 'zeus' | 'stage' | 'unknown';

export type PageType = 'ec5' | 'ec3' | 'stage' | 'unknown';

export interface ParsedUrl {
    environment: Environment;
    page_type: PageType;
    current_server: string;
    v5_domain: string;
    v3_domain: string;
    zeus_number: string;
    url: URL;
}

export interface ServerConfig {
    v5_domain: string;
    v3_domain: string;
}

export interface LoginAccount {
    company: string;
    id: string;
    password: string;
}

export interface PageInfo {
    hasSetDevMode: boolean;
    hasECountApp: boolean;
    hasGetContext: boolean;
    hasConfig: boolean;
    zoneNum: string | null;
    error: string | null;
}

export interface TabState {
    url: string;
    tab_id: number;
    parsed: ParsedUrl | null;
    is_stage: boolean;
    is_loading: boolean;
}
