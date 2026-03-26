import { test, expect } from '@playwright/test';
import { toolbarRegion, createJobViaFullView, confirmEmptySwitchReason, freezeTimerText } from '../helpers';

test.describe('Toolbar VRT', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('#app').waitFor({ state: 'attached' });
        await expect(toolbarRegion(page)).toBeVisible();
    });

    test('UC-VRT-001: Toolbar 기본 상태 (잡 없음)', async ({ page }) => {
        await expect(page).toHaveScreenshot('toolbar-empty.png');
    });

    test('UC-VRT-002: Toolbar에서 완료 클릭 시 ReasonModal 표시', async ({ page }) => {
        await createJobViaFullView(page, 'VRT 완료 테스트');

        const job_item = toolbarRegion(page).getByRole('listitem').filter({ hasText: 'VRT 완료 테스트' });
        await job_item.locator(':scope > div').first().hover();
        await job_item.getByRole('button', { name: '시작' }).click();
        await confirmEmptySwitchReason(page);

        await freezeTimerText(page);
        await toolbarRegion(page).getByRole('button', { name: '완료' }).click();

        const dialog = page.getByRole('dialog', { name: '완료 사유' });
        await expect(dialog).toBeVisible();
        await expect(page).toHaveScreenshot('toolbar-complete-modal.png');
    });

    test('UC-VRT-003: Toolbar에서 일시정지 클릭 시 ReasonModal 표시', async ({ page }) => {
        await createJobViaFullView(page, 'VRT 일시정지 테스트');

        const job_item = toolbarRegion(page).getByRole('listitem').filter({ hasText: 'VRT 일시정지 테스트' });
        await job_item.locator(':scope > div').first().hover();
        await job_item.getByRole('button', { name: '시작' }).click();
        await confirmEmptySwitchReason(page);

        await freezeTimerText(page);
        await toolbarRegion(page).getByRole('button', { name: '일시정지' }).click();

        const dialog = page.getByRole('dialog', { name: '일시정지 사유' });
        await expect(dialog).toBeVisible();
        await expect(page).toHaveScreenshot('toolbar-pause-modal.png');
    });
});
