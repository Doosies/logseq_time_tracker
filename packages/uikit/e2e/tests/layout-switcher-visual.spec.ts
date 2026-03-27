import { test, expect } from '@playwright/test';
import { gotoStory } from '../helpers';

test.describe('LayoutSwitcher VRT', () => {
  test('UC-VRT-LS-001: FullLayout', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await gotoStory(page, 'uikit-layoutswitcher--full-layout');
    await expect(page).toHaveScreenshot('layout-switcher-full.png');
  });

  test('UC-VRT-LS-002: 컴팩트 레이아웃', async ({ page }) => {
    await gotoStory(page, 'uikit-layoutswitcher--compact-layout');
    await expect(page).toHaveScreenshot('layout-switcher-compact-layout.png');
  });

  test('UC-VRT-LS-003: 커스텀 브레이크포인트', async ({ page }) => {
    await gotoStory(page, 'uikit-layoutswitcher--custom-breakpoint');
    await expect(page).toHaveScreenshot('layout-switcher-custom-breakpoint.png');
  });
});
