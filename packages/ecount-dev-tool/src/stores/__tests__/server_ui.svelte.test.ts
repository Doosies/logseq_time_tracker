import { describe, it, expect, beforeEach } from 'vitest';
import type { ParsedUrl } from '#types/server';
import { server_ui, initializeServerUi, resetServerUi } from '../server_ui.svelte';

function createParsedUrl(overrides: Partial<ParsedUrl> = {}): ParsedUrl {
    return {
        environment: 'zeus',
        page_type: 'ec5',
        current_server: 'zeus01',
        v5_domain: 'lxba1',
        v3_domain: 'ba1',
        zeus_number: '01',
        url: new URL('https://zeus01lxba1.ecount.com/ec5/view/erp'),
        ...overrides,
    };
}

describe('server_ui 스토어', () => {
    beforeEach(() => {
        resetServerUi();
    });

    describe('initializeServerUi', () => {
        it('zeus 환경 (v5=lxba1, v3=ba1) → v5_value="lxba1", v3_value="ba1", 둘 다 text_mode=false', () => {
            const parsed = createParsedUrl({ v5_domain: 'lxba1', v3_domain: 'ba1' });

            initializeServerUi(parsed);

            expect(server_ui.v5_value).toBe('lxba1');
            expect(server_ui.v3_value).toBe('ba1');
            expect(server_ui.v5_text_mode).toBe(false);
            expect(server_ui.v3_text_mode).toBe(false);
        });

        it('test 환경 (v5=test, v3=ba1) → v5_text_mode=true, v5_value="test", v3_text_mode=false, v3_value="ba1"', () => {
            const parsed = createParsedUrl({ v5_domain: 'test', v3_domain: 'ba1' });

            initializeServerUi(parsed);

            expect(server_ui.v5_text_mode).toBe(true);
            expect(server_ui.v5_value).toBe('test');
            expect(server_ui.v3_text_mode).toBe(false);
            expect(server_ui.v3_value).toBe('ba1');
        });

        it('test 환경 (v5=test, v3=test) → 둘 다 text_mode=true, 값 "test"', () => {
            const parsed = createParsedUrl({ v5_domain: 'test', v3_domain: 'test' });

            initializeServerUi(parsed);

            expect(server_ui.v5_text_mode).toBe(true);
            expect(server_ui.v3_text_mode).toBe(true);
            expect(server_ui.v5_value).toBe('test');
            expect(server_ui.v3_value).toBe('test');
        });

        it('zeus 환경 다른 서버 (v5=lxba3, v3=ba2) → v5_value="lxba3", v3_value="ba2"', () => {
            const parsed = createParsedUrl({ v5_domain: 'lxba3', v3_domain: 'ba2' });

            initializeServerUi(parsed);

            expect(server_ui.v5_value).toBe('lxba3');
            expect(server_ui.v3_value).toBe('ba2');
        });

        it('중복 초기화 방지: 첫 번째 호출 후 두 번째 호출은 무시됨', () => {
            const parsed_first = createParsedUrl({ v5_domain: 'lxba1', v3_domain: 'ba1' });
            const parsed_second = createParsedUrl({ v5_domain: 'lxba3', v3_domain: 'ba2' });

            initializeServerUi(parsed_first);
            initializeServerUi(parsed_second);

            expect(server_ui.v5_value).toBe('lxba1');
            expect(server_ui.v3_value).toBe('ba1');
        });

        it('중복 초기화 후 server_ui 직접 수정 → 값 유지 (두 번째 initializeServerUi가 덮어쓰지 않음)', () => {
            const parsed_first = createParsedUrl({ v5_domain: 'lxba1', v3_domain: 'ba1' });
            const parsed_second = createParsedUrl({ v5_domain: 'lxba3', v3_domain: 'ba2' });

            initializeServerUi(parsed_first);
            server_ui.v5_value = 'custom_v5';
            server_ui.v3_value = 'custom_v3';
            initializeServerUi(parsed_second);

            expect(server_ui.v5_value).toBe('custom_v5');
            expect(server_ui.v3_value).toBe('custom_v3');
        });

        it('unknown 환경 (v5="=====", v3="=====") → v5_value="=====", v3_value="====="', () => {
            const parsed = createParsedUrl({
                environment: 'unknown',
                v5_domain: '=====',
                v3_domain: '=====',
            });

            initializeServerUi(parsed);

            expect(server_ui.v5_value).toBe('=====');
            expect(server_ui.v3_value).toBe('=====');
        });

        it('v5=lxba1, v3=test → v5는 select 모드, v3만 text 모드', () => {
            const parsed = createParsedUrl({ v5_domain: 'lxba1', v3_domain: 'test' });

            initializeServerUi(parsed);

            expect(server_ui.v5_text_mode).toBe(false);
            expect(server_ui.v5_value).toBe('lxba1');
            expect(server_ui.v3_text_mode).toBe(true);
            expect(server_ui.v3_value).toBe('test');
        });
    });

    describe('resetServerUi', () => {
        it('초기화 후 리셋 → 모든 값 빈 문자열, text_mode=false', () => {
            const parsed = createParsedUrl({ v5_domain: 'lxba1', v3_domain: 'ba1' });
            initializeServerUi(parsed);

            resetServerUi();

            expect(server_ui.v5_value).toBe('');
            expect(server_ui.v3_value).toBe('');
            expect(server_ui.v5_text_mode).toBe(false);
            expect(server_ui.v3_text_mode).toBe(false);
        });

        it('리셋 후 재초기화 가능 확인 (_is_initialized 플래그도 리셋됨)', () => {
            const parsed_first = createParsedUrl({ v5_domain: 'lxba1', v3_domain: 'ba1' });
            const parsed_second = createParsedUrl({ v5_domain: 'lxba3', v3_domain: 'ba2' });

            initializeServerUi(parsed_first);
            resetServerUi();
            initializeServerUi(parsed_second);

            expect(server_ui.v5_value).toBe('lxba3');
            expect(server_ui.v3_value).toBe('ba2');
        });

        it('리셋 후 server_ui 값 확인 (v5_value="", v3_value="", text_mode들 false)', () => {
            const parsed = createParsedUrl({ v5_domain: 'test', v3_domain: 'test' });
            initializeServerUi(parsed);

            resetServerUi();

            expect(server_ui.v5_value).toBe('');
            expect(server_ui.v3_value).toBe('');
            expect(server_ui.v5_text_mode).toBe(false);
            expect(server_ui.v3_text_mode).toBe(false);
        });
    });

    describe('server_ui 객체 getter/setter', () => {
        it('v5_value 직접 set → get으로 확인', () => {
            server_ui.v5_value = 'lxba5';

            expect(server_ui.v5_value).toBe('lxba5');
        });

        it('v5_text_mode 직접 set → get으로 확인', () => {
            server_ui.v5_text_mode = true;

            expect(server_ui.v5_text_mode).toBe(true);
        });
    });
});
