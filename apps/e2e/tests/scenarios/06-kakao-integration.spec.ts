import { test, expect, BrowserContext, Page } from '@playwright/test';
import { createContextWithSession } from '@/helpers/session-helpers';

test.describe.configure({ mode: 'serial' });

test.describe('06 - 카카오톡 연동', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    context = await createContextWithSession(browser);
    page = await context.newPage();
  });

  test('카카오 연동 UI 확인', async () => {
    await page.goto('/dashboard');

    // 연동 상태 확인
    await expect(
      page.locator('h3', { hasText: '카카오톡 연결이 필요합니다' })
    ).toBeVisible();

    const kakaoConnectionButton = page.locator(
      'button:has-text("카카오톡으로 연결하기")'
    );
    await expect(kakaoConnectionButton).toBeVisible();

    // 연동 버튼 클릭 (팝업으로 카카오 OAuth 열림)
    const [popup] = await Promise.all([
      page.waitForEvent('popup'), // 팝업 열림 대기
      kakaoConnectionButton.click(), // 버튼 클릭
    ]);

    // 팝업이 카카오 OAuth 페이지로 이동하는지 확인
    await expect(popup).toHaveURL(/kauth\.kakao\.com/);

    // 팝업 닫기 (실제 로그인은 하지 않음)
    await popup.close();
  });

  test('카카오 API 연동 테스트 (Mock)', async () => {
    // 카카오 API 호출을 Mock으로 처리
    await page.route('**/api/kakao/**', async (route) => {
      const url = route.request().url();

      if (url.includes('/status')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: '카카오 연결 정보를 찾을 수 없습니다.',
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/dashboard');

    // Mock 연동 버튼 클릭 (팝업으로 열림)
    const [popup] = await Promise.all([
      page.waitForEvent('popup'), // 팝업 열림 대기
      page.locator('button:has-text("카카오톡으로 연결하기")').click(), // 버튼 클릭
    ]);

    // 팝업이 카카오 OAuth 페이지로 이동하는지 확인
    await expect(popup).toHaveURL(/kauth\.kakao\.com/);

    // Mock 응답을 시뮬레이션하기 위해 팝업에서 인증 완료 시뮬레이션
    // (실제로는 카카오에서 콜백을 호출하지만, Mock에서는 직접 시뮬레이션)
    await popup.close();

    await page.route('**/api/kakao/**', async (route) => {
      const url = route.request().url();

      if (url.includes('/status')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: '토큰이 아직 유효합니다.',
            data: {
              accessToken: 'mock-kakao-token-12345',
              expiresAt: '2025-09-03T10:00:00.000Z',
              isRefreshed: false,
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // 연동 상태 변경 확인
    await expect(
      page.locator(
        'p:has-text("카카오톡 알림이 활성화되어 있습니다. 게임 알림을 설정하면 지정된 시간에 카카오톡으로 알림을 받을 수 있습니다.")'
      )
    ).toBeVisible();
  });

  test('카카오 API 네트워크 오류 처리 - 팝업이 열리지 않음', async () => {
    // 카카오 API 네트워크 오류 Mock
    await page.route('**/api/kakao/**', async (route) => {
      await route.abort('failed'); // 네트워크 오류 시뮬레이션
    });

    await page.goto('/dashboard');

    // 연동 버튼 클릭 (네트워크 오류로 인해 팝업이 열리지 않음)
    // 팝업이 열리지 않는 것을 확인하기 위해 타임아웃을 짧게 설정
    try {
      const [popup] = await Promise.all([
        page.waitForEvent('popup', { timeout: 2000 }), // 2초 타임아웃
        page.click('button:has-text("카카오톡으로 연결하기")'),
      ]);

      // 만약 팝업이 열렸다면 테스트 실패
      await popup.close();
      throw new Error('팝업이 열렸지만 네트워크 오류로 인해 열리지 않아야 함');
    } catch (error) {
      // 팝업이 열리지 않는 것이 정상
      if ((error as Error).message.includes('팝업이 열렸지만')) {
        throw error;
      }
      // 타임아웃 에러는 예상된 동작
    }

    // 네트워크 오류 후에도 UI가 그대로 유지되는지 확인
    await expect(
      page.locator('button:has-text("카카오톡으로 연결하기")')
    ).toBeVisible();

    // 연동 상태가 변경되지 않았는지 확인
    await expect(
      page.locator('h3', { hasText: '카카오톡 연결이 필요합니다' })
    ).toBeVisible();
  });
});
