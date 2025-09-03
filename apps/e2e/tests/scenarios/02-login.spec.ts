import { test, expect } from '@playwright/test';
import { setupScenarioTest, getTestUser } from '../helpers/scenario-helpers';
import { saveSession } from '../helpers/session-helpers';

test.describe.configure({ mode: 'serial' });

test.describe('02 - 로그인', () => {
  test('회원가입한 유저로 로그인', async ({ page }) => {
    await setupScenarioTest(page);

    const user = getTestUser();
    await page.goto('/user/sign-in');

    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/);

    // 헤더 확인
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(
      header.getByRole('heading', { name: '게임 알림 어시스턴트' })
    ).toBeVisible();

    await expect(header.locator(`p:has-text("${user.email}")`)).toBeVisible();
    await expect(
      header.locator(`p:has-text("${user.username}")`)
    ).toBeVisible();

    await expect(page.locator('h2:has-text("게임 알림 관리")')).toBeVisible();

    // 로그인 세션 저장 (다른 테스트에서 사용)
    await saveSession(page, '로그인 세션');
  });
});
