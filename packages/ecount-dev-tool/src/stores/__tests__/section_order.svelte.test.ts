import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    DEFAULT_ORDER,
    getSectionOrder,
    initializeSectionOrder,
    moveSectionUp,
    moveSectionDown,
} from '../section_order.svelte';
import { asMock } from '#test/mock_helpers';

describe('section_order 스토어', () => {
    it('초기화 전에는 이동이 불가능해야 함', async () => {
        const up_result = await moveSectionUp('server-manager');
        const down_result = await moveSectionDown('server-manager');

        expect(up_result).toBe(false);
        expect(down_result).toBe(false);
    });

    describe('초기화', () => {
        beforeEach(async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                section_order_state: undefined,
            });
            asMock(chrome.storage.sync.set).mockResolvedValue(undefined);
            await initializeSectionOrder();
        });

        it('저장된 데이터가 없으면 기본 순서를 사용해야 함', async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                section_order_state: undefined,
            });

            await initializeSectionOrder();

            expect(getSectionOrder()).toEqual([...DEFAULT_ORDER]);
        });

        it('유효한 저장 데이터가 있으면 해당 순서를 사용해야 함', async () => {
            const stored = ['action-bar', 'quick-login', 'server-manager'];
            asMock(chrome.storage.sync.get).mockResolvedValue({
                section_order_state: stored,
            });

            await initializeSectionOrder();

            expect(getSectionOrder()).toEqual(stored);
        });

        it('잘못된 데이터가 저장되어 있으면 기본 순서를 사용해야 함', async () => {
            asMock(chrome.storage.sync.get).mockResolvedValue({
                section_order_state: 'invalid',
            });

            await initializeSectionOrder();

            expect(getSectionOrder()).toEqual([...DEFAULT_ORDER]);
        });

        it('storage 오류 시 기본 순서를 사용해야 함', async () => {
            asMock(chrome.storage.sync.get).mockRejectedValue(
                new Error('Storage error'),
            );

            await initializeSectionOrder();

            expect(getSectionOrder()).toEqual([...DEFAULT_ORDER]);
        });

        it('저장된 순서에 누락된 ID가 있으면 끝에 추가해야 함', async () => {
            const stored = ['server-manager', 'action-bar'];
            asMock(chrome.storage.sync.get).mockResolvedValue({
                section_order_state: stored,
            });

            await initializeSectionOrder();

            expect(getSectionOrder()).toEqual([
                'server-manager',
                'action-bar',
                'quick-login',
            ]);
        });

        it('알 수 없는 ID는 필터링해야 함', async () => {
            const stored = ['quick-login', 'unknown', 'server-manager', 'action-bar'];
            asMock(chrome.storage.sync.get).mockResolvedValue({
                section_order_state: stored,
            });

            await initializeSectionOrder();

            expect(getSectionOrder()).toEqual([
                'quick-login',
                'server-manager',
                'action-bar',
            ]);
        });
    });

    describe('순서 변경', () => {
        beforeEach(async () => {
            vi.clearAllMocks();
            asMock(chrome.storage.sync.get).mockResolvedValue({
                section_order_state: undefined,
            });
            asMock(chrome.storage.sync.set).mockResolvedValue(undefined);
            await initializeSectionOrder();
        });

        it('섹션을 위로 이동할 수 있어야 함', async () => {
            const result = await moveSectionUp('server-manager');

            expect(result).toBe(true);
            expect(getSectionOrder()).toEqual([
                'server-manager',
                'quick-login',
                'action-bar',
            ]);
        });

        it('첫 번째 섹션은 위로 이동할 수 없어야 함', async () => {
            const result = await moveSectionUp('quick-login');

            expect(result).toBe(false);
            expect(getSectionOrder()).toEqual([...DEFAULT_ORDER]);
        });

        it('섹션을 아래로 이동할 수 있어야 함', async () => {
            const result = await moveSectionDown('quick-login');

            expect(result).toBe(true);
            expect(getSectionOrder()).toEqual([
                'server-manager',
                'quick-login',
                'action-bar',
            ]);
        });

        it('마지막 섹션은 아래로 이동할 수 없어야 함', async () => {
            const result = await moveSectionDown('action-bar');

            expect(result).toBe(false);
            expect(getSectionOrder()).toEqual([...DEFAULT_ORDER]);
        });

        it('변경된 순서가 storage에 저장되어야 함', async () => {
            await moveSectionUp('server-manager');

            expect(chrome.storage.sync.set).toHaveBeenCalledWith({
                section_order_state: [
                    'server-manager',
                    'quick-login',
                    'action-bar',
                ],
            });
        });

        it('storage 저장 실패 시 이전 순서로 롤백해야 함', async () => {
            asMock(chrome.storage.sync.set).mockRejectedValueOnce(
                new Error('Storage error'),
            );

            const result = await moveSectionUp('server-manager');

            expect(result).toBe(false);
            expect(getSectionOrder()).toEqual([...DEFAULT_ORDER]);
        });
    });
});
