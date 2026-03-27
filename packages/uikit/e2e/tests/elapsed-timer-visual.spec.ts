import { test, expect } from '@playwright/test';
import { gotoStory } from '../helpers';

test.describe('ElapsedTimer VRT', () => {
  test('UC-VRT-ET-001: 정지', async ({ page }) => {
    await gotoStory(page, 'uikit-elapsedtimer--stopped');
    await expect(page).toHaveScreenshot('elapsed-timer-stopped.png');
  });

  test('UC-VRT-ET-002: 실행(고정)', async ({ page }) => {
    await gotoStory(page, 'uikit-elapsedtimer--running-static');
    await expect(page).toHaveScreenshot('elapsed-timer-running-static.png');
  });

  test('UC-VRT-ET-003: 일시정지', async ({ page }) => {
    await gotoStory(page, 'uikit-elapsedtimer--paused');
    await expect(page).toHaveScreenshot('elapsed-timer-paused.png');
  });

  test('UC-VRT-ET-004: 커스텀 포맷터', async ({ page }) => {
    await gotoStory(page, 'uikit-elapsedtimer--custom-formatter');
    await expect(page).toHaveScreenshot('elapsed-timer-custom-formatter.png');
  });
});
