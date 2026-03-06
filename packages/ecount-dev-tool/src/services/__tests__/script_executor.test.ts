import { describe, it, expect, beforeEach } from 'vitest';
import { executeUserScript } from '../script_executor';
import { asMock } from '#test/mock_helpers';

describe('script_executor', () => {
    beforeEach(() => {
        asMock(chrome.scripting.executeScript).mockResolvedValue([{ result: undefined }]);
    });

    it('성공 시 success: true와 result를 반환한다', async () => {
        asMock(chrome.scripting.executeScript).mockResolvedValue([{ result: 'hello' }]);
        const result = await executeUserScript(1, 'return "hello"');
        expect(result.success).toBe(true);
        expect(result.result).toBe('hello');
    });

    it('chrome.scripting.executeScript를 MAIN world로 호출한다', async () => {
        await executeUserScript(42, 'console.log("test")');
        expect(chrome.scripting.executeScript).toHaveBeenCalledWith(
            expect.objectContaining({
                target: { tabId: 42 },
                world: 'MAIN',
            }),
        );
    });

    it('실행 오류 시 success: false와 error를 반환한다', async () => {
        asMock(chrome.scripting.executeScript).mockRejectedValue(new Error('Script failed'));
        const result = await executeUserScript(1, 'invalid code');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Script failed');
    });

    it('스크립트 코드를 func 내부에서 new Function으로 실행한다', async () => {
        await executeUserScript(1, 'document.title = "test"');
        const calls = asMock(chrome.scripting.executeScript).mock.calls;
        expect(calls).toHaveLength(1);
        const call_args = calls[0]![0] as Record<string, unknown>;
        expect(call_args).toHaveProperty('func');
        expect(call_args).toHaveProperty('args');
    });
});
