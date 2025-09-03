import { test, expect } from '@playwright/test';
import { setupScenarioTest, getTestUser } from '../helpers/scenario-helpers';

test.describe.configure({ mode: 'serial' });

test.use({ storageState: '.auth/user.json' });

test.describe('06 - 카카오톡 연동', () => {
  test('카카오톡 연동', async ({ page }) => {
    await setupScenarioTest(page);
    await page.goto('/dashboard');

    await page.click('text=카카오 연동');
    await expect(page.locator('h3')).toContainText('카카오 연결이 필요합니다');
    await expect(
      page.locator('button:has-text("카카오톡으로 연결하기")')
    ).toBeVisible();

    await page.click('button:has-text("카카오톡으로 연결하기")');
  });
});
