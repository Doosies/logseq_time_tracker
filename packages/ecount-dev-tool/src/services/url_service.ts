import type { ParsedUrl, ServerConfig } from '@/types';
import { DEFAULT_V3_DOMAIN, DEFAULT_V5_DOMAIN, EC5_PATTERN, EC3_PATTERN } from '@/constants';

/**
 * ecount.com URL을 파싱하여 환경 정보를 추출합니다.
 * 
 * 지원하는 환경:
 * - test 서버 (EC5)
 * - zeus 서버 (EC5/EC3)
 * - stage 서버 (EC5/EC3)
 * 
 * @param url_string - 파싱할 URL 문자열
 * @returns 파싱된 URL 정보 객체 또는 null (ecount.com 도메인이 아닌 경우)
 * 
 * @example
 * ```typescript
 * const parsed = parseEcountUrl('https://test.ecount.com/ec5/...');
 * // {
 * //   environment: 'test',
 * //   is_ec5: true,
 * //   is_ec3: false,
 * //   current_server: 'test',
 * //   v5_domain: 'test',
 * //   v3_domain: 'zeus01'
 * // }
 * ```
 */
export function parseEcountUrl(url_string: string): ParsedUrl | null {
    try {
        const url = new URL(url_string);
        const hostname = url.hostname;
        const href = url.href;

        // ecount.com 도메인이 아니면 null 반환
        if (!hostname.includes('ecount.com')) {
            return null;
        }

        const is_ec5 = href.includes(EC5_PATTERN);
        const is_ec3 = href.includes(EC3_PATTERN);

        // test 서버 (EC5)
        if (hostname.includes('test') && is_ec5) {
            const v3_domains_param = url.searchParams.get('__v3domains');
            let v3_domain = DEFAULT_V3_DOMAIN;

            if (v3_domains_param) {
                v3_domain = v3_domains_param.replace(/zeus\d+/, '');
                if (v3_domain === '') {
                    v3_domain = DEFAULT_V3_DOMAIN;
                }
            }

            return {
                environment: 'test',
                is_ec5: true,
                is_ec3: false,
                current_server: 'test',
                v5_domain: 'test',
                v3_domain,
            };
        }

        // zeus 서버 (EC5)
        if (hostname.startsWith('zeus') && is_ec5) {
            const zeus_match = href.match(/zeus(\d+)/);
            const zeus_number = zeus_match ? zeus_match[1] : '01';
            const current_server = `zeus${zeus_number}`;

            const hostname_parts = hostname.split('.');
            let v5_domain = hostname_parts[0]
                ?.replace(/zeus\d+/, '')
                .replace(/-dev$/, '') || '';
            if (v5_domain === '' || !/\d/.test(v5_domain)) {
                v5_domain = DEFAULT_V5_DOMAIN;
            }

            const v3_domains_param = url.searchParams.get('__v3domains');
            let v3_domain = v3_domains_param?.replace(/zeus\d+/, '') || DEFAULT_V3_DOMAIN;
            if (v3_domain === '') {
                v3_domain = DEFAULT_V3_DOMAIN;
            }

            return {
                environment: 'zeus',
                is_ec5: true,
                is_ec3: false,
                current_server,
                v5_domain,
                v3_domain,
                ...(zeus_number ? { zeus_number } : {}),
            };
        }

        // zeus 서버 (EC3)
        if (hostname.startsWith('zeus') && is_ec3) {
            const zeus_match = href.match(/zeus(\d+)/);
            const zeus_number = zeus_match ? zeus_match[1] : '01';
            const current_server = `zeus${zeus_number}`;

            return {
                environment: 'zeus',
                is_ec5: false,
                is_ec3: true,
                current_server,
                v5_domain: '',
                v3_domain: current_server,
                ...(zeus_number ? { zeus_number } : {}),
            };
        }

        // stage 서버
        if (hostname.startsWith('stage')) {
            const stage_match = hostname.match(/stage(\d+)/);
            const stage_number = stage_match ? stage_match[1] : '1';
            const current_server = `stage${stage_number}`;

            return {
                environment: 'stage',
                is_ec5: is_ec5,
                is_ec3: is_ec3,
                current_server,
                v5_domain: current_server,
                v3_domain: current_server,
            };
        }

        return null;
    } catch (error) {
        console.error('Failed to parse URL:', error);
        return null;
    }
}

/**
 * EC5 URL을 빌드합니다.
 * 
 * v5 도메인과 v3 도메인을 설정하여 새로운 EC5 URL을 생성합니다.
 * `__v3domains` 쿼리 파라미터를 자동으로 추가/업데이트합니다.
 * 
 * @param base_url - 기본 URL
 * @param server_config - 서버 설정 객체 (v5_domain, v3_domain)
 * @returns 빌드된 EC5 URL
 * 
 * @example
 * ```typescript
 * const newUrl = buildEc5Url('https://test.ecount.com/ec5/...', {
 *   v5_domain: 'zeus01',
 *   v3_domain: 'zeus01'
 * });
 * // 'https://zeus01.ecount.com/ec5/...?__v3domains=zeus01'
 * ```
 */
export function buildEc5Url(base_url: string, server_config: ServerConfig): string {
    try {
        // v5 도메인으로 호스트 변경
        const new_url = base_url.replace(/https:\/\/[^/]+/, `https://${server_config.v5_domain}.ecount.com`);

        // 해시 분리
        const hash_index = new_url.indexOf('#');
        const hash_part = hash_index !== -1 ? new_url.slice(hash_index) : '';
        const base_url_part = hash_index !== -1 ? new_url.slice(0, hash_index) : new_url;

        // __v3domains 파라미터 업데이트
        let updated_url = base_url_part.replace(/[?&]__v3domains=[^&#]*/, '');
        updated_url += (updated_url.includes('?') ? '&' : '?') + `__v3domains=${server_config.v3_domain}`;

        return updated_url + hash_part;
    } catch (error) {
        console.error('Failed to build URL:', error);
        return base_url;
    }
}

/**
 * EC3 URL을 빌드합니다.
 * 
 * v3 도메인으로 호스트를 변경하여 새로운 EC3 URL을 생성합니다.
 * 
 * @param base_url - 기본 URL
 * @param v3_domain - V3 도메인 (예: 'zeus01', 'test')
 * @returns 빌드된 EC3 URL
 * 
 * @example
 * ```typescript
 * const newUrl = buildEc3Url('https://test.ecount.com/ec3/...', 'zeus01');
 * // 'https://zeus01.ecount.com/ec3/...'
 * ```
 */
export function buildEc3Url(base_url: string, v3_domain: string): string {
    try {
        const new_url = base_url.replace(/https:\/\/[^/]+/, `https://${v3_domain}.ecount.com`);
        return new_url;
    } catch (error) {
        console.error('Failed to build URL:', error);
        return base_url;
    }
}

/**
 * 서버 도메인을 빌드합니다.
 * 
 * prefix와 suffix를 결합하여 서버 도메인 문자열을 생성합니다.
 * 
 * @param prefix - 도메인 접두사 (예: 'ba', 'lxba')
 * @param suffix - 도메인 접미사 (예: '1', '2', '3')
 * @returns 빌드된 서버 도메인 문자열
 * 
 * @example
 * ```typescript
 * const domain = buildServerDomain('ba', '1');
 * // 'ba1'
 * ```
 */
export function buildServerDomain(prefix: string, suffix: string): string {
    return `${prefix}${suffix}`;
}
