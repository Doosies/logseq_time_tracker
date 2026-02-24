import type { ParsedUrl, PageInfo } from '@/types/server';
import { DEFAULT_V3_DOMAIN, DEFAULT_V5_DOMAIN } from '@/constants/servers';

/**
 * ecount.com URL을 파싱하여 환경 정보를 추출합니다.
 * serverChange.js의 URL 분석 로직을 그대로 이관합니다.
 */
export function parseEcountUrl(url_string: string): ParsedUrl | null {
    let url: URL;
    try {
        url = new URL(url_string);
    } catch {
        return null;
    }

    if (!url.hostname.includes('ecount')) return null;

    // stage 환경
    if (url.href.startsWith('https://stage')) {
        return {
            environment: 'stage',
            page_type: 'stage',
            current_server: 'stage',
            v5_domain: '',
            v3_domain: '',
            zeus_number: '',
            url,
        };
    }

    // test + ec5
    if (url.hostname.includes('test') && url.href.includes('ec5/view/erp')) {
        const v3_domain = extractV3Domain(url);
        return {
            environment: 'test',
            page_type: 'ec5',
            current_server: 'test',
            v5_domain: 'test',
            v3_domain,
            zeus_number: '',
            url,
        };
    }

    // zeus + ec5
    if (url.hostname.startsWith('zeus') && url.href.includes('ec5/view/erp')) {
        const zeus_number = url.href.match(/zeus(\d+)/)?.[1] || '01';
        const current_server = `zeus${zeus_number}`;
        const v5_domain = extractV5Domain(url);
        const v3_domain = extractV3Domain(url);
        return {
            environment: 'zeus',
            page_type: 'ec5',
            current_server,
            v5_domain,
            v3_domain,
            zeus_number,
            url,
        };
    }

    // zeus + ec3 (ECP050M)
    if (url.hostname.startsWith('zeus') && url.href.includes('ECERP/ECP/ECP050M')) {
        const zeus_number = url.href.match(/zeus(\d+)/)?.[1] || '01';
        const current_server = `zeus${zeus_number}`;
        const v3_domain = extractV3DomainFromHostname(url);
        const v5_domain = extractV5DomainsParam(url);
        return {
            environment: 'zeus',
            page_type: 'ec3',
            current_server,
            v5_domain,
            v3_domain,
            zeus_number,
            url,
        };
    }

    return {
        environment: 'unknown',
        page_type: 'unknown',
        current_server: UNSUPPORTED_SERVER,
        v5_domain: UNSUPPORTED_SERVER,
        v3_domain: UNSUPPORTED_SERVER,
        zeus_number: '',
        url,
    };
}

const UNSUPPORTED_SERVER = '=====';

function extractV3Domain(url: URL): string {
    const v3_param = url.searchParams.get('__v3domains');
    if (v3_param) {
        const domain = v3_param.replace(/zeus\d+/, '');
        return domain === '' ? DEFAULT_V3_DOMAIN : domain;
    }
    return DEFAULT_V3_DOMAIN;
}

function extractV5Domain(url: URL): string {
    const hostname = url.hostname;
    if (hostname.includes('test')) return 'test';

    let domain = (hostname.split('.')[0] ?? '').replace(/zeus\d+/, '');
    domain = domain.replace(/-dev$/, '');
    if (domain === '' || domain === 'lxba') {
        return DEFAULT_V5_DOMAIN;
    }
    return domain;
}

function extractV3DomainFromHostname(url: URL): string {
    const hostname = url.hostname;
    if (hostname.includes('test')) return 'test';

    const domain = (hostname.split('.')[0] ?? '').replace(/zeus\d+/, '');
    return domain === '' ? DEFAULT_V3_DOMAIN : domain;
}

function extractV5DomainsParam(url: URL): string {
    const v5_param = url.searchParams.get('__v5domains');
    if (v5_param) {
        const domain = v5_param.replace(/zeus\d+/, '');
        return domain === '' ? DEFAULT_V5_DOMAIN : domain;
    }
    return DEFAULT_V5_DOMAIN;
}

/**
 * EC5 URL을 생성합니다.
 * serverChange.js의 changeServerEc5 로직을 그대로 이관합니다.
 */
export function buildEc5Url(current_url: URL, to_v5_server: string, to_v3_server: string): string {
    const new_url = current_url.href.replace(/https:\/\/[^/]+/, `https://${to_v5_server}.ecount.com`);

    const hash_index = new_url.indexOf('#');
    const hash_part = hash_index !== -1 ? new_url.slice(hash_index) : '';
    const base_url = hash_index !== -1 ? new_url.slice(0, hash_index) : new_url;

    let updated_base = base_url.replace(/[?&]__v3domains=[^&#]*/, '');
    updated_base += (updated_base.includes('?') ? '&' : '?') + `__v3domains=${to_v3_server}`;

    return updated_base + hash_part;
}

/**
 * EC3 (ECP050M) URL을 생성합니다.
 * serverChange.js의 changeServerEcp 로직을 그대로 이관합니다.
 */
export function buildEc3Url(current_url: URL, to_v3_server: string, to_v5_server: string): string {
    const new_url = current_url.href.replace(/https:\/\/[^/]+/, `https://${to_v3_server}.ecount.com`);

    const hash_index = new_url.indexOf('#');
    const hash_part = hash_index !== -1 ? new_url.slice(hash_index) : '';
    const base_url = hash_index !== -1 ? new_url.slice(0, hash_index) : new_url;

    let updated_base = base_url.replace(/[?&]__v5domains=[^&#]*/, '');
    updated_base += (updated_base.includes('?') ? '&' : '?') + `__v5domains=${to_v5_server}`;

    return updated_base + hash_part;
}

/**
 * Stage 서버 전환 URL을 생성합니다.
 * serverChange.js의 stage 전환 로직을 그대로 이관합니다.
 */
export function buildStageUrl(current_url: URL): string | null {
    const href = current_url.href;
    let new_url: string;

    if (href.includes('stageba.ecount.com') || href.includes('stageba-dev.ecount.com')) {
        if (href.includes('stageba-dev.ecount.com')) {
            new_url = href.replace('stageba-dev.ecount.com', 'stagelxba2-dev.ecount.com');
        } else {
            new_url = href.replace('stageba.ecount.com', 'stagelxba2.ecount.com');
        }
        if (!new_url.includes('&__v3domains=stageba2')) {
            const hash_index = new_url.indexOf('#');
            if (hash_index !== -1) {
                new_url = new_url.slice(0, hash_index) + '&__v3domains=stageba2' + new_url.slice(hash_index);
            } else {
                new_url += '&__v3domains=stageba2';
            }
        }
        return new_url;
    }

    if (href.includes('stagelxba2.ecount.com') || href.includes('stagelxba2-dev.ecount.com')) {
        if (href.includes('stagelxba2-dev.ecount.com')) {
            new_url = href.replace('stagelxba2-dev.ecount.com', 'stageba-dev.ecount.com');
        } else {
            new_url = href.replace('stagelxba2.ecount.com', 'stageba.ecount.com');
        }
        new_url = new_url.replace('&__v3domains=stageba2', '');
        return new_url;
    }

    return null;
}

/**
 * Stage 전환 버튼 라벨을 결정합니다.
 */
export function getStageButtonLabel(url: URL): string {
    const href = url.href;
    if (href.includes('stageba.ecount.com') || href.includes('stageba-dev.ecount.com')) {
        return 'stageba2로 전환';
    }
    if (href.includes('stagelxba2.ecount.com') || href.includes('stagelxba2-dev.ecount.com')) {
        return 'stageba1로 전환';
    }
    return '';
}

/**
 * devMode(disableMin) URL을 생성합니다.
 * serverChange.js의 dev-local 버튼 로직을 그대로 이관합니다.
 */
export function buildDevUrl(current_url: URL, page_info: PageInfo): URL {
    const url = new URL(current_url.href);

    if (url.hostname.startsWith('login')) {
        const domain_index = url.hostname.indexOf('ecount');
        const base_domain = url.hostname.substring(domain_index);

        if (page_info.zoneNum) {
            const zone_id = page_info.zoneNum.toLowerCase();
            url.hostname = `loginlx${zone_id}.${base_domain}`;
        } else {
            if (!url.hostname.startsWith('loginlx')) {
                url.hostname = url.hostname.replace('login', 'loginlx');
            }
        }
    }

    if (page_info.hasSetDevMode) {
        url.searchParams.set('__disableMin', 'Y');
    } else {
        return switchToDevServerForLegacy(url, page_info);
    }

    return url;
}

function switchToDevServerForLegacy(url: URL, page_info: PageInfo): URL {
    let server_prefix: string = '';
    const hostname = url.hostname;

    if (hostname.startsWith('login')) {
        server_prefix = 'login';
    } else if (hostname.startsWith('stage')) {
        server_prefix = 'stage';
    } else if (hostname.startsWith('zeus')) {
        server_prefix = 'zeus';
    }

    let current_v3_domain = url.searchParams.get('__v3domains');

    if (!current_v3_domain) {
        const zone_id = page_info?.zoneNum?.toLowerCase();
        if (zone_id) {
            current_v3_domain = server_prefix + zone_id;
        }
    }

    if (current_v3_domain) {
        const v3_with_dev = current_v3_domain.includes('-dev') ? current_v3_domain : current_v3_domain + '-dev';
        url.searchParams.set('__v3domains', v3_with_dev);
    }

    if (!hostname.includes('-dev')) {
        url.hostname = hostname.replace(/(\.ecount\..*)$/, '-dev$1');
    }

    return url;
}
