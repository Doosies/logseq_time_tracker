import { test, expect } from '@playwright/test';
import { gotoStory } from '../helpers';

test.describe('Card VRT', () => {
  test('UC-VRT-CRD-001: 기본', async ({ page }) => {
    await gotoStory(page, 'uikit-card--default');
    await expect(page).toHaveScreenshot('card-default.png');
  });

  test('UC-VRT-CRD-002: 헤더·푸터만', async ({ page }) => {
    await gotoStory(page, 'uikit-card--header-and-footer-only');
    await expect(page).toHaveScreenshot('card-header-and-footer-only.png');
  });

  test('UC-VRT-CRD-003: 전체 파트', async ({ page }) => {
    await gotoStory(page, 'uikit-card--all-parts');
    await expect(page).toHaveScreenshot('card-all-parts.png');
  });

  test('UC-VRT-CRD-004: 컴포넌트 포함', async ({ page }) => {
    await gotoStory(page, 'uikit-card--with-components');
    await expect(page).toHaveScreenshot('card-with-components.png');
  });
});
