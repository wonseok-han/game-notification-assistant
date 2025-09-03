import { FullConfig, chromium } from '@playwright/test';
import { cleanupE2ETestDataBulk } from './helpers/scenario-helpers';

/**
 * 전역 테스트 정리
 * 모든 테스트 실행 후에 한 번만 실행되는 정리 파일
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 E2E 테스트 전역 정리 시작...');

  try {
    // 브라우저 컨텍스트 생성하여 API 직접 호출
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const baseURL = config?.projects?.[0]?.use?.baseURL;

    if (!baseURL) {
      throw new Error('baseURL이 없습니다.');
    }

    // API를 통한 테스트 데이터 정리
    await cleanupE2ETestDataBulk(page, {
      baseURL,
    });

    // 브라우저 정리
    await browser.close();

    console.log('✅ 테스트 데이터 정리 완료');
  } catch (error) {
    console.error('❌ 전역 정리 실패:', error);
    // 정리 실패는 테스트 결과에 영향을 주지 않도록 에러를 던지지 않음
  }

  console.log('🎉 E2E 테스트 전역 정리 완료!');
}

export default globalTeardown;
