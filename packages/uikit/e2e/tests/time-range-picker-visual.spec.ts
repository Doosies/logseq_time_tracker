import { test, expect } from '@playwright/test';
import { gotoStory } from '../helpers';

test.describe('TimeRangePicker VRT', () => {
  test('UC-VRT-TRP-001: 기본', async ({ page }) => {
    await gotoStory(page, 'uikit-timerangepicker--default');
    await expect(page).toHaveScreenshot('time-range-picker-default.png');
  });

  test('UC-VRT-TRP-002: 범위 미리 채움', async ({ page }) => {
    await gotoStory(page, 'uikit-timerangepicker--with-prefilled-range');
    await expect(page).toHaveScreenshot('time-range-picker-with-prefilled-range.png');
  });
});
