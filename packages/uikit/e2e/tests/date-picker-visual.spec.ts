import { test, expect } from '@playwright/test';
import { gotoStory } from '../helpers';

test.describe('DatePicker VRT', () => {
  test('UC-VRT-DP-001: 기본', async ({ page }) => {
    await gotoStory(page, 'uikit-datepicker--default');
    await expect(page).toHaveScreenshot('date-picker-default.png');
  });

  test('UC-VRT-DP-002: 선택된 날짜', async ({ page }) => {
    await gotoStory(page, 'uikit-datepicker--with-selected-date');
    await expect(page).toHaveScreenshot('date-picker-with-selected-date.png');
  });
});
