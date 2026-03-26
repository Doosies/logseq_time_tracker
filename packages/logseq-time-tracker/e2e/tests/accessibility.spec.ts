import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('접근성 E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('#app').waitFor({ state: 'attached' });
        await page.getByRole('button', { name: '전체 화면 열기' }).click();
        await expect(page.locator('section[aria-label="타이머"]')).toBeVisible();
    });

    test('UC-A11Y-005: 색상 대비 WCAG 2.1 AA 준수', async ({ page }) => {
        const results = await new AxeBuilder({ page }).withTags(['wcag2aa']).withRules(['color-contrast']).analyze();

        expect(
            results.violations,
            `색상 대비 위반 ${results.violations.length}건: ${JSON.stringify(results.violations.map((v) => ({ id: v.id, nodes: v.nodes.length })))}`,
        ).toHaveLength(0);
    });
});
