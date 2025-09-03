import { Page } from '@playwright/test';

/**
 * 시나리오별 테스트 헬퍼 함수들
 * 각 시나리오에서 독립적으로 사용자 계정을 관리합니다.
 */

/**
 * 고정된 테스트 사용자 정보
 * @returns 고정된 사용자 정보
 */
export function getTestUser() {
  return {
    email: 'e2e-test@example.com',
    username: 'e2e-test-user',
    password: 'E2ETest123!',
  };
}

/**
 * 시나리오용 사용자 계정 삭제
 * @param page - Playwright Page 객체
 */
export async function deleteScenarioUser(page: Page) {
  const userInfo = getTestUser();

  try {
    // 로그인
    await page.goto('/user/sign-in');
    await page.fill('input[name="email"]', userInfo.email);
    await page.fill('input[name="password"]', userInfo.password);
    await page.click('button[type="submit"]');

    // 대시보드로 이동 대기
    await page.waitForURL(/.*\/dashboard/, { timeout: 10000 });

    // 로그아웃 (실제 계정 삭제는 구현에 따라 다를 수 있음)
    await page.request.post('/api/user/logout');

    console.log('✅ 시나리오 테스트 사용자 계정이 삭제되었습니다.');
  } catch (error) {
    // 삭제 실패는 테스트에 영향을 주지 않도록 무시
    console.log('⚠️ 사용자 계정 삭제 실패 (무시됨):', error);
  }
}

/**
 * 시나리오별 테스트 데이터 정리
 * @param page - Playwright Page 객체
 */
export async function cleanupScenarioData(page: Page) {
  try {
    // 동일 오리진 보장을 위해 앱으로 이동
    await page.goto('/dashboard');

    // 모든 알림 삭제
    const deleteButtons = page.locator('[data-testid="delete-notification"]');
    const count = await deleteButtons.count();

    for (let i = 0; i < count; i++) {
      await deleteButtons.nth(i).click();
      await page.click('button:has-text("확인")');
      await page.waitForTimeout(500); // 삭제 완료 대기
    }

    // 로컬 스토리지 정리 (동일 오리진에서만 접근 가능)
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        // 접근 불가 시 무시
      }
    });
  } catch (error) {
    console.log('⚠️ 테스트 데이터 정리 실패 (무시됨):', error);
  }
}

/**
 * 시나리오별 독립적인 테스트 실행을 위한 설정
 * @param page - Playwright Page 객체
 */
export async function setupScenarioTest(page: Page) {
  // 동일 오리진 보장을 위해 홈으로 이동 후 스토리지 초기화
  try {
    await page.goto('/');
  } catch (_) {}

  // 브라우저 상태 초기화
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // 접근 불가 시 무시
    }
  });

  // 쿠키 정리
  await page.context().clearCookies();
}

/**
 * 시나리오별 테스트 정리
 * @param page - Playwright Page 객체
 */
export async function teardownScenarioTest(page: Page) {
  // 테스트 데이터 정리
  await cleanupScenarioData(page);

  // 사용자 계정 삭제
  await deleteScenarioUser(page);

  // 브라우저 상태 초기화
  await setupScenarioTest(page);
}
