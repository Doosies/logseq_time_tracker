import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentTab, updateTabUrl, executeScript, executeMainWorldScript } from '../tab_service';
import { asMock } from '#test/mock_helpers';

describe('getCurrentTab', () => {
    it('여러 탭이 반환되어도 첫 번째만 사용해야 함', async () => {
        const mock_tab1 = { id: 1, url: 'https://example.com' };
        const mock_tab2 = { id: 2, url: 'https://other.com' };
        asMock(chrome.tabs.query).mockResolvedValue([mock_tab1, mock_tab2]);

        const tab = await getCurrentTab();

        expect(tab).toEqual(mock_tab1);
    });

    it('현재 활성 탭을 반환해야 함', async () => {
        const mock_tab = {
            id: 1,
            url: 'https://zeus01ba1.ecount.com/ECERP/ECP050M',
        };
        asMock(chrome.tabs.query).mockResolvedValue([mock_tab]);

        const tab = await getCurrentTab();

        expect(chrome.tabs.query).toHaveBeenCalledWith({
            active: true,
            currentWindow: true,
        });
        expect(tab).toEqual(mock_tab);
    });

    it('탭이 없을 때 null을 반환해야 함', async () => {
        asMock(chrome.tabs.query).mockResolvedValue([]);

        const tab = await getCurrentTab();

        expect(tab).toBeNull();
    });

    it('query가 undefined를 반환할 때 null을 반환해야 함', async () => {
        asMock(chrome.tabs.query).mockResolvedValue([undefined as unknown as chrome.tabs.Tab]);

        const tab = await getCurrentTab();

        expect(tab).toBeNull();
    });
});

describe('updateTabUrl', () => {
    beforeEach(() => {
        vi.stubGlobal('close', vi.fn());
    });

    it('탭 URL을 업데이트하고 window.close를 호출해야 함', async () => {
        asMock(chrome.tabs.update).mockResolvedValue({});

        await updateTabUrl(1, 'https://new-url.ecount.com/');

        expect(chrome.tabs.update).toHaveBeenCalledWith(1, {
            url: 'https://new-url.ecount.com/',
        });
        expect(window.close).toHaveBeenCalled();
    });

    it('chrome.tabs.update가 실패하면 window.close 전에 에러를 전파해야 함', async () => {
        asMock(chrome.tabs.update).mockRejectedValue(new Error('Permission denied'));

        await expect(updateTabUrl(1, 'https://new-url.com/')).rejects.toThrow('Permission denied');
        expect(window.close).not.toHaveBeenCalled();
    });

    it('정상 동작 시 chrome.tabs.update가 올바른 인자로 호출되고 window.close 호출됨 (다른 tab_id)', async () => {
        asMock(chrome.tabs.update).mockResolvedValue({});

        await updateTabUrl(999, 'https://zeus01lxba2.ecount.com/ec5/view/erp');

        expect(chrome.tabs.update).toHaveBeenCalledWith(999, {
            url: 'https://zeus01lxba2.ecount.com/ec5/view/erp',
        });
        expect(window.close).toHaveBeenCalled();
    });
});

describe('executeScript', () => {
    it('현재 탭에서 스크립트를 실행해야 함', async () => {
        const mock_func = vi.fn();
        asMock(chrome.scripting.executeScript).mockResolvedValue([{ result: 'success' }]);

        const result = await executeScript(1, mock_func);

        expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
            target: { tabId: 1 },
            func: mock_func,
            args: [],
        });
        expect(result).toBe('success');
    });

    it('args를 전달할 때 executeScript에 args를 포함해야 함', async () => {
        const mock_func = vi.fn();
        const args = ['arg1', 2];
        asMock(chrome.scripting.executeScript).mockResolvedValue([{ result: undefined }]);

        await executeScript(1, mock_func, args);

        expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
            target: { tabId: 1 },
            func: mock_func,
            args,
        });
    });

    it('결과가 없을 때 null을 반환해야 함', async () => {
        asMock(chrome.scripting.executeScript).mockResolvedValue([]);

        const result = await executeScript(1, vi.fn());

        expect(result).toBeNull();
    });

    it('결과의 result가 undefined일 때 null을 반환해야 함', async () => {
        asMock(chrome.scripting.executeScript).mockResolvedValue([{ result: undefined }]);

        const result = await executeScript(1, vi.fn());

        expect(result).toBeNull();
    });

    it('chrome.scripting.executeScript가 reject 시 에러 전파해야 함', async () => {
        asMock(chrome.scripting.executeScript).mockRejectedValue(new Error('Cannot inject script'));

        await expect(executeScript(1, vi.fn())).rejects.toThrow('Cannot inject script');
    });

    it('결과 results가 null일 때 null을 반환해야 함', async () => {
        asMock(chrome.scripting.executeScript).mockResolvedValue(null as unknown as chrome.scripting.InjectionResult[]);

        const result = await executeScript(1, vi.fn());

        expect(result).toBeNull();
    });
});

describe('executeMainWorldScript', () => {
    it('MAIN world에서 스크립트를 실행해야 함', async () => {
        const mock_func = vi.fn();
        asMock(chrome.scripting.executeScript).mockResolvedValue([{ result: { zone: 'BA1' } }]);

        const result = await executeMainWorldScript(1, mock_func);

        expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
            target: { tabId: 1 },
            func: mock_func,
            world: 'MAIN',
        });
        expect(result).toEqual({ zone: 'BA1' });
    });

    it('결과가 없을 때 null을 반환해야 함', async () => {
        asMock(chrome.scripting.executeScript).mockResolvedValue([]);

        const result = await executeMainWorldScript(1, vi.fn());

        expect(result).toBeNull();
    });

    it('API 에러 시 에러를 전파해야 함', async () => {
        asMock(chrome.scripting.executeScript).mockRejectedValue(new Error('Cannot access contents'));

        await expect(executeMainWorldScript(1, vi.fn())).rejects.toThrow('Cannot access contents');
    });

    it('결과 result가 undefined일 때 null을 반환해야 함', async () => {
        asMock(chrome.scripting.executeScript).mockResolvedValue([{ result: undefined }]);

        const result = await executeMainWorldScript(1, vi.fn());

        expect(result).toBeNull();
    });
});
