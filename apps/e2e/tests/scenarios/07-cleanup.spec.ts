import { test } from '@playwright/test';
import { teardownScenarioTest } from '../helpers/scenario-helpers';

test.describe.configure({ mode: 'serial' });

test.use({ storageState: '.auth/user.json' });

test.describe('07 - 정리', () => {
  test('테스트 사용자 및 데이터 정리', async ({ page }) => {
    await teardownScenarioTest(page);
  });
});
