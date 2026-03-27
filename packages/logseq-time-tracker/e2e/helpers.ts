import { expect, type Page } from '@playwright/test';

export async function waitForReasonModal(page: Page, title: string) {
    const dialog = page.getByRole('dialog', { name: title });
    await expect(dialog).toBeVisible();
    return dialog;
}

export async function submitReasonModal(page: Page, title: string, text: string) {
    const dialog = await waitForReasonModal(page, title);
    await dialog.locator('textarea').fill(text);
    const confirm_btn = dialog.getByRole('button', { name: '확인' });
    await confirm_btn.click();
    await expect(dialog).toBeHidden();
}

export function toolbarRegion(page: Page) {
    return page.getByRole('region', { name: '타이머 툴바' });
}

export async function createJobViaFullView(page: Page, job_name: string) {
    await page.getByRole('button', { name: '전체 화면 열기' }).click();
    await expect(toolbarRegion(page)).toBeHidden();
    await page.getByRole('button', { name: '새 작업' }).click();
    await submitReasonModal(page, '새 작업', job_name);
    await page.getByRole('button', { name: /작은 화면|돌아가기/ }).click();
    await expect(toolbarRegion(page)).toBeVisible();
}

export async function confirmEmptySwitchReason(page: Page) {
    const dialog = await waitForReasonModal(page, '작업 전환 사유');
    const confirm_btn = dialog.getByRole('button', { name: '확인' });
    await confirm_btn.click();
    await expect(dialog).toBeHidden();
}

export async function freezeTimerText(page: Page) {
    await page.evaluate(() => {
        document.querySelectorAll('[data-testid="elapsed-timer"], time').forEach((el) => {
            (el as HTMLElement).textContent = '00:00:00';
        });
    });
}
