import { test, expect } from '@playwright/test';
import { gotoStory } from '../helpers';

test.describe('TextInput VRT', () => {
  test('UC-VRT-TI-001: 기본', async ({ page }) => {
    await gotoStory(page, 'uikit-textinput--default');
    await expect(page).toHaveScreenshot('text-input-default.png');
  });

  test('UC-VRT-TI-002: placeholder', async ({ page }) => {
    await gotoStory(page, 'uikit-textinput--with-placeholder');
    await expect(page).toHaveScreenshot('text-input-with-placeholder.png');
  });

  test('UC-VRT-TI-003: 초기값 있음', async ({ page }) => {
    await gotoStory(page, 'uikit-textinput--with-initial-value');
    await expect(page).toHaveScreenshot('text-input-with-initial-value.png');
  });

  test('UC-VRT-TI-004: 비활성', async ({ page }) => {
    await gotoStory(page, 'uikit-textinput--disabled');
    await expect(page).toHaveScreenshot('text-input-disabled.png');
  });
});
