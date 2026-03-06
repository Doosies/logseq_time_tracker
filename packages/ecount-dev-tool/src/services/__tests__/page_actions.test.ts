import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { inputLogin, switchV3TestServer, switchV5TestServer, debugAndGetPageInfo } from '../page_actions';

describe('inputLogin', () => {
    let mock_com_code: HTMLInputElement;
    let mock_id: HTMLInputElement;
    let mock_passwd: HTMLInputElement;

    beforeEach(() => {
        document.body.innerHTML = '';
        mock_com_code = document.createElement('input');
        mock_com_code.id = 'com_code';
        mock_id = document.createElement('input');
        mock_id.id = 'id';
        mock_passwd = document.createElement('input');
        mock_passwd.id = 'passwd';
        document.body.appendChild(mock_com_code);
        document.body.appendChild(mock_id);
        document.body.appendChild(mock_passwd);
    });

    it("'회사코드§아이디' 형식의 key를 파싱하여 com_code, id, passwd에 각각 설정해야 함", () => {
        inputLogin('회사코드§아이디', '비밀번호');

        expect(mock_com_code.value).toBe('회사코드');
        expect(mock_id.value).toBe('아이디');
        expect(mock_passwd.value).toBe('비밀번호');
    });

    it("'COMP001§user1' + 'password123' 형식으로 정상 파싱되어야 함", () => {
        inputLogin('COMP001§user1', 'password123');

        expect(mock_com_code.value).toBe('COMP001');
        expect(mock_id.value).toBe('user1');
        expect(mock_passwd.value).toBe('password123');
    });

    it("§가 없는 key 'user_only'일 때 com_code는 전체 key, id는 빈 문자열이어야 함", () => {
        inputLogin('user_only', 'pass');

        expect(mock_com_code.value).toBe('user_only');
        expect(mock_id.value).toBe('');
        expect(mock_passwd.value).toBe('pass');
    });

    it("여러 §가 있는 key 'COMP§user§extra'일 때 첫 번째는 com_code, 두 번째는 id여야 함", () => {
        inputLogin('COMP§user§extra', 'pass');

        expect(mock_com_code.value).toBe('COMP');
        expect(mock_id.value).toBe('user');
        expect(mock_passwd.value).toBe('pass');
    });

    it("빈 문자열 key '§'일 때 com_code와 id가 빈 문자열이어야 함", () => {
        inputLogin('§', 'pass');

        expect(mock_com_code.value).toBe('');
        expect(mock_id.value).toBe('');
        expect(mock_passwd.value).toBe('pass');
    });

    it('빈 password일 때 passwd가 빈 문자열이어야 함', () => {
        inputLogin('COMP001§user1', '');

        expect(mock_com_code.value).toBe('COMP001');
        expect(mock_id.value).toBe('user1');
        expect(mock_passwd.value).toBe('');
    });

    it("한글 포함 '313786§뚜뚜' + '1q2w3e4r' 형식으로 정상 동작해야 함", () => {
        inputLogin('313786§뚜뚜', '1q2w3e4r');

        expect(mock_com_code.value).toBe('313786');
        expect(mock_id.value).toBe('뚜뚜');
        expect(mock_passwd.value).toBe('1q2w3e4r');
    });

    it('특수문자 포함 key/value가 정상 처리되어야 함', () => {
        inputLogin('COMP@001§user#id', 'p@ss!word<>');

        expect(mock_com_code.value).toBe('COMP@001');
        expect(mock_id.value).toBe('user#id');
        expect(mock_passwd.value).toBe('p@ss!word<>');
    });
});

describe('switchV3TestServer', () => {
    const original_top = globalThis.top;

    afterEach(() => {
        vi.stubGlobal('top', original_top);
    });

    it('zeus URL에서 __v3domains=test를 설정하고 top.location.href를 변경해야 함', () => {
        const mock_top = {
            location: { href: 'https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M' },
        };
        vi.stubGlobal('top', mock_top);

        switchV3TestServer();

        const url = new URL(mock_top.location.href);
        expect(url.searchParams.get('__v3domains')).toBe('test');
        expect(mock_top.location.href).toContain('__v3domains=test');
    });

    it('이미 __v3domains가 있을 때 값이 test로 교체되어야 함', () => {
        const mock_top = {
            location: {
                href: 'https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M?__v3domains=zeus01ba1',
            },
        };
        vi.stubGlobal('top', mock_top);

        switchV3TestServer();

        const url = new URL(mock_top.location.href);
        expect(url.searchParams.get('__v3domains')).toBe('test');
    });

    it('test 환경 URL에서 __v3domains=test가 설정되어야 함', () => {
        const mock_top = {
            location: { href: 'https://test.ecount.com:5001/ec5/view/erp' },
        };
        vi.stubGlobal('top', mock_top);

        switchV3TestServer();

        const url = new URL(mock_top.location.href);
        expect(url.searchParams.get('__v3domains')).toBe('test');
    });

    it('다른 쿼리파라미터가 있을 때 기존 파라미터를 보존하고 __v3domains=test를 추가해야 함', () => {
        const mock_top = {
            location: {
                href: 'https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M?foo=bar&baz=qux',
            },
        };
        vi.stubGlobal('top', mock_top);

        switchV3TestServer();

        const url = new URL(mock_top.location.href);
        expect(url.searchParams.get('__v3domains')).toBe('test');
        expect(url.searchParams.get('foo')).toBe('bar');
        expect(url.searchParams.get('baz')).toBe('qux');
    });

    it('stage 환경 URL에서 __v3domains=test가 설정되어야 함', () => {
        const mock_top = {
            location: { href: 'https://stageba.ecount.com/ECERP/ECP/ECP050M' },
        };
        vi.stubGlobal('top', mock_top);

        switchV3TestServer();

        const url = new URL(mock_top.location.href);
        expect(url.searchParams.get('__v3domains')).toBe('test');
    });
});

describe('switchV5TestServer', () => {
    const original_top = globalThis.top;

    afterEach(() => {
        vi.stubGlobal('top', original_top);
    });

    it('ECP050M URL에서 host를 test.ecount.com:5001로, 경로를 ec5/view/erp로 변경해야 함', () => {
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

    it('이미 ec5 경로일 때 host만 변경하고 경로는 유지되어야 함', () => {
        const mock_top = {
            location: {
                href: 'https://zeus01ba1.ecount.com/ec5/view/erp',
            },
        };
        vi.stubGlobal('top', mock_top);

        switchV5TestServer();

        expect(mock_top.location.href).toContain('test.ecount.com:5001');
        expect(mock_top.location.href).toContain('ec5/view/erp');
    });

    it('쿼리파라미터가 보존되어야 함', () => {
        const mock_top = {
            location: {
                href: 'https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M?foo=bar',
            },
        };
        vi.stubGlobal('top', mock_top);

        switchV5TestServer();

        expect(mock_top.location.href).toContain('foo=bar');
        expect(mock_top.location.href).toContain('test.ecount.com:5001');
    });

    it('zeus 환경 ECP050M URL에서 host와 경로가 모두 변경되어야 함', () => {
        const mock_top = {
            location: {
                href: 'https://zeus02ba2.ecount.com/ECERP/ECP/ECP050M',
            },
        };
        vi.stubGlobal('top', mock_top);

        switchV5TestServer();

        expect(mock_top.location.href).toContain('test.ecount.com:5001');
        expect(mock_top.location.href).toContain('ec5/view/erp');
    });

    it('https 프로토콜이 유지되어야 함', () => {
        const mock_top = {
            location: {
                href: 'https://zeus01ba1.ecount.com/ECERP/ECP/ECP050M',
            },
        };
        vi.stubGlobal('top', mock_top);

        switchV5TestServer();

        expect(mock_top.location.href).toMatch(/^https:\/\//);
    });
});

describe('debugAndGetPageInfo', () => {
    const original_top = globalThis.top;

    afterEach(() => {
        vi.stubGlobal('top', original_top);
    });

    it('$ECount.setDevMode + $ECountApp.getContext + config가 모두 있으면 모든 필드가 true이고 zoneNum이 반환되어야 함', () => {
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
        expect(info.error).toBe(null);
    });

    it('$ECount가 없으면 hasSetDevMode=false, hasECountApp=false를 반환해야 함', () => {
        const mock_top = {
            location: { href: 'https://zeus01ba1.ecount.com/' },
        };
        vi.stubGlobal('top', mock_top);

        const info = debugAndGetPageInfo();

        expect(info.hasSetDevMode).toBe(false);
        expect(info.hasECountApp).toBe(false);
    });

    it('$ECountApp이 없으면 hasECountApp=false를 반환해야 함', () => {
        const mock_top = {
            $ECount: { setDevMode: vi.fn() },
        };
        vi.stubGlobal('top', mock_top);

        const info = debugAndGetPageInfo();

        expect(info.hasECountApp).toBe(false);
    });

    it('$ECountApp은 있지만 getContext가 함수가 아니면 hasGetContext=false를 반환해야 함', () => {
        const mock_top = {
            $ECount: { setDevMode: vi.fn() },
            $ECountApp: {},
        };
        vi.stubGlobal('top', mock_top);

        const info = debugAndGetPageInfo();

        expect(info.hasGetContext).toBe(false);
    });

    it('getContext가 null을 반환하면 hasConfig=false, zoneNum=null을 반환해야 함', () => {
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

    it('getContext가 config 없이 {}를 반환하면 hasConfig=false를 반환해야 함', () => {
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

    it('getContext가 { config: {} }를 반환하고 ec_zone_num이 없으면 zoneNum이 undefined여야 함', () => {
        const mock_top = {
            $ECount: { setDevMode: vi.fn() },
            $ECountApp: {
                getContext: () => ({ config: {} }),
            },
        };
        vi.stubGlobal('top', mock_top);

        const info = debugAndGetPageInfo();

        expect(info.hasConfig).toBe(true);
        expect(info.zoneNum).toBeUndefined();
    });

    it('getContext에서 예외 발생 시 error에 메시지가 저장되어야 함', () => {
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

    it('top이 null일 때 안전하게 처리해야 함', () => {
        vi.stubGlobal('top', null);

        const info = debugAndGetPageInfo();

        expect(info.hasSetDevMode).toBe(false);
        expect(info.hasECountApp).toBe(false);
    });

    it('$ECount는 있지만 setDevMode가 함수가 아니면 hasSetDevMode=false를 반환해야 함', () => {
        const mock_top = {
            $ECount: { setDevMode: 'not-a-function' },
            $ECountApp: {
                getContext: () => ({ config: { ec_zone_num: 'BA1' } }),
            },
        };
        vi.stubGlobal('top', mock_top);

        const info = debugAndGetPageInfo();

        expect(info.hasSetDevMode).toBe(false);
    });

    it('zoneNum이 BA1, BA2, BA3 등 다양한 값일 때 정확히 반환되어야 함', () => {
        const zone_values = ['BA1', 'BA2', 'BA3'];

        for (const zone_val of zone_values) {
            const mock_top = {
                $ECount: { setDevMode: vi.fn() },
                $ECountApp: {
                    getContext: () => ({
                        config: { ec_zone_num: zone_val },
                    }),
                },
            };
            vi.stubGlobal('top', mock_top);

            const info = debugAndGetPageInfo();

            expect(info.zoneNum).toBe(zone_val);
        }
    });
});
