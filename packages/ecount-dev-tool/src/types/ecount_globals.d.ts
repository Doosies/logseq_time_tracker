/**
 * ECount 페이지 전역 객체 타입 선언
 * MAIN world의 top window에 주입되는 ECount 런타임 전역 변수입니다.
 */

interface ECountAppContext {
    config: {
        ec_zone_num: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

interface ECount {
    setDevMode: (...args: unknown[]) => unknown;
    [key: string]: unknown;
}

interface ECountApp {
    getContext: () => ECountAppContext;
    [key: string]: unknown;
}

declare global {
    interface Window {
        $ECount?: ECount;
        $ECountApp?: ECountApp;
    }
}

export {};
