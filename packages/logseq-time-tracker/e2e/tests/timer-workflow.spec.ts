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

function timeEntryTable(page: Page) {
    const debug_dialog = page.getByRole('dialog', { name: '시간 기록' });
    return debug_dialog.getByRole('columnheader', { name: '소요' }).locator('xpath=ancestor::table[1]');
}

function historyTable(page: Page) {
    const debug_dialog = page.getByRole('dialog', { name: '시간 기록' });
    return debug_dialog.getByRole('columnheader', { name: '전환' }).locator('xpath=ancestor::table[1]');
}

test.describe('타이머 E2E 워크플로우', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // #app은 자식 마운트 전·후에도 뷰포트에서 hidden으로 잡힐 수 있어 attached만 확인
        await page.locator('#app').waitFor({ state: 'attached' });
        await page.getByRole('button', { name: '전체 화면 열기' }).click();
        await expect(page.locator('section[aria-label="타이머"]')).toBeVisible();
    });

    test('UC-E2E-001: 타이머 시작 → 경과 → 정지 → 기록 확인', async ({ page }) => {
        await page.getByRole('button', { name: '새 작업' }).click();
        await submitReasonModal(page, '새 작업', 'E2E 작업 1');

        await page.getByRole('button', { name: '시작' }).click();
        await expect(page.getByRole('button', { name: '일시정지' })).toBeVisible();

        await page.waitForTimeout(2000);

        await page.getByRole('button', { name: '완료' }).click();
        await submitReasonModal(page, '완료 사유', '테스트 완료');

        await page.getByRole('button', { name: '기록 보기' }).click();
        await expect(page.getByRole('dialog', { name: '시간 기록' })).toBeVisible();

        const entry_table = timeEntryTable(page);
        const data_row = entry_table.locator('tbody tr').filter({ hasText: 'E2E 작업 1' });
        await expect(data_row).toHaveCount(1);

        const duration_cell = data_row.locator('td').nth(3);
        await expect(duration_cell).not.toHaveText('');
        await expect(duration_cell).not.toHaveText('00:00:00');
    });

    test('UC-E2E-002: Job A → Job B 전환 시 자동 일시정지', async ({ page }) => {
        await page.getByRole('button', { name: '새 작업' }).click();
        await submitReasonModal(page, '새 작업', 'E2E 작업 A');

        await page.getByRole('button', { name: '시작' }).click();
        await expect(page.getByRole('button', { name: '일시정지' })).toBeVisible();

        await page.getByRole('button', { name: '+ 새 작업' }).click();
        await submitReasonModal(page, '새 작업', 'E2E 작업 B');

        await expect(page.getByRole('button', { name: '전환' })).toBeVisible();

        await page.getByRole('button', { name: '전환' }).click();
        const switch_dialog = await waitForReasonModal(page, '작업 전환 사유');
        await switch_dialog.getByRole('button', { name: '확인' }).click();
        await expect(switch_dialog).toBeHidden();

        const job_a_row = page.getByRole('button', { name: /E2E 작업 A/ });
        await expect(job_a_row).toContainText('보류');

        const job_b_row = page.getByRole('button', { name: /E2E 작업 B/ });
        await expect(job_b_row).toContainText('진행중');

        await page.getByRole('button', { name: '기록 보기' }).click();
        await expect(page.getByRole('dialog', { name: '시간 기록' })).toBeVisible();
        await expect(
            page.getByRole('dialog', { name: '시간 기록' }).getByRole('heading', { name: '상태 전환 이력' }),
        ).toBeVisible();

        const history_rows = historyTable(page).locator('tbody tr');
        await expect(history_rows.first()).toBeVisible();
        await expect(history_rows.filter({ hasText: 'E2E 작업 A' }).first()).toBeVisible();
    });
});
