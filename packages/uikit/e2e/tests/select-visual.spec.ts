import { test, expect } from '@playwright/test';
import { gotoStory } from '../helpers';

test.describe('Select VRT', () => {
  test('UC-VRT-SEL-001: 기본', async ({ page }) => {
    await gotoStory(page, 'uikit-select--default');
    await expect(page).toHaveScreenshot('select-default.png');
  });

  test('UC-VRT-SEL-002: 초기값 있음', async ({ page }) => {
    await gotoStory(page, 'uikit-select--with-initial-value');
    await expect(page).toHaveScreenshot('select-with-initial-value.png');
  });

  test('UC-VRT-SEL-003: 비활성', async ({ page }) => {
    await gotoStory(page, 'uikit-select--disabled');
    await expect(page).toHaveScreenshot('select-disabled.png');
  });

  test('UC-VRT-SEL-004: 옵션 다수', async ({ page }) => {
    await gotoStory(page, 'uikit-select--many-options');
    await expect(page).toHaveScreenshot('select-many-options.png');
  });
});
