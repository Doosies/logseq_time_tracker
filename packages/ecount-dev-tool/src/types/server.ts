/**
 * 서버 환경 타입
 * 
 * ecount.com에서 사용 가능한 서버 환경을 나타냅니다.
 */
export type ServerEnvironment = 'test' | 'zeus' | 'stage' | 'ba';

export type ServerPrefix = 'test' | 'zeus' | 'stage';

export type ServerSuffix =
    | 'ba1'
    | 'ba2'
    | 'ba3'
    | 'lxba1'
    | 'lxba2'
    | 'lxba3'
    | 'smba1'
    | 'smba2'
    | 'smba3'
    | 'xba1'
    | 'xba2'
    | 'xba3';

export type ZeusNumber = string; // zeus01 ~ zeus99

/**
 * 서버 설정 인터페이스
 * 
 * EC5 URL 빌드에 필요한 v5 도메인과 v3 도메인 정보를 포함합니다.
 */
export interface ServerConfig {
    /** V5 도메인 (예: 'test', 'zeus01', 'ba1') */
    v5_domain: string;
    /** V3 도메인 (예: 'zeus01', 'test') */
    v3_domain: string;
}

export interface UrlParts {
    protocol: string;
    hostname: string;
    pathname: string;
    search: string;
    hash: string;
}

/**
 * 파싱된 URL 정보 인터페이스
 * 
 * parseEcountUrl 함수가 반환하는 URL 파싱 결과를 나타냅니다.
 */
export interface ParsedUrl {
    /** 서버 환경 */
    environment: ServerEnvironment;
    /** EC5 여부 */
    is_ec5: boolean;
    /** EC3 여부 */
    is_ec3: boolean;
    /** 현재 서버 이름 (예: 'test', 'zeus01', 'stage1') */
    current_server: string;
    /** V5 도메인 */
    v5_domain: string;
    /** V3 도메인 */
    v3_domain: string;
    /** Zeus 서버 번호 (zeus 환경인 경우만 존재, 예: '01', '02') */
    zeus_number?: string;
}

export type InputMode = 'select' | 'text';
