import { test, expect } from '@playwright/test';
import { gotoStory } from '../helpers';

test.describe('Section VRT', () => {
  test('UC-VRT-SEC-001: 제목 있음', async ({ page }) => {
    await gotoStory(page, 'uikit-section--with-title');
    await expect(page).toHaveScreenshot('section-with-title.png');
  });

  test('UC-VRT-SEC-002: 제목 없음', async ({ page }) => {
    await gotoStory(page, 'uikit-section--without-title');
    await expect(page).toHaveScreenshot('section-without-title.png');
  });

  test('UC-VRT-SEC-003: 액션 포함', async ({ page }) => {
    await gotoStory(page, 'uikit-section--with-action');
    await expect(page).toHaveScreenshot('section-with-action.png');
  });
});
