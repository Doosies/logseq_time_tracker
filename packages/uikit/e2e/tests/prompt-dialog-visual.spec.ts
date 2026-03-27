import { test, expect } from '@playwright/test';
import { gotoStory } from '../helpers';

test.describe('PromptDialog VRT', () => {
  test('UC-VRT-PD-001: 기본', async ({ page }) => {
    await gotoStory(page, 'uikit-promptdialog--default');
    await expect(page).toHaveScreenshot('prompt-dialog-default.png');
  });

  test('UC-VRT-PD-002: 확인 포함', async ({ page }) => {
    await gotoStory(page, 'uikit-promptdialog--with-confirm');
    await expect(page).toHaveScreenshot('prompt-dialog-with-confirm.png');
  });
});
