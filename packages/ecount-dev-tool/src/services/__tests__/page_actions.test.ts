import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inputLogin, switchV3TestServer, switchV5TestServer, debugAndGetPageInfo } from '../page_actions';

describe('inputLogin', () => {
    let mock_com_code: HTMLInputElement;
    let mock_id: HTMLInputElement;
    let mock_passwd: HTMLInputElement;

    beforeEach(() => {
        mock_com_code = document.createElement('input');
        mock_com_code.id = 'com_code';
        mock_id = document.createElement('input');
        mock_id.id = 'id';
        mock_passwd = document.createElement('input');
        mock_passwd.id = 'passwd';

        document.body.innerHTML = '';
        document.body.appendChild(mock_com_code);
        document.body.appendChild(mock_id);
        document.body.appendChild(mock_passwd);
    });

    it('company§id 형식의 key를 파싱하여 각 input에 값을 설정해야 함', () => {
        inputLogin('COMP001§user1', 'password123');

        expect(mock_com_code.value).toBe('COMP001');
        expect(mock_id.value).toBe('user1');
        expect(mock_passwd.value).toBe('password123');
    });

    it('§가 없는 key일 때 company는 전체 key, id는 빈 문자열이 되어야 함', () => {
        inputLogin('user_only', 'pass');

        expect(mock_com_code.value).toBe('user_only');
        expect(mock_id.value).toBe('');
        expect(mock_passwd.value).toBe('pass');
    });

    it('여러 §가 있는 key일 때 첫 번째는 company, 두 번째는 id가 되어야 함', () => {
        inputLogin('COMP§user§extra', 'pass');

        expect(mock_com_code.value).toBe('COMP');
        expect(mock_id.value).toBe('user');
        expect(mock_passwd.value).toBe('pass');
    });
});

describe('switchV3TestServer', () => {
    it('top.location.href에 __v3domains=test를 설정해야 함', () => {
        const mock_top = {
            location: { href: 'https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M' },
        };
        vi.stubGlobal('top', mock_top);

        switchV3TestServer();

        const url = new URL(mock_top.location.href);
        expect(url.searchParams.get('__v3domains')).toBe('test');
    });
});

describe('switchV5TestServer', () => {
    it('top.location.href를 test.ecount.com:5001로 변경하고 ec5/view/erp 경로로 변환해야 함', () => {
        const mock_top = {
            location: {
                href: 'https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M',
            },
        };
        vi.stubGlobal('top', mock_top);

        switchV5TestServer();

        expect(mock_top.location.href).toContain('test.ecount.com:5001');
        expect(mock_top.location.href).toContain('ec5/view/erp');
        expect(mock_top.location.href).not.toContain('ECERP/ECP/ECP050M');
    });
});

describe('debugAndGetPageInfo', () => {
    it('$ECount.setDevMode가 있을 때 hasSetDevMode=true를 반환해야 함', () => {
        const mock_top = {
            $ECount: { setDevMode: vi.fn() },
            $ECountApp: {
                getContext: () => ({
                    config: { ec_zone_num: 'BA1' },
                }),
            },
        };
        vi.stubGlobal('top', mock_top);

        const info = debugAndGetPageInfo();

        expect(info.hasSetDevMode).toBe(true);
        expect(info.hasECountApp).toBe(true);
        expect(info.hasGetContext).toBe(true);
        expect(info.hasConfig).toBe(true);
        expect(info.zoneNum).toBe('BA1');
    });

    it('$ECount가 없을 때 hasSetDevMode=false를 반환해야 함', () => {
        const mock_top = {
            location: { href: 'https://zeus01ba1.ecount.com/' },
        };
        vi.stubGlobal('top', mock_top);

        const info = debugAndGetPageInfo();

        expect(info.hasSetDevMode).toBe(false);
        expect(info.hasECountApp).toBe(false);
    });

    it('$ECountApp이 없을 때 hasECountApp=false를 반환해야 함', () => {
        const mock_top = {
            $ECount: { setDevMode: vi.fn() },
        };
        vi.stubGlobal('top', mock_top);

        const info = debugAndGetPageInfo();

        expect(info.hasECountApp).toBe(false);
    });

    it('getContext가 함수가 아닐 때 hasGetContext=false를 반환해야 함', () => {
        const mock_top = {
            $ECount: { setDevMode: vi.fn() },
            $ECountApp: {},
        };
        vi.stubGlobal('top', mock_top);

        const info = debugAndGetPageInfo();

        expect(info.hasGetContext).toBe(false);
    });

    it('getContext가 null을 반환할 때 hasConfig=false를 반환해야 함', () => {
        const mock_top = {
            $ECount: { setDevMode: vi.fn() },
            $ECountApp: {
                getContext: () => null,
            },
        };
        vi.stubGlobal('top', mock_top);

        const info = debugAndGetPageInfo();

        expect(info.hasConfig).toBe(false);
        expect(info.zoneNum).toBe(null);
    });

    it('getContext가 config 없이 반환할 때 hasConfig=false를 반환해야 함', () => {
        const mock_top = {
            $ECount: { setDevMode: vi.fn() },
            $ECountApp: {
                getContext: () => ({}),
            },
        };
        vi.stubGlobal('top', mock_top);

        const info = debugAndGetPageInfo();

        expect(info.hasConfig).toBe(false);
    });

    it('getContext에서 예외 발생 시 error에 메시지를 저장해야 함', () => {
        const mock_top = {
            $ECount: { setDevMode: vi.fn() },
            $ECountApp: {
                getContext: () => {
                    throw new Error('Context error');
                },
            },
        };
        vi.stubGlobal('top', mock_top);

        const info = debugAndGetPageInfo();

        expect(info.error).toContain('Error');
        expect(info.error).toContain('Context error');
    });

    it('top이 undefined일 때 안전하게 처리해야 함', () => {
        vi.stubGlobal('top', undefined);

        const info = debugAndGetPageInfo();

        expect(info.hasSetDevMode).toBe(false);
        expect(info.hasECountApp).toBe(false);
    });
});
