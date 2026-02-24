import { describe, it, expect } from 'vitest';
import {
    parseEcountUrl,
    buildEc5Url,
    buildEc3Url,
    buildStageUrl,
    getStageButtonLabel,
    buildDevUrl,
} from './url_service';
import type { PageInfo } from '#types/server';

describe('parseEcountUrl', () => {
    it('유효하지 않은 URL일 때 null을 반환해야 함', () => {
        expect(parseEcountUrl('not-a-url')).toBeNull();
        expect(parseEcountUrl('')).toBeNull();
    });

    it('ecount가 포함되지 않은 호스트일 때 null을 반환해야 함', () => {
        expect(parseEcountUrl('https://google.com/page')).toBeNull();
        expect(parseEcountUrl('https://example.com/ecount')).toBeNull();
    });

    it('stage 환경 URL을 올바르게 파싱해야 함', () => {
        const result = parseEcountUrl('https://stageba.ecount.com/ec5/view/erp');
        expect(result).not.toBeNull();
        expect(result!.environment).toBe('stage');
        expect(result!.page_type).toBe('stage');
        expect(result!.current_server).toBe('stage');
    });

    it('test + ec5 URL을 올바르게 파싱해야 함', () => {
        const result = parseEcountUrl('https://onetestba1.ecount.com/ec5/view/erp');
        expect(result).not.toBeNull();
        expect(result!.environment).toBe('test');
        expect(result!.page_type).toBe('ec5');
        expect(result!.current_server).toBe('test');
        expect(result!.v5_domain).toBe('test');
    });

    it('zeus + ec5 URL을 올바르게 파싱해야 함', () => {
        const result = parseEcountUrl('https://zeus01lxba1.ecount.com/ec5/view/erp?__v3domains=zeus01ba1');
        expect(result).not.toBeNull();
        expect(result!.environment).toBe('zeus');
        expect(result!.page_type).toBe('ec5');
        expect(result!.current_server).toBe('zeus01');
        expect(result!.zeus_number).toBe('01');
    });

    it('zeus + ec5 URL에서 __v3domains가 없을 때 기본값을 사용해야 함', () => {
        const result = parseEcountUrl('https://zeus01lxba1.ecount.com/ec5/view/erp');
        expect(result).not.toBeNull();
        expect(result!.v3_domain).toBe('ba1');
    });

    it('zeus + ec3 (ECP050M) URL을 올바르게 파싱해야 함', () => {
        const result = parseEcountUrl('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M?__v5domains=zeus01lxba1');
        expect(result).not.toBeNull();
        expect(result!.environment).toBe('zeus');
        expect(result!.page_type).toBe('ec3');
        expect(result!.current_server).toBe('zeus01');
        expect(result!.v3_domain).toBe('ba1');
        expect(result!.v5_domain).toBe('lxba1');
    });

    it('zeus + ec3 URL에서 __v5domains가 없을 때 기본값을 사용해야 함', () => {
        const result = parseEcountUrl('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M');
        expect(result).not.toBeNull();
        expect(result!.v5_domain).toBe('lxba1');
    });

    it('지원하지 않는 ecount URL일 때 unknown을 반환해야 함', () => {
        const result = parseEcountUrl('https://other.ecount.com/some/page');
        expect(result).not.toBeNull();
        expect(result!.environment).toBe('unknown');
        expect(result!.page_type).toBe('unknown');
        expect(result!.current_server).toBe('=====');
    });
});

describe('buildEc5Url', () => {
    it('EC5 URL을 올바르게 생성해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp?__v3domains=zeus01ba1');
        const result = buildEc5Url(current_url, 'zeus01lxba2', 'zeus01ba2');
        expect(result).toContain('zeus01lxba2.ecount.com');
        expect(result).toContain('__v3domains=zeus01ba2');
    });

    it('hash가 있을 때 hash를 보존해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp#/some/hash');
        const result = buildEc5Url(current_url, 'zeus01lxba2', 'zeus01ba2');
        expect(result).toContain('#/some/hash');
    });

    it('기존 __v3domains 파라미터를 교체해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp?foo=bar&__v3domains=zeus01ba1');
        const result = buildEc5Url(current_url, 'zeus01lxba2', 'zeus01ba2');
        expect(result).toContain('__v3domains=zeus01ba2');
        expect(result).not.toContain('__v3domains=zeus01ba1');
    });
});

describe('buildEc3Url', () => {
    it('EC3 URL을 올바르게 생성해야 함', () => {
        const current_url = new URL('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M?__v5domains=zeus01lxba1');
        const result = buildEc3Url(current_url, 'zeus01ba2', 'zeus01lxba2');
        expect(result).toContain('zeus01ba2.ecount.com');
        expect(result).toContain('__v5domains=zeus01lxba2');
    });

    it('hash가 있을 때 hash를 보존해야 함', () => {
        const current_url = new URL('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M#/hash');
        const result = buildEc3Url(current_url, 'zeus01ba2', 'zeus01lxba2');
        expect(result).toContain('#/hash');
    });

    it('기존 __v5domains 파라미터를 교체해야 함', () => {
        const current_url = new URL('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M?__v5domains=zeus01lxba1');
        const result = buildEc3Url(current_url, 'zeus01ba2', 'zeus01lxba2');
        expect(result).toContain('__v5domains=zeus01lxba2');
        expect(result).not.toContain('__v5domains=zeus01lxba1');
    });
});

describe('buildStageUrl', () => {
    it('stageba에서 stagelxba2로 전환해야 함', () => {
        const current_url = new URL('https://stageba.ecount.com/ec5/view/erp');
        const result = buildStageUrl(current_url);
        expect(result).not.toBeNull();
        expect(result).toContain('stagelxba2.ecount.com');
        expect(result).toContain('__v3domains=stageba2');
    });

    it('stageba-dev에서 stagelxba2-dev로 전환해야 함', () => {
        const current_url = new URL('https://stageba-dev.ecount.com/ec5/view/erp');
        const result = buildStageUrl(current_url);
        expect(result).not.toBeNull();
        expect(result).toContain('stagelxba2-dev.ecount.com');
    });

    it('stagelxba2에서 stageba로 전환해야 함', () => {
        const current_url = new URL('https://stagelxba2.ecount.com/ec5/view/erp?foo=bar&__v3domains=stageba2');
        const result = buildStageUrl(current_url);
        expect(result).not.toBeNull();
        expect(result).toContain('stageba.ecount.com');
        expect(result).not.toContain('__v3domains=stageba2');
    });

    it('stagelxba2-dev에서 stageba-dev로 전환해야 함', () => {
        const current_url = new URL('https://stagelxba2-dev.ecount.com/ec5/view/erp');
        const result = buildStageUrl(current_url);
        expect(result).not.toBeNull();
        expect(result).toContain('stageba-dev.ecount.com');
    });

    it('stage URL이 아닐 때 null을 반환해야 함', () => {
        const current_url = new URL('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M');
        const result = buildStageUrl(current_url);
        expect(result).toBeNull();
    });
});

describe('getStageButtonLabel', () => {
    it('stageba URL일 때 stageba2로 전환 라벨을 반환해야 함', () => {
        const url = new URL('https://stageba.ecount.com/ec5/view/erp');
        expect(getStageButtonLabel(url)).toBe('stageba2로 전환');
    });

    it('stageba-dev URL일 때 stageba2로 전환 라벨을 반환해야 함', () => {
        const url = new URL('https://stageba-dev.ecount.com/ec5/view/erp');
        expect(getStageButtonLabel(url)).toBe('stageba2로 전환');
    });

    it('stagelxba2 URL일 때 stageba1로 전환 라벨을 반환해야 함', () => {
        const url = new URL('https://stagelxba2.ecount.com/ec5/view/erp');
        expect(getStageButtonLabel(url)).toBe('stageba1로 전환');
    });

    it('stagelxba2-dev URL일 때 stageba1로 전환 라벨을 반환해야 함', () => {
        const url = new URL('https://stagelxba2-dev.ecount.com/ec5/view/erp');
        expect(getStageButtonLabel(url)).toBe('stageba1로 전환');
    });

    it('stage URL이 아닐 때 빈 문자열을 반환해야 함', () => {
        const url = new URL('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M');
        expect(getStageButtonLabel(url)).toBe('');
    });
});

describe('buildDevUrl', () => {
    it('hasSetDevMode가 true일 때 __disableMin을 설정해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp');
        const page_info: PageInfo = {
            hasSetDevMode: true,
            hasECountApp: false,
            hasGetContext: false,
            hasConfig: false,
            zoneNum: null,
            error: null,
        };
        const result = buildDevUrl(current_url, page_info);
        expect(result.searchParams.get('__disableMin')).toBe('Y');
    });

    it('hasSetDevMode가 false이고 zeus 호스트일 때 -dev 서버 URL을 생성해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp?__v3domains=zeus01lxba1');
        const page_info: PageInfo = {
            hasSetDevMode: false,
            hasECountApp: false,
            hasGetContext: false,
            hasConfig: false,
            zoneNum: 'BA1',
            error: null,
        };
        const result = buildDevUrl(current_url, page_info);
        expect(result.hostname).toContain('-dev');
        expect(result.searchParams.get('__v3domains')).toContain('-dev');
    });

    it('hasSetDevMode가 false이고 zoneNum이 있을 때 __v3domains를 zone 기반으로 설정해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp');
        const page_info: PageInfo = {
            hasSetDevMode: false,
            hasECountApp: false,
            hasGetContext: false,
            hasConfig: false,
            zoneNum: 'BA1',
            error: null,
        };
        const result = buildDevUrl(current_url, page_info);
        expect(result.searchParams.get('__v3domains')).toBe('zeusba1-dev');
    });

    it('hasSetDevMode가 false이고 current_v3_domain이 null이고 zoneNum이 없을 때 hostname만 -dev로 변경해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp');
        const page_info: PageInfo = {
            hasSetDevMode: false,
            hasECountApp: false,
            hasGetContext: false,
            hasConfig: false,
            zoneNum: null,
            error: null,
        };
        const result = buildDevUrl(current_url, page_info);
        expect(result.hostname).toContain('-dev');
    });

    it('login 호스트일 때 zoneNum에 따라 loginlx{zone}으로 변경해야 함', () => {
        const current_url = new URL('https://loginba1.ecount.com/login/login.aspx');
        const page_info: PageInfo = {
            hasSetDevMode: true,
            hasECountApp: false,
            hasGetContext: false,
            hasConfig: false,
            zoneNum: 'BA1',
            error: null,
        };
        const result = buildDevUrl(current_url, page_info);
        expect(result.hostname).toContain('loginlxba1');
    });

    it('login 호스트이고 zoneNum이 없을 때 login을 loginlx로 변경해야 함', () => {
        const current_url = new URL('https://loginba1.ecount.com/login/login.aspx');
        const page_info: PageInfo = {
            hasSetDevMode: true,
            hasECountApp: false,
            hasGetContext: false,
            hasConfig: false,
            zoneNum: null,
            error: null,
        };
        const result = buildDevUrl(current_url, page_info);
        expect(result.hostname).toContain('loginlx');
    });
});
