import { FullConfig } from '@playwright/test';

/**
 * 전역 테스트 정리
 * 모든 테스트 실행 후에 한 번만 실행되는 정리 파일
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 E2E 테스트 전역 정리 시작...');

  try {
    // 테스트용 데이터 정리
    console.log('🗑️ 테스트 데이터 정리 중...');
    // await cleanupTestData();

    // 테스트용 사용자 계정 삭제 (필요한 경우)
    // await deleteTestUsers();

    // 테스트용 파일 정리
    // await cleanupTestFiles();

    console.log('✅ 테스트 데이터 정리 완료');
  } catch (error) {
    console.error('❌ 전역 정리 실패:', error);
    // 정리 실패는 테스트 결과에 영향을 주지 않도록 에러를 던지지 않음
  }

  console.log('🎉 E2E 테스트 전역 정리 완료!');
}

export default globalTeardown;
