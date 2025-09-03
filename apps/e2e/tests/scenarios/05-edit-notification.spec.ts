import { test, expect } from '@playwright/test';
import { setupScenarioTest } from '../helpers/scenario-helpers';

test.describe.configure({ mode: 'serial' });

test.describe('05 - 알림 편집', () => {
  test('생성한 알림 편집', async ({ page }) => {
    await setupScenarioTest(page);
    await page.goto('/dashboard');

    await page.click('[data-testid="edit-notification"]');
    await expect(page.locator('h2')).toContainText('알림 수정');

    await page.fill('input[name="gameName"]', '수정된 E2E 테스트 게임');
    await page.fill('input[name="notificationTime"]', '21:00');
    await page.fill(
      'textarea[name="description"]',
      '수정된 E2E 시나리오 테스트용 알림입니다'
    );

    await page.click('button[type="submit"]');
    await expect(
      page.locator('text=알림이 성공적으로 수정되었습니다')
    ).toBeVisible();
    await expect(page.locator('text=수정된 E2E 테스트 게임')).toBeVisible();
    await expect(page.locator('text=21:00')).toBeVisible();
  });
});
