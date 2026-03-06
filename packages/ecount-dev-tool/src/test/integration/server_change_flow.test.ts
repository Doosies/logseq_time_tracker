import { describe, it, expect } from 'vitest';
import { parseEcountUrl, buildEc5Url, buildEc3Url, buildStageUrl, getStageButtonLabel } from '#services/url_service';

/**
 * 통합 테스트: 서버 변경 플로우
 * - parseEcountUrl → buildEc5Url/buildEc3Url/buildStageUrl → 결과 URL 검증
 * - chrome API mock 없음, url_service 실제 코드 사용
 */
describe('서버 변경 플로우 (통합)', () => {
    it('zeus EC5 환경에서 서버 변경 시 올바른 도메인과 __v3domains 파라미터를 반환해야 함', () => {
        const zeus_ec5_url = 'https://zeus01lxba1.ecount.com/ec5/view/erp?__v3domains=zeus01ba1';
        const parsed = parseEcountUrl(zeus_ec5_url);
        expect(parsed).not.toBeNull();
        expect(parsed!.environment).toBe('zeus');
        expect(parsed!.page_type).toBe('ec5');

        const new_url = buildEc5Url(parsed!.url, 'zeus01lxba2', 'zeus01ba2');

        expect(new_url).toContain('zeus01lxba2.ecount.com');
        expect(new_url).toContain('__v3domains=zeus01ba2');
    });

    it('zeus EC3(ECP050M) 환경에서 서버 변경 시 __v5domains 파라미터를 반환해야 함', () => {
        const zeus_ec3_url = 'https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M?__v5domains=zeus01lxba1';
        const parsed = parseEcountUrl(zeus_ec3_url);
        expect(parsed).not.toBeNull();
        expect(parsed!.environment).toBe('zeus');
        expect(parsed!.page_type).toBe('ec3');

        const new_url = buildEc3Url(parsed!.url, 'zeus01ba2', 'zeus01lxba2');

        expect(new_url).toContain('zeus01ba2.ecount.com');
        expect(new_url).toContain('__v5domains=zeus01lxba2');
    });

    it('test 환경에서 서버 변경 시 buildEc5Url로 올바른 URL을 생성해야 함', () => {
        const test_url = 'https://onetestba1.ecount.com/ec5/view/erp';
        const parsed = parseEcountUrl(test_url);
        expect(parsed).not.toBeNull();
        expect(parsed!.environment).toBe('test');
        expect(parsed!.page_type).toBe('ec5');

        const new_url = buildEc5Url(parsed!.url, 'zeus01lxba1', 'zeus01ba1');

        expect(new_url).toContain('zeus01lxba1.ecount.com');
        expect(new_url).toContain('__v3domains=zeus01ba1');
    });

    it('stage 환경 전환 시 buildStageUrl와 getStageButtonLabel이 올바르게 동작해야 함', () => {
        const stage_url = 'https://stageba.ecount.com/ec5/view/erp';
        const parsed = parseEcountUrl(stage_url);
        expect(parsed).not.toBeNull();
        expect(parsed!.environment).toBe('stage');

        const new_url = buildStageUrl(parsed!.url);
        expect(new_url).not.toBeNull();
        expect(new_url).toContain('stagelxba2.ecount.com');
        expect(new_url).toContain('__v3domains=stageba2');

        const label = getStageButtonLabel(parsed!.url);
        expect(label).toBe('stageba2로 전환');
    });

    it('test 환경 select 모드: parseEcountUrl → current_server=test, v5_domain=test, v3_domain=ba1 → buildEc5Url로 select 조합 결과 검증', () => {
        const test_url = 'https://onetestba1.ecount.com/ec5/view/erp';
        const parsed = parseEcountUrl(test_url);
        expect(parsed).not.toBeNull();
        expect(parsed!.current_server).toBe('test');
        expect(parsed!.v5_domain).toBe('test');
        expect(parsed!.v3_domain).toBe('ba1');

        const to_v5 = 'test' + 'lxba1';
        const to_v3 = 'test' + 'ba2';
        const new_url = buildEc5Url(parsed!.url, to_v5, to_v3);

        expect(new_url).toContain('testlxba1.ecount.com');
        expect(new_url).toContain('__v3domains=testba2');
    });

    it('test 환경 text 모드: to_v5=custom, to_v3=test → buildEc5Url 결과 검증', () => {
        const test_url = 'https://onetestba1.ecount.com/ec5/view/erp';
        const parsed = parseEcountUrl(test_url);
        expect(parsed).not.toBeNull();

        const new_url = buildEc5Url(parsed!.url, 'custom', 'test');

        expect(new_url).toContain('custom.ecount.com');
        expect(new_url).toContain('__v3domains=test');
    });

    it('zeus -dev URL에서 parseEcountUrl → v5_domain에 -dev 제거됨 → buildEc5Url로 서버 변경 시 정상 URL 생성', () => {
        const zeus_dev_url = 'https://zeus01lxba1-dev.ecount.com/ec5/view/erp?__v3domains=zeus01ba1';
        const parsed = parseEcountUrl(zeus_dev_url);
        expect(parsed).not.toBeNull();
        expect(parsed!.v5_domain).toBe('lxba1');

        const new_url = buildEc5Url(parsed!.url, 'zeus01lxba2', 'zeus01ba2');

        expect(new_url).toContain('zeus01lxba2.ecount.com');
        expect(new_url).not.toContain('-dev');
        expect(new_url).toContain('__v3domains=zeus01ba2');
    });

    it('zeus EC3 환경: buildEc3Url에서 hostname=v3, __v5domains=v5 순서 검증', () => {
        const zeus_ec3_url = 'https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M?__v5domains=zeus01lxba1';
        const parsed = parseEcountUrl(zeus_ec3_url);
        expect(parsed).not.toBeNull();
        expect(parsed!.page_type).toBe('ec3');

        const new_url = buildEc3Url(parsed!.url, 'zeus01ba2', 'zeus01lxba2');

        expect(new_url).toContain('zeus01ba2.ecount.com');
        expect(new_url).toContain('__v5domains=zeus01lxba2');
    });

    it('zeus EC3 -dev URL에서 서버 변경 시 정상 URL 생성', () => {
        const zeus_ec3_dev_url = 'https://zeus01ba1-dev.ecount.com/ECERP/ECP/ECP050M?__v5domains=zeus01lxba1';
        const parsed = parseEcountUrl(zeus_ec3_dev_url);
        expect(parsed).not.toBeNull();
        expect(parsed!.page_type).toBe('ec3');

        const new_url = buildEc3Url(parsed!.url, 'zeus01ba2', 'zeus01lxba2');

        expect(new_url).toContain('zeus01ba2.ecount.com');
        expect(new_url).toContain('__v5domains=zeus01lxba2');
    });

    it('stageba + hash → stagelxba2 전환 시 hash 보존 및 __v3domains=stageba2 추가', () => {
        const stage_url_with_hash = 'https://stageba.ecount.com/ec5/view/erp?x=1#section1';
        const parsed = parseEcountUrl(stage_url_with_hash);
        expect(parsed).not.toBeNull();

        const new_url = buildStageUrl(parsed!.url);
        expect(new_url).not.toBeNull();
        expect(new_url).toContain('stagelxba2.ecount.com');
        expect(new_url).toContain('__v3domains=stageba2');
        expect(new_url).toContain('#section1');
    });
});
