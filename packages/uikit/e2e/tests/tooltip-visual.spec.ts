import { test, expect } from '@playwright/test';
import { gotoStory } from '../helpers';

test.describe('Tooltip VRT', () => {
  test('UC-VRT-TT-001: 기본', async ({ page }) => {
    await gotoStory(page, 'uikit-tooltip--default');
    await expect(page).toHaveScreenshot('tooltip-default.png');
  });

  test('UC-VRT-TT-002: 모든 위치', async ({ page }) => {
    await gotoStory(page, 'uikit-tooltip--all-positions');
    await expect(page).toHaveScreenshot('tooltip-all-positions.png');
  });

  test('UC-VRT-TT-003: 긴 내용', async ({ page }) => {
    await gotoStory(page, 'uikit-tooltip--long-content');
    await expect(page).toHaveScreenshot('tooltip-long-content.png');
  });

  test('UC-VRT-TT-004: 비활성', async ({ page }) => {
    await gotoStory(page, 'uikit-tooltip--disabled');
    await expect(page).toHaveScreenshot('tooltip-disabled.png');
  });
});
