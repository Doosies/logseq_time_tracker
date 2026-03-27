import type { Page } from '@playwright/test';

export async function gotoStory(page: Page, story_id: string): Promise<void> {
  await page.goto(`/iframe.html?id=${story_id}&viewMode=story`);
  await page.locator('#storybook-root').waitFor({ state: 'attached' });
}
