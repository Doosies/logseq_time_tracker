import { describe, it, expect } from 'vitest';
import { buildDevUrl } from '@/services/url_service';
import type { PageInfo } from '@/types/server';

/**
 * 통합 테스트: devMode 활성화 플로우
 * - buildDevUrl 호출 시 hasSetDevMode/zoneNum에 따른 분기 검증
 * - chrome API mock 없음, url_service 실제 코드 사용
 */
describe('devMode 활성화 플로우 (통합)', () => {
    it('새 시스템(hasSetDevMode=true)에서 __disableMin=Y 파라미터와 login 도메인 변환이 적용되어야 함', () => {
        const login_url = new URL('https://loginba1.ecount.com/login/login.aspx');
        const page_info: PageInfo = {
            hasSetDevMode: true,
            hasECountApp: false,
            hasGetContext: false,
            hasConfig: false,
            zoneNum: 'BA1',
            error: null,
        };

        const result = buildDevUrl(login_url, page_info);

        expect(result.searchParams.get('__disableMin')).toBe('Y');
        expect(result.hostname).toContain('loginlxba1');
    });

    it('레거시 시스템(hasSetDevMode=false)에서 -dev 접미사와 __v3domains -dev가 적용되어야 함', () => {
        const zeus_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp?__v3domains=zeus01ba1');
        const page_info: PageInfo = {
            hasSetDevMode: false,
            hasECountApp: false,
            hasGetContext: false,
            hasConfig: false,
            zoneNum: 'BA1',
            error: null,
        };

        const result = buildDevUrl(zeus_url, page_info);

        expect(result.hostname).toContain('-dev');
        expect(result.searchParams.get('__v3domains')).toContain('-dev');
    });

    it('zoneNum이 null인 레거시에서 크래시 없이 -dev 도메인만 변경되어야 함', () => {
        const zeus_url = new URL('https://zeus01lxba1.ecount.com/ec5/view/erp');
        const page_info: PageInfo = {
            hasSetDevMode: false,
            hasECountApp: false,
            hasGetContext: false,
            hasConfig: false,
            zoneNum: null,
            error: null,
        };

        const result = buildDevUrl(zeus_url, page_info);

        expect(result.hostname).toContain('-dev');
        expect(result.hostname).toContain('zeus01lxba1-dev');
    });
});
