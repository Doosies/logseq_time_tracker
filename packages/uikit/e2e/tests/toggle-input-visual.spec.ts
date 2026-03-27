import { test, expect } from '@playwright/test';
import { gotoStory } from '../helpers';

test.describe('ToggleInput VRT', () => {
  test('UC-VRT-TGL-001: 선택 모드', async ({ page }) => {
    await gotoStory(page, 'uikit-toggleinput--select-mode');
    await expect(page).toHaveScreenshot('toggle-input-select-mode.png');
  });

  test('UC-VRT-TGL-002: 텍스트 모드', async ({ page }) => {
    await gotoStory(page, 'uikit-toggleinput--text-mode');
    await expect(page).toHaveScreenshot('toggle-input-text-mode.png');
  });

  test('UC-VRT-TGL-003: 접두사 있음', async ({ page }) => {
    await gotoStory(page, 'uikit-toggleinput--with-prefix');
    await expect(page).toHaveScreenshot('toggle-input-with-prefix.png');
  });
});
