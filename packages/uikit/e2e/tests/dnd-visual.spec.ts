import { test, expect } from '@playwright/test';
import { gotoStory } from '../helpers';

test.describe('Dnd VRT', () => {
  test('UC-VRT-DND-001: 기본', async ({ page }) => {
    await gotoStory(page, 'uikit-dnd--default');
    await expect(page).toHaveScreenshot('dnd-default.png');
  });

  test('UC-VRT-DND-002: 드래그 핸들', async ({ page }) => {
    await gotoStory(page, 'uikit-dnd--has-drag-handles');
    await expect(page).toHaveScreenshot('dnd-has-drag-handles.png');
  });
});
