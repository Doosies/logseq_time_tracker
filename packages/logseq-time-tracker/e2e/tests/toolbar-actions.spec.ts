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

function toolbarRegion(page: Page) {
    return page.getByRole('region', { name: '타이머 툴바' });
}

async function createJobViaFullView(page: Page, job_name: string) {
    await page.getByRole('button', { name: '전체 화면 열기' }).click();
    await expect(toolbarRegion(page)).toBeHidden();
    await page.getByRole('button', { name: '새 작업' }).click();
    await submitReasonModal(page, '새 작업', job_name);
    await page.getByRole('button', { name: /작은 화면|돌아가기/ }).click();
    await expect(toolbarRegion(page)).toBeVisible();
}

async function confirmEmptySwitchReason(page: Page) {
    const dialog = await waitForReasonModal(page, '작업 전환 사유');
    await dialog.getByRole('button', { name: '확인' }).click();
    await expect(dialog).toBeHidden();
}

test.describe('Toolbar 액션', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('#app').waitFor({ state: 'attached' });
        await expect(toolbarRegion(page)).toBeVisible();
    });

    test('UC-E2E-006: Toolbar에서 잡 시작 후 타이머가 실행된다', async ({ page }) => {
        await createJobViaFullView(page, '테스트 작업');

        const job_item = toolbarRegion(page).getByRole('listitem').filter({ hasText: '테스트 작업' });
        await job_item.locator(':scope > div').first().hover();
        await job_item.getByRole('button', { name: '시작' }).click();
        await confirmEmptySwitchReason(page);

        await expect(toolbarRegion(page).getByRole('button', { name: '일시정지' })).toBeVisible();
    });

    test('Toolbar 일시정지 시 사유 모달 후 재개 버튼이 보인다', async ({ page }) => {
        await createJobViaFullView(page, '일시정지 E2E');

        const job_item = toolbarRegion(page).getByRole('listitem').filter({ hasText: '일시정지 E2E' });
        await job_item.locator(':scope > div').first().hover();
        await job_item.getByRole('button', { name: '시작' }).click();
        await confirmEmptySwitchReason(page);

        await toolbarRegion(page).getByRole('button', { name: '일시정지' }).click();
        await submitReasonModal(page, '일시정지 사유', '휴식');

        await expect(toolbarRegion(page).getByRole('button', { name: '재개' })).toBeVisible();
    });

    test('Toolbar 완료 시 사유 모달 후 활성 작업 없음이 표시된다', async ({ page }) => {
        await createJobViaFullView(page, '완료 E2E');

        const job_item = toolbarRegion(page).getByRole('listitem').filter({ hasText: '완료 E2E' });
        await job_item.locator(':scope > div').first().hover();
        await job_item.getByRole('button', { name: '시작' }).click();
        await confirmEmptySwitchReason(page);

        await toolbarRegion(page).getByRole('button', { name: '완료' }).click();
        await submitReasonModal(page, '완료 사유', '작업 종료');

        await expect(toolbarRegion(page).getByText('활성 작업 없음')).toBeVisible();
    });
});
