import type { Mock } from 'vitest';

/**
 * chrome API mock의 타입 캐스팅 헬퍼.
 * @types/chrome의 콜백 오버로드로 인해 vi.mocked()가
 * 잘못된 오버로드를 선택하는 문제를 우회합니다.
 */
export function asMock(fn: unknown): Mock {
    return fn as Mock;
}
