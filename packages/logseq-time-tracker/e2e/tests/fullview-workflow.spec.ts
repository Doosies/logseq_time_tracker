import { test, expect, type Page } from '@playwright/test';

async function waitForReasonModal(page: Page, title: string) {
    const dialog = page.getByRole('dialog', { name: title });
    await expect(dialog).toBeVisible();
    return dialog;
}

async function submitReasonModal(page: Page, title: string, text: string) {
    const dialog = await waitForReasonModal(page, title);
    await dialog.locator('textarea').fill(text);
    await dialog.getByRole('button', { name: '확인' }).click();
    await expect(dialog).toBeHidden();
}

test.describe('FullView compact E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('#app').waitFor({ state: 'attached' });
        await page.getByRole('button', { name: '전체 화면 열기' }).click();
        await expect(page.locator('section[aria-label="타이머"]')).toBeVisible();
    });

    test('UC-E2E-003: 잡 생성 → 제목 입력 → 시작 시 타이머 동작 및 진행중 상태', async ({ page }) => {
        // 유즈케이스의 "잡 생성"은 Phase 3 UI에서 STRINGS.job.create('새 작업') 버튼으로 수행
        await page.getByRole('button', { name: '새 작업' }).click();
        await submitReasonModal(page, '새 작업', 'UC-E2E-003 작업');

        await page.getByRole('button', { name: '시작' }).click();
        await expect(page.getByRole('button', { name: '일시정지' })).toBeVisible();

        const job_row = page.getByRole('button', { name: /UC-E2E-003 작업/ });
        await expect(job_row).toContainText('진행중');

        const elapsed = page.getByRole('timer', { name: '경과 시간' });
        await expect(elapsed).toBeVisible();
        const t1 = await elapsed.textContent();
        await page.waitForTimeout(1500);
        const t2 = await elapsed.textContent();
        expect(t1).not.toBe(t2);
    });
});
