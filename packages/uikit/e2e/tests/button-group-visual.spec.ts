import { test, expect } from '@playwright/test';
import { gotoStory } from '../helpers';

test.describe('ButtonGroup VRT', () => {
  test('UC-VRT-BG-001: 기본', async ({ page }) => {
    await gotoStory(page, 'uikit-buttongroup--default');
    await expect(page).toHaveScreenshot('button-group-default.png');
  });

  test('UC-VRT-BG-002: 혼합 variant', async ({ page }) => {
    await gotoStory(page, 'uikit-buttongroup--mixed-variants');
    await expect(page).toHaveScreenshot('button-group-mixed-variants.png');
  });

  test('UC-VRT-BG-003: 비활성 포함', async ({ page }) => {
    await gotoStory(page, 'uikit-buttongroup--with-disabled');
    await expect(page).toHaveScreenshot('button-group-with-disabled.png');
  });
});
