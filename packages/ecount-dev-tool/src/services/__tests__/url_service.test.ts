import { describe, it, expect } from 'vitest';
import {
    parseEcountUrl,
    buildEc5Url,
    buildEc3Url,
    buildStageUrl,
    getStageButtonLabel,
    buildDevUrl,
} from '../url_service';
import type { PageInfo } from '#types/server';

function createPageInfo(overrides: Partial<PageInfo> = {}): PageInfo {
    return {
        hasSetDevMode: false,
        hasECountApp: false,
        hasGetContext: false,
        hasConfig: false,
        zoneNum: null,
        error: null,
        ...overrides,
    };
}

describe('parseEcountUrl', () => {
    it('빈 문자열일 때 null을 반환해야 함', () => {
        expect(parseEcountUrl('')).toBeNull();
    });

    it('유효하지 않은 URL일 때 null을 반환해야 함', () => {
        expect(parseEcountUrl('not-a-url')).toBeNull();
    });

    it('ecount가 포함되지 않은 호스트일 때 null을 반환해야 함', () => {
        expect(parseEcountUrl('https://google.com/page')).toBeNull();
    });

    it('hostname에 ecount가 없을 때 null을 반환해야 함', () => {
        expect(parseEcountUrl('https://example.com/ecount')).toBeNull();
    });

    it('stageba URL을 stage/stage/stage로 파싱해야 함', () => {
        const parsed_result = parseEcountUrl('https://stageba.ecount.com/ec5/view/erp');
        expect(parsed_result).not.toBeNull();
        expect(parsed_result!.environment).toBe('stage');
        expect(parsed_result!.page_type).toBe('stage');
        expect(parsed_result!.current_server).toBe('stage');
    });

    it('stagelxba2 URL을 stage/stage/stage로 파싱해야 함', () => {
        const parsed_result = parseEcountUrl('https://stagelxba2.ecount.com/ec5/view/erp');
        expect(parsed_result).not.toBeNull();
        expect(parsed_result!.environment).toBe('stage');
        expect(parsed_result!.current_server).toBe('stage');
    });

    it('stageba-dev URL을 stage/stage/stage로 파싱해야 함', () => {
        const parsed_result = parseEcountUrl('https://stageba-dev.ecount.com/ec5/view/erp');
        expect(parsed_result).not.toBeNull();
        expect(parsed_result!.environment).toBe('stage');
    });

    it('test + ec5 URL에서 v3domains 없을 때 test/ec5/test, v5=test, v3=ba1을 반환해야 함', () => {
        const parsed_result = parseEcountUrl('https://onetestba1.ecount.com/ec5/view/erp');
        expect(parsed_result).not.toBeNull();
        expect(parsed_result!.environment).toBe('test');
        expect(parsed_result!.page_type).toBe('ec5');
        expect(parsed_result!.current_server).toBe('test');
        expect(parsed_result!.v5_domain).toBe('test');
        expect(parsed_result!.v3_domain).toBe('ba1');
    });

    it('test + ec5 URL에서 __v3domains=test일 때 v3=test를 반환해야 함', () => {
        const parsed_result = parseEcountUrl('https://onetestba1.ecount.com/ec5/view/erp?__v3domains=test');
        expect(parsed_result).not.toBeNull();
        expect(parsed_result!.v3_domain).toBe('test');
    });

    it('test + ec5 URL에서 __v3domains=zeus01ba2일 때 v3=ba2를 반환해야 함', () => {
        const parsed_result = parseEcountUrl('https://onetestba1.ecount.com/ec5/view/erp?__v3domains=zeus01ba2');
        expect(parsed_result).not.toBeNull();
        expect(parsed_result!.v3_domain).toBe('ba2');
    });

    it('zeus + ec5 URL에서 __v3domains=zeus01ba1일 때 zeus/ec5/zeus01, v5=lxba1, v3=ba1을 반환해야 함', () => {
        const parsed_result = parseEcountUrl('https://zeus01lxba1.ecount.com/ec5/view/erp?__v3domains=zeus01ba1');
        expect(parsed_result).not.toBeNull();
        expect(parsed_result!.environment).toBe('zeus');
        expect(parsed_result!.page_type).toBe('ec5');
        expect(parsed_result!.current_server).toBe('zeus01');
        expect(parsed_result!.v5_domain).toBe('lxba1');
        expect(parsed_result!.v3_domain).toBe('ba1');
    });

    it('zeus + ec5 URL에서 v3domains 없을 때 v3=ba1 기본값을 사용해야 함', () => {
        const parsed_result = parseEcountUrl('https://zeus01lxba1.ecount.com/ec5/view/erp');
        expect(parsed_result).not.toBeNull();
        expect(parsed_result!.v3_domain).toBe('ba1');
    });

    it('zeus02lxba3 URL에서 zeus_number=02, v5=lxba3를 반환해야 함', () => {
        const parsed_result = parseEcountUrl('https://zeus02lxba3.ecount.com/ec5/view/erp');
        expect(parsed_result).not.toBeNull();
        expect(parsed_result!.zeus_number).toBe('02');
        expect(parsed_result!.v5_domain).toBe('lxba3');
    });

    it('zeus01lxba1-dev URL에서 -dev 제거 후 v5=lxba1을 반환해야 함', () => {
        const parsed_result = parseEcountUrl('https://zeus01lxba1-dev.ecount.com/ec5/view/erp');
        expect(parsed_result).not.toBeNull();
        expect(parsed_result!.v5_domain).toBe('lxba1');
    });

    it('zeus + ec3 URL에서 __v5domains=zeus01lxba1일 때 zeus/ec3/zeus01, v3=ba1, v5=lxba1을 반환해야 함', () => {
        const parsed_result = parseEcountUrl('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M?__v5domains=zeus01lxba1');
        expect(parsed_result).not.toBeNull();
        expect(parsed_result!.environment).toBe('zeus');
        expect(parsed_result!.page_type).toBe('ec3');
        expect(parsed_result!.v3_domain).toBe('ba1');
        expect(parsed_result!.v5_domain).toBe('lxba1');
    });

    it('zeus + ec3 URL에서 v5domains 없을 때 v5=lxba1 기본값을 사용해야 함', () => {
        const parsed_result = parseEcountUrl('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M');
        expect(parsed_result).not.toBeNull();
        expect(parsed_result!.v5_domain).toBe('lxba1');
    });

    it('zeus + ec3 URL에서 __v5domains=zeus01lxba3일 때 v5=lxba3를 반환해야 함', () => {
        const parsed_result = parseEcountUrl('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M?__v5domains=zeus01lxba3');
        expect(parsed_result).not.toBeNull();
        expect(parsed_result!.v5_domain).toBe('lxba3');
    });

    it('지원하지 않는 ecount URL일 때 unknown/unknown/=====를 반환해야 함', () => {
        const parsed_result = parseEcountUrl('https://other.ecount.com/some/page');
        expect(parsed_result).not.toBeNull();
        expect(parsed_result!.environment).toBe('unknown');
        expect(parsed_result!.page_type).toBe('unknown');
        expect(parsed_result!.current_server).toBe('=====');
        expect(parsed_result!.v5_domain).toBe('=====');
        expect(parsed_result!.v3_domain).toBe('=====');
    });

    it('hash와 쿼리가 복합된 URL을 정상 파싱해야 함', () => {
        const parsed_result = parseEcountUrl(
            'https://zeus01lxba1.ecount.com/ec5/view/erp?foo=bar&__v3domains=zeus01ba1#/hash',
        );
        expect(parsed_result).not.toBeNull();
        expect(parsed_result!.v3_domain).toBe('ba1');
    });

    it('__v3domains가 zeus 번호만 있을 때(빈 suffix) v3=ba1 기본값을 사용해야 함', () => {
        const parsed_result = parseEcountUrl('https://zeus01lxba1.ecount.com/ec5/view/erp?__v3domains=zeus01');
        expect(parsed_result).not.toBeNull();
        expect(parsed_result!.v3_domain).toBe('ba1');
    });
});

describe('buildEc5Url', () => {
    it('기본 서버 변경이 올바르게 동작해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp?__v3domains=zeus01ba1');
        const result = buildEc5Url(current_url, 'zeus01lxba2', 'zeus01ba2');
        expect(result).toContain('zeus01lxba2.ecount.com');
        expect(result).toContain('__v3domains=zeus01ba2');
    });

    it('hash를 보존해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp#/some/hash');
        const result = buildEc5Url(current_url, 'zeus01lxba2', 'zeus01ba2');
        expect(result).toContain('#/some/hash');
    });

    it('기존 __v3domains를 교체해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp?foo=bar&__v3domains=zeus01ba1');
        const result = buildEc5Url(current_url, 'zeus01lxba2', 'zeus01ba2');
        expect(result).toContain('__v3domains=zeus01ba2');
        expect(result).not.toContain('__v3domains=zeus01ba1');
    });

    it('쿼리파라미터 없는 URL에서 ?로 __v3domains를 추가해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp');
        const result = buildEc5Url(current_url, 'zeus01lxba2', 'zeus01ba2');
        expect(result).toMatch(/\?__v3domains=zeus01ba2/);
    });

    it('다른 쿼리파라미터가 있는 URL에서 &로 __v3domains를 추가해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp?foo=bar');
        const result = buildEc5Url(current_url, 'zeus01lxba2', 'zeus01ba2');
        expect(result).toContain('foo=bar');
        expect(result).toContain('__v3domains=zeus01ba2');
    });

    it('hash와 쿼리가 복합된 URL에서 둘 다 보존해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp?foo=bar#/hash');
        const result = buildEc5Url(current_url, 'zeus01lxba2', 'zeus01ba2');
        expect(result).toContain('#/hash');
        expect(result).toContain('foo=bar');
    });

    it('test 환경 서버 변경이 올바르게 동작해야 함', () => {
        const current_url = new URL('https://onetestba1.ecount.com/ec5/view/erp?__v3domains=test');
        const result = buildEc5Url(current_url, 'test', 'test');
        expect(result).toContain('test.ecount.com');
        expect(result).toContain('__v3domains=test');
    });

    it('__v3domains가 URL 중간에 있을 때 교체해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp?foo=bar&__v3domains=zeus01ba1&baz=y');
        const result = buildEc5Url(current_url, 'zeus01lxba2', 'zeus01ba2');
        expect(result).toContain('__v3domains=zeus01ba2');
        expect(result).not.toContain('__v3domains=zeus01ba1');
    });

    it('text 모드 값(test)으로 서버 변경 시 test.ecount.com을 사용해야 함', () => {
        const current_url = new URL('https://onetestba1.ecount.com/ec5/view/erp?__v3domains=zeus01ba1');
        const result = buildEc5Url(current_url, 'test', 'test');
        expect(result).toContain('test.ecount.com');
    });

    it('빈 to_v5_server 처리 시 빈 hostname prefix를 사용해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp?__v3domains=zeus01ba1');
        const result = buildEc5Url(current_url, '', 'zeus01ba2');
        expect(result).toContain('.ecount.com');
    });
});

describe('buildEc3Url', () => {
    it('기본 서버 변경이 올바르게 동작해야 함 (hostname=v3, param=v5)', () => {
        const current_url = new URL('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M?__v5domains=zeus01lxba1');
        const result = buildEc3Url(current_url, 'zeus01ba2', 'zeus01lxba2');
        expect(result).toContain('zeus01ba2.ecount.com');
        expect(result).toContain('__v5domains=zeus01lxba2');
    });

    it('hash를 보존해야 함', () => {
        const current_url = new URL('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M#/hash');
        const result = buildEc3Url(current_url, 'zeus01ba2', 'zeus01lxba2');
        expect(result).toContain('#/hash');
    });

    it('기존 __v5domains를 교체해야 함', () => {
        const current_url = new URL('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M?__v5domains=zeus01lxba1');
        const result = buildEc3Url(current_url, 'zeus01ba2', 'zeus01lxba2');
        expect(result).toContain('__v5domains=zeus01lxba2');
        expect(result).not.toContain('__v5domains=zeus01lxba1');
    });

    it('쿼리파라미터 없는 URL에서 ?로 __v5domains를 추가해야 함', () => {
        const current_url = new URL('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M');
        const result = buildEc3Url(current_url, 'zeus01ba2', 'zeus01lxba2');
        expect(result).toMatch(/\?__v5domains=zeus01lxba2/);
    });

    it('다른 쿼리파라미터와 함께 __v5domains를 추가해야 함', () => {
        const current_url = new URL('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M?foo=bar');
        const result = buildEc3Url(current_url, 'zeus01ba2', 'zeus01lxba2');
        expect(result).toContain('foo=bar');
        expect(result).toContain('__v5domains=zeus01lxba2');
    });

    it('hash와 쿼리가 복합된 URL에서 둘 다 보존해야 함', () => {
        const current_url = new URL('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M?foo=bar#/hash');
        const result = buildEc3Url(current_url, 'zeus01ba2', 'zeus01lxba2');
        expect(result).toContain('#/hash');
        expect(result).toContain('foo=bar');
    });

    it('text 모드 값으로 서버 변경 시 올바르게 동작해야 함', () => {
        const current_url = new URL('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M?__v5domains=zeus01lxba1');
        const result = buildEc3Url(current_url, 'zeus01ba2', 'test');
        expect(result).toContain('__v5domains=test');
    });

    it('__v5domains가 URL 중간에 있을 때 교체해야 함', () => {
        const current_url = new URL(
            'https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M?foo=bar&__v5domains=zeus01lxba1&baz=y',
        );
        const result = buildEc3Url(current_url, 'zeus01ba2', 'zeus01lxba2');
        expect(result).toContain('__v5domains=zeus01lxba2');
        expect(result).not.toContain('__v5domains=zeus01lxba1');
    });

    it('hash만 있는 URL에서 hash를 보존해야 함', () => {
        const current_url = new URL('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M#/route');
        const result = buildEc3Url(current_url, 'zeus01ba2', 'zeus01lxba2');
        expect(result).toContain('#/route');
    });

    it('쿼리와 hash가 모두 있을 때 순서를 유지해야 함', () => {
        const current_url = new URL('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M?a=1&__v5domains=zeus01lxba1#/x');
        const result = buildEc3Url(current_url, 'zeus01ba2', 'zeus01lxba2');
        expect(result).toMatch(/__v5domains=zeus01lxba2.*#\/x/);
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

    it('stageba에서 stagelxba2로 전환 시 __v3domains=stageba2를 추가해야 함', () => {
        const current_url = new URL('https://stageba.ecount.com/ec5/view/erp');
        const result = buildStageUrl(current_url);
        expect(result).toContain('__v3domains=stageba2');
    });

    it('이미 __v3domains=stageba2가 있으면 중복 추가하지 않아야 함', () => {
        const current_url = new URL('https://stageba.ecount.com/ec5/view/erp?foo=bar&__v3domains=stageba2');
        const result = buildStageUrl(current_url);
        const match_count = (result ?? '').match(/__v3domains=stageba2/g);
        expect(match_count?.length ?? 0).toBeLessThanOrEqual(1);
    });

    it('stagelxba2에서 stageba로 전환 시 &__v3domains=stageba2를 제거해야 함', () => {
        const current_url = new URL('https://stagelxba2.ecount.com/ec5/view/erp?foo=bar&__v3domains=stageba2');
        const result = buildStageUrl(current_url);
        expect(result).not.toContain('__v3domains=stageba2');
    });

    it('stageba + hash일 때 hash를 보존해야 함', () => {
        const current_url = new URL('https://stageba.ecount.com/ec5/view/erp#/some/hash');
        const result = buildStageUrl(current_url);
        expect(result).toContain('#/some/hash');
    });

    it('stagelxba2 + hash일 때 hash를 보존해야 함', () => {
        const current_url = new URL('https://stagelxba2.ecount.com/ec5/view/erp?__v3domains=stageba2#/hash');
        const result = buildStageUrl(current_url);
        expect(result).toContain('#/hash');
    });

    it('stage가 아닌 URL일 때 null을 반환해야 함', () => {
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

    it('비-stage URL일 때 빈 문자열을 반환해야 함', () => {
        const url = new URL('https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M');
        expect(getStageButtonLabel(url)).toBe('');
    });
});

describe('buildDevUrl', () => {
    it('hasSetDevMode=true, 일반 URL일 때 __disableMin=Y를 추가해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp');
        const page_info = createPageInfo({ hasSetDevMode: true });
        const result = buildDevUrl(current_url, page_info);
        expect(result.searchParams.get('__disableMin')).toBe('Y');
    });

    it('hasSetDevMode=true, 기존 __disableMin이 있을 때 값을 교체해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp?__disableMin=N');
        const page_info = createPageInfo({ hasSetDevMode: true });
        const result = buildDevUrl(current_url, page_info);
        expect(result.searchParams.get('__disableMin')).toBe('Y');
    });

    it('hasSetDevMode=false, zeus URL + __v3domains 있을 때 hostname과 __v3domains에 -dev를 추가해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp?__v3domains=zeus01lxba1');
        const page_info = createPageInfo({ hasSetDevMode: false });
        const result = buildDevUrl(current_url, page_info);
        expect(result.hostname).toContain('-dev');
        expect(result.searchParams.get('__v3domains')).toContain('-dev');
    });

    it('hasSetDevMode=false, zeus URL + __v3domains 없음 + zoneNum 있을 때 zone 기반 __v3domains에 -dev를 추가해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp');
        const page_info = createPageInfo({ hasSetDevMode: false, zoneNum: 'BA1' });
        const result = buildDevUrl(current_url, page_info);
        expect(result.searchParams.get('__v3domains')).toBe('zeusba1-dev');
    });

    it('hasSetDevMode=false, zeus URL + __v3domains 없음 + zoneNum 없음일 때 hostname만 -dev로 변경해야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp');
        const page_info = createPageInfo({ hasSetDevMode: false, zoneNum: null });
        const result = buildDevUrl(current_url, page_info);
        expect(result.hostname).toContain('-dev');
    });

    it('login + zoneNum일 때 loginlx{zone}.ecount.com + __disableMin을 사용해야 함', () => {
        const current_url = new URL('https://loginba1.ecount.com/login/login.aspx');
        const page_info = createPageInfo({ hasSetDevMode: true, zoneNum: 'BA1' });
        const result = buildDevUrl(current_url, page_info);
        expect(result.hostname).toContain('loginlxba1');
        expect(result.searchParams.get('__disableMin')).toBe('Y');
    });

    it('login + zoneNum 없음일 때 loginlx...ecount.com을 사용해야 함', () => {
        const current_url = new URL('https://loginba1.ecount.com/login/login.aspx');
        const page_info = createPageInfo({ hasSetDevMode: true, zoneNum: null });
        const result = buildDevUrl(current_url, page_info);
        expect(result.hostname).toContain('loginlx');
    });

    it('loginlx가 이미 있을 때 중복 변환하지 않아야 함', () => {
        const current_url = new URL('https://loginlxba1.ecount.com/login/login.aspx');
        const page_info = createPageInfo({ hasSetDevMode: true, zoneNum: 'BA1' });
        const result = buildDevUrl(current_url, page_info);
        expect(result.hostname).toBe('loginlxba1.ecount.com');
    });

    it('stage + legacy일 때 hostname과 __v3domains에 -dev를 추가해야 함', () => {
        const current_url = new URL('https://stageba.ecount.com/ec5/view/erp?__v3domains=stageba');
        const page_info = createPageInfo({ hasSetDevMode: false });
        const result = buildDevUrl(current_url, page_info);
        expect(result.hostname).toContain('-dev');
        expect(result.searchParams.get('__v3domains')).toContain('-dev');
    });

    it('__v3domains가 이미 -dev 포함 시 중복 -dev를 추가하지 않아야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp?__v3domains=zeus01lxba1-dev');
        const page_info = createPageInfo({ hasSetDevMode: false });
        const result = buildDevUrl(current_url, page_info);
        const v3 = result.searchParams.get('__v3domains') ?? '';
        expect(v3).not.toMatch(/-dev-dev/);
    });

    it('hostname이 이미 -dev 포함 시 중복 -dev를 추가하지 않아야 함', () => {
        const current_url = new URL('https://zeus01lxba1-dev.ecount.com/ec5/view/erp?__v3domains=zeus01lxba1');
        const page_info = createPageInfo({ hasSetDevMode: false });
        const result = buildDevUrl(current_url, page_info);
        expect(result.hostname).not.toMatch(/-dev-dev/);
    });

    it('hasSetDevMode=false, login + legacy일 때 hostname -dev, __v3domains 생성해야 함', () => {
        const current_url = new URL('https://loginba1.ecount.com/login/login.aspx');
        const page_info = createPageInfo({ hasSetDevMode: false, zoneNum: 'BA1' });
        const result = buildDevUrl(current_url, page_info);
        expect(result.hostname).toContain('-dev');
        expect(result.searchParams.get('__v3domains')).toContain('-dev');
    });

    it('zeus + __v3domains + zoneNum일 때 __v3domains 기반으로 처리해야 함 (zoneNum 무시)', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp?__v3domains=zeus01ba1');
        const page_info = createPageInfo({ hasSetDevMode: false, zoneNum: 'BA2' });
        const result = buildDevUrl(current_url, page_info);
        expect(result.searchParams.get('__v3domains')).toBe('zeus01ba1-dev');
    });

    it('빈 zoneNum string일 때 zone 기반 __v3domains를 생성하지 않아야 함', () => {
        const current_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp');
        const page_info = createPageInfo({ hasSetDevMode: false, zoneNum: '' });
        const result = buildDevUrl(current_url, page_info);
        expect(result.hostname).toContain('-dev');
    });

    it('login 도메인 변환 후 hasSetDevMode=false일 때 switchToDevServerForLegacy도 적용되어야 함', () => {
        const current_url = new URL('https://loginba1.ecount.com/login/login.aspx');
        const page_info = createPageInfo({ hasSetDevMode: false, zoneNum: 'BA1' });
        const result = buildDevUrl(current_url, page_info);
        expect(result.hostname).toContain('loginlxba1');
        expect(result.hostname).toContain('-dev');
    });
});
