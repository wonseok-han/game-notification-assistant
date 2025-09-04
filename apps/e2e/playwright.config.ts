import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 테스트 설정
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 테스트 디렉토리 (시나리오 기반 테스트만 실행)
  testDir: './tests/scenarios',

  // 아카이브 폴더 제외
  testIgnore: [],

  // 전역 설정 및 정리
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',

  // 병렬 실행 설정 (파일 순차 실행)
  fullyParallel: false,

  // 실패 시 재시도 횟수
  retries: process.env.CI ? 2 : 0,

  // 리포터 설정
  reporter: [
    ['./custom-reporter.ts'], // 커스텀 리포터
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],

  // 전역 테스트 설정
  use: {
    // 기본 URL (로컬 개발 서버)
    baseURL: 'http://localhost:3000',

    // 브라우저 컨텍스트 옵션
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // 액션 타임아웃
    actionTimeout: 10000,
    navigationTimeout: 30000,

    // data-testid 속성을 우선적으로 사용
    testIdAttribute: 'data-testid',

    // 헤드리스 모드
    headless: true,
  },

  // 프로젝트별 브라우저 설정
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      // 프로젝트 내 직렬 실행
      fullyParallel: false,
      workers: 1,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      // 프로젝트 내 직렬 실행
      fullyParallel: false,
      workers: 1,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      // 프로젝트 내 직렬 실행
      fullyParallel: false,
      workers: 1,
    },
    // 모바일 테스트
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      // 프로젝트 내 직렬 실행
      fullyParallel: false,
      workers: 1,
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
      // 프로젝트 내 직렬 실행
      fullyParallel: false,
      workers: 1,
    },
  ],

  // 웹 서버 설정 (테스트 실행 전 앱 시작)
  webServer: {
    command: 'cd ../game-notification-assistant && pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2분 타임아웃
  },

  // 출력 디렉토리
  outputDir: 'test-results/',

  // 타임아웃 설정
  timeout: 30 * 1000, // 30초
  expect: {
    timeout: 5000, // 5초
  },
});
