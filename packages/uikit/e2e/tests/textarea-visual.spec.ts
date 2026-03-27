import { test, expect } from '@playwright/test';
import { gotoStory } from '../helpers';

test.describe('Textarea VRT', () => {
  test('UC-VRT-TA-001: 기본', async ({ page }) => {
    await gotoStory(page, 'uikit-textarea--default');
    await expect(page).toHaveScreenshot('textarea-default.png');
  });

  test('UC-VRT-TA-002: placeholder', async ({ page }) => {
    await gotoStory(page, 'uikit-textarea--with-placeholder');
    await expect(page).toHaveScreenshot('textarea-with-placeholder.png');
  });

  test('UC-VRT-TA-003: 값 있음', async ({ page }) => {
    await gotoStory(page, 'uikit-textarea--with-value');
    await expect(page).toHaveScreenshot('textarea-with-value.png');
  });

  test('UC-VRT-TA-004: 비활성', async ({ page }) => {
    await gotoStory(page, 'uikit-textarea--disabled');
    await expect(page).toHaveScreenshot('textarea-disabled.png');
  });

  test('UC-VRT-TA-005: 고정폭', async ({ page }) => {
    await gotoStory(page, 'uikit-textarea--monospace');
    await expect(page).toHaveScreenshot('textarea-monospace.png');
  });

  test('UC-VRT-TA-006: 사용자 행 수', async ({ page }) => {
    await gotoStory(page, 'uikit-textarea--custom-rows');
    await expect(page).toHaveScreenshot('textarea-custom-rows.png');
  });
});
