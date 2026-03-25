import { test, expect, type Page } from '@playwright/test';

async function submitReasonModal(page: Page, title: string, text: string) {
    const dialog = page.getByRole('dialog', { name: title });
    await expect(dialog).toBeVisible();
    await dialog.locator('textarea').fill(text);
    await dialog.getByRole('button', { name: '확인' }).click();
    await expect(dialog).toBeHidden();
}

test.describe('성능 E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('#app').waitFor({ state: 'attached' });
        await expect(page.locator('section[aria-label="타이머"]')).toBeVisible();
    });

    test('UC-PERF-001: 타이머 시작 응답 시간 ≤200ms', async ({ page }) => {
        await page.getByRole('button', { name: '새 작업' }).click();
        await submitReasonModal(page, '새 작업', 'PERF-001 작업');

        const start_btn = page.getByRole('button', { name: '시작' });
        await expect(start_btn).toBeVisible();

        const t0 = performance.now();
        await start_btn.click();
        await expect(page.getByRole('button', { name: '일시정지' })).toBeVisible();
        const elapsed = performance.now() - t0;

        expect(elapsed).toBeLessThanOrEqual(200);
    });

    test('UC-PERF-002: Job 전환 응답 시간 ≤200ms', async ({ page }) => {
        await page.getByRole('button', { name: '새 작업' }).click();
        await submitReasonModal(page, '새 작업', 'PERF-002 작업 A');

        await page.getByRole('button', { name: '시작' }).click();
        await expect(page.getByRole('button', { name: '일시정지' })).toBeVisible();

        await page.getByRole('button', { name: '+ 새 작업' }).click();
        await submitReasonModal(page, '새 작업', 'PERF-002 작업 B');

        await page.getByRole('button', { name: /PERF-002 작업 B/ }).click();

        const switch_btn = page.getByRole('button', { name: '전환' });
        await expect(switch_btn).toBeVisible();

        const t0 = performance.now();
        await switch_btn.click();
        await expect(page.getByRole('dialog', { name: '작업 전환 사유' })).toBeVisible();
        const elapsed = performance.now() - t0;

        expect(elapsed).toBeLessThanOrEqual(200);
    });
});
