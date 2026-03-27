import { test, expect } from '@playwright/test';
import { gotoStory } from '../helpers';

test.describe('Toast VRT', () => {
  test('UC-VRT-TST-001: 기본', async ({ page }) => {
    await gotoStory(page, 'uikit-toast--default');
    await expect(page).toHaveScreenshot('toast-default.png');
  });

  test('UC-VRT-TST-002: 토스트 표시', async ({ page }) => {
    await gotoStory(page, 'uikit-toast--show-toast');
    await expect(page).toHaveScreenshot('toast-show-toast.png');
  });
});
