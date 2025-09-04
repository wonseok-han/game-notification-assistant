import { Page } from '@playwright/test';
import { logQueue } from '@utils/log';

/**
 * 시나리오별 테스트 헬퍼 함수들
 * 각 시나리오에서 독립적으로 사용자 계정을 관리합니다.
 */

/**
 * 고정된 테스트 사용자 정보
 * @returns 고정된 사용자 정보
 */
export function getTestUser(projectName: string) {
  return {
    email: `e2e-test-${projectName}@example.com`,
    username: `e2e-test-user`,
    password: 'E2ETest123!',
  };
}

/**
 * E2E 테스트 데이터 정리 (e2e-reset API 사용)
 * @param page - Playwright Page 객체
 */
export async function cleanupE2ETestData(
  page: Page,
  { baseURL, logs }: { baseURL: string; logs: string[] }
) {
  try {
    logQueue(logs, '    ◐ 테스트 데이터 정리 중...');

    // 1. e2e-reset API 호출로 모든 테스트 데이터 삭제
    const resetResponse = await page.request.post(
      new URL('/api/e2e/reset', baseURL).toString()
    );

    if (resetResponse.ok()) {
      const result = await resetResponse.json();
      logQueue(logs, '    ✓ E2E 데이터 초기화 완료');
      if (result.deletedEmails?.length > 0) {
        logQueue(
          logs,
          '        ✓ 삭제된 이메일: \n' +
            result.deletedEmails
              .map((email: string) => '            ' + email)
              .join('\n')
        );
      }
    } else {
      logQueue(logs, '    ✗ E2E 데이터 초기화 실패: ' + resetResponse.status());
    }

    // 2. 로컬 스토리지 정리
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        // 접근 불가 시 무시
      }
    });
  } catch (error) {
    logQueue(logs, '    ✗ 테스트 데이터 정리 실패 (무시됨): ' + error);
  }
}

/**
 * E2E 테스트 데이터 일괄 정리 (e2e-reset API 사용 - 최적화된 버전)
 * @param page - Playwright Page 객체
 */
export async function cleanupE2ETestDataBulk(
  page: Page,
  { baseURL, logs }: { baseURL: string; logs: string[] }
) {
  try {
    logQueue(logs, '    ◐ 테스트 데이터 일괄 정리 중...');

    // e2e-reset API 호출로 모든 테스트 데이터 삭제
    await cleanupE2ETestData(page, { baseURL, logs });

    logQueue(logs, '    ✓ 테스트 데이터 일괄 정리 완료');
  } catch (error) {
    logQueue(logs, '    ✗ 테스트 데이터 일괄 정리 실패 (무시됨): ' + error);
  }
}
