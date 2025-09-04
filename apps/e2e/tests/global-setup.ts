import { chromium, FullConfig } from '@playwright/test';
import { logQueue, saveLog } from '@utils/log';

/**
 * 전역 테스트 설정
 * 모든 테스트 실행 전에 한 번만 실행되는 설정 파일
 */
async function globalSetup(config: FullConfig) {
  const logs: string[] = [];

  logQueue(logs, '▶ E2E 테스트 전역 설정 시작...');

  // 브라우저 인스턴스 생성
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // 애플리케이션이 정상적으로 실행되는지 확인
    logQueue(logs, '    ◐ 애플리케이션 상태 확인 중...');

    const baseURL =
      config?.projects[0]?.use?.baseURL || 'http://localhost:3000';
    const response = await page.goto(baseURL, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    if (!response || !response.ok()) {
      throw new Error(
        `애플리케이션에 접근할 수 없습니다: ${response?.status()}`
      );
    }

    // ===== 스토리지 초기화 =====
    logQueue(logs, '    ◐ 브라우저 스토리지 초기화 중...');

    // 로컬 스토리지와 세션 스토리지 초기화
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ 브라우저 스토리지가 초기화되었습니다.');
      } catch (error) {
        console.error('⚠️ 스토리지 초기화 중 오류 발생:', error);
      }
    });

    // 쿠키 초기화
    await page.context().clearCookies();
    logQueue(logs, '    ✓ 브라우저 쿠키가 초기화되었습니다.');

    logQueue(logs, '    ✓ 애플리케이션이 정상적으로 실행 중입니다.');

    // 테스트 환경 준비 완료
    logQueue(logs, '    ✓ 테스트 환경이 준비되었습니다.');
    logQueue(
      logs,
      'ℹ 각 시나리오에서 필요한 사용자 계정을 자체적으로 관리합니다.'
    );
  } catch (error) {
    logQueue(logs, `✗ 전역 설정 실패: ${error}`);
    throw error;
  } finally {
    await browser.close();
  }

  logQueue(logs, '    ✓ E2E 테스트 전역 설정 완료!');

  saveLog(logs, 'global-setup.log');
}

export default globalSetup;
