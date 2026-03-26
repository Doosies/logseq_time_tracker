import { test, expect, type Page } from '@playwright/test';

function toolbarRegion(page: Page) {
    return page.getByRole('region', { name: '타이머 툴바' });
}

function fullViewTimerSection(page: Page) {
    return page.locator('section[aria-label="타이머"]');
}

async function flowOpenFullView(page: Page) {
    await page.getByRole('button', { name: '전체 화면 열기' }).click();
    await expect(toolbarRegion(page)).toBeHidden();
    await expect(fullViewTimerSection(page)).toBeVisible();
    await expect(page.getByRole('button', { name: '돌아가기' })).toBeVisible();
}

test.describe('UI 모드 전환', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('#app').waitFor({ state: 'attached' });
        await expect(toolbarRegion(page)).toBeVisible();
    });

    test('UC-E2E-006: 전체 화면 열기 시 툴바는 숨고 타이머 영역과 돌아가기가 보인다', async ({ page }) => {
        await flowOpenFullView(page);
    });

    test('UC-E2E-007: ESC로 숨긴 뒤 모의 툴바로 다시 열면 전체 화면 상태가 유지된다', async ({ page }) => {
        await flowOpenFullView(page);
        await page.keyboard.press('Escape');
        const app_root = page.locator('#app');
        await expect(app_root).toBeHidden();
        await page.locator('#mock-toolbar-trigger').click();
        // #app 자식이 fixed 레이아웃이라 박스가 0×0일 수 있어 toBeVisible()은 부적합
        await expect(app_root).toHaveCSS('display', 'block');
        await expect(fullViewTimerSection(page)).toBeVisible();
    });

    test('UC-E2E-008: 돌아가기로 작은 툴바로 전환하면 타이머 섹션은 숨는다', async ({ page }) => {
        await flowOpenFullView(page);
        await page.getByRole('button', { name: '돌아가기' }).click();
        await expect(toolbarRegion(page)).toBeVisible();
        await expect(fullViewTimerSection(page)).toBeHidden();
    });

    test('UC-E2E-009: 작은 툴바 상태에서 ESC 후 재열기 시 툴바 상태가 유지된다', async ({ page }) => {
        await flowOpenFullView(page);
        await page.getByRole('button', { name: '돌아가기' }).click();
        await expect(toolbarRegion(page)).toBeVisible();
        await expect(fullViewTimerSection(page)).toBeHidden();

        await page.keyboard.press('Escape');
        const app_root = page.locator('#app');
        await expect(app_root).toBeHidden();
        await page.locator('#mock-toolbar-trigger').click();
        await expect(app_root).toHaveCSS('display', 'block');
        await expect(toolbarRegion(page)).toBeVisible();
    });
});
