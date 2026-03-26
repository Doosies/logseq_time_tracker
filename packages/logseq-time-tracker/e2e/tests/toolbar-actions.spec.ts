import { test, expect } from '@playwright/test';
import {
    toolbarRegion,
    createJobViaFullView,
    submitReasonModal,
    confirmEmptySwitchReason,
} from '../helpers';

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

    test('UC-E2E-010: Toolbar 일시정지 시 사유 모달 후 재개 버튼이 보인다', async ({ page }) => {
        await createJobViaFullView(page, '일시정지 E2E');

        const job_item = toolbarRegion(page).getByRole('listitem').filter({ hasText: '일시정지 E2E' });
        await job_item.locator(':scope > div').first().hover();
        await job_item.getByRole('button', { name: '시작' }).click();
        await confirmEmptySwitchReason(page);

        await toolbarRegion(page).getByRole('button', { name: '일시정지' }).click();
        await submitReasonModal(page, '일시정지 사유', '휴식');

        await expect(toolbarRegion(page).getByRole('button', { name: '재개' })).toBeVisible();
    });

    test('UC-E2E-011: Toolbar 완료 시 사유 모달 후 활성 작업 없음이 표시된다', async ({ page }) => {
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
