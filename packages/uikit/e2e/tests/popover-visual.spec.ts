import { test, expect } from '@playwright/test';
import { gotoStory } from '../helpers';

test.describe('Popover VRT', () => {
  test('UC-VRT-POP-001: 기본', async ({ page }) => {
    await gotoStory(page, 'uikit-popover--default');
    await expect(page).toHaveScreenshot('popover-default.png');
  });

  test('UC-VRT-POP-002: 열림', async ({ page }) => {
    await gotoStory(page, 'uikit-popover--opened');
    await expect(page).toHaveScreenshot('popover-opened.png');
  });
});
