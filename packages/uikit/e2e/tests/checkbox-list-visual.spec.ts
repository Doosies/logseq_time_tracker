import { test, expect } from '@playwright/test';
import { gotoStory } from '../helpers';

test.describe('CheckboxList VRT', () => {
  test('UC-VRT-CL-001: 기본', async ({ page }) => {
    await gotoStory(page, 'uikit-checkboxlist--default');
    await expect(page).toHaveScreenshot('checkbox-list-default.png');
  });

  test('UC-VRT-CL-002: 비활성 항목', async ({ page }) => {
    await gotoStory(page, 'uikit-checkboxlist--with-disabled');
    await expect(page).toHaveScreenshot('checkbox-list-with-disabled.png');
  });

  test('UC-VRT-CL-003: 항목 라벨 렌더', async ({ page }) => {
    await gotoStory(page, 'uikit-checkboxlist--item-labels-rendered');
    await expect(page).toHaveScreenshot('checkbox-list-item-labels-rendered.png');
  });
});
