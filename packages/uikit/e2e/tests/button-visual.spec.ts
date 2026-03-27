import { test, expect } from '@playwright/test';
import { gotoStory } from '../helpers';

test.describe('Button VRT', () => {
  test('UC-VRT-BTN-001: Primary 버튼', async ({ page }) => {
    await gotoStory(page, 'uikit-button--primary');
    await expect(page).toHaveScreenshot('button-primary.png');
  });

  test('UC-VRT-BTN-002: Secondary 버튼', async ({ page }) => {
    await gotoStory(page, 'uikit-button--secondary');
    await expect(page).toHaveScreenshot('button-secondary.png');
  });

  test('UC-VRT-BTN-003: Accent 버튼', async ({ page }) => {
    await gotoStory(page, 'uikit-button--accent');
    await expect(page).toHaveScreenshot('button-accent.png');
  });

  test('UC-VRT-BTN-004: Ghost 버튼', async ({ page }) => {
    await gotoStory(page, 'uikit-button--ghost');
    await expect(page).toHaveScreenshot('button-ghost.png');
  });

  test('UC-VRT-BTN-005: 비활성 Ghost 버튼', async ({ page }) => {
    await gotoStory(page, 'uikit-button--ghost-disabled');
    await expect(page).toHaveScreenshot('button-ghost-disabled.png');
  });

  test('UC-VRT-BTN-006: Small 크기', async ({ page }) => {
    await gotoStory(page, 'uikit-button--small');
    await expect(page).toHaveScreenshot('button-small.png');
  });

  test('UC-VRT-BTN-007: Medium 크기', async ({ page }) => {
    await gotoStory(page, 'uikit-button--medium');
    await expect(page).toHaveScreenshot('button-medium.png');
  });

  test('UC-VRT-BTN-008: 비활성', async ({ page }) => {
    await gotoStory(page, 'uikit-button--disabled');
    await expect(page).toHaveScreenshot('button-disabled.png');
  });

  test('UC-VRT-BTN-009: 전체 너비', async ({ page }) => {
    await gotoStory(page, 'uikit-button--full-width');
    await expect(page).toHaveScreenshot('button-full-width.png');
  });
});
