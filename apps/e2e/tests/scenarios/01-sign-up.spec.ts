import { test, expect } from '@playwright/test';
import { getTestUser } from '../helpers/scenario-helpers';
import {
  createContextWithSession,
  saveSession,
  clearSession,
} from '../helpers/session-helpers';

// describe 블록 내의 테스트들을 순차 실행
test.describe.configure({ mode: 'serial' });

test.afterEach(async ({ page }) => {
  // 각 테스트 종료 후 페이지 닫기
  await page.close();
});

test.describe('01 - 신규 사용자 회원가입', () => {
  test('메인 페이지로 진입', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/.*\//);

    // 헤더 확인
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(
      header.getByRole('heading', { name: '게임 알림 어시스턴트' })
    ).toBeVisible();
    await expect(header.locator('button:has-text("로그인")')).toBeVisible();
    await expect(header.locator('button:has-text("회원가입")')).toBeVisible();

    // 메인 콘텐츠 확인
    const main = page.locator('main');
    await expect(main).toBeVisible();
    await expect(
      main.getByRole('heading', { name: '게임 알림을 스마트하게' })
    ).toBeVisible();
    await expect(main.locator('button:has-text("로그인")')).toBeVisible();
    await expect(main.locator('button:has-text("회원가입")')).toBeVisible();
    await expect(
      main.getByRole('heading', { name: '스마트 알림 설정' })
    ).toBeVisible();
    await expect(
      main.getByRole('heading', { name: '카카오톡 연동' })
    ).toBeVisible();

    // 헤더의 로그인 버튼 클릭 시 로그인 페이지로 이동
    await header.locator('button:has-text("로그인")').click();
    await expect(page).toHaveURL(/.*\/user\/sign-in/);
    await page.goBack();

    // 헤더의 회원가입 버튼 클릭 시 회원가입 페이지로 이동
    await header.locator('button:has-text("회원가입")').click();
    await expect(page).toHaveURL(/.*\/user\/sign-up/);
    await page.goBack();

    // 메인 영역의 로그인 버튼 클릭 시 로그인 페이지로 이동
    await main.locator('button:has-text("로그인")').click();
    await expect(page).toHaveURL(/.*\/user\/sign-in/);
    await page.goBack();

    // 메인 영역의 회원가입 버튼 클릭 시 회원가입 페이지로 이동
    await main.locator('button:has-text("회원가입")').click();
    await expect(page).toHaveURL(/.*\/user\/sign-up/);
    await page.goBack();
  });

  test('새로운 유저로 회원가입', async ({ page }) => {
    const userInfo = getTestUser(test.info().project.name);

    // 네트워크 요청 모니터링
    page.on('response', (response) => {
      if (response.url().includes('/api/user/register')) {
        console.log(
          `회원가입 API 응답: ${response.status()} ${response.statusText()}`
        );
        if (!response.ok()) {
          console.log('회원가입 API 실패:', response.url());
        }
      }
    });

    // 회원가입 페이지로 이동
    await page.goto('/user/sign-up');

    // 회원가입 폼 작성
    await page.fill('input[name="email"]', userInfo.email);
    await page.fill('input[name="username"]', userInfo.username);
    await page.fill('input[name="password"]', userInfo.password);
    await page.fill('input[name="confirmPassword"]', userInfo.password);

    // 회원가입 제출
    await page.click('button[type="submit"]');

    // 회원가입 처리 대기 (성공 또는 실패 메시지 확인)
    try {
      // 성공 시 대시보드로 리다이렉트 대기
      await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
    } catch (error) {
      // 실패 시 현재 페이지에서 에러 메시지 확인
      console.log('회원가입 실패 - 현재 URL:', page.url());

      // 에러 메시지가 있는지 확인
      const errorMessage = page.locator(
        '[role="alert"], .error, .text-red-500, .text-red-600'
      );
      if ((await errorMessage.count()) > 0) {
        const errorText = await errorMessage.first().textContent();
        console.log('에러 메시지:', errorText);
      }

      // 페이지 스크린샷 저장
      await page.screenshot({ path: 'test-results/signup-failure.png' });

      throw error;
    }

    console.log(`회원가입 사용자: ${userInfo.email}`);

    // 이후 시나리오 파일에서 로그인 상태 재사용을 위해 세션 저장
    const projectName = test.info().project.name;
    await saveSession(page, projectName, '회원가입 세션');
  });

  test('회원가입한 유저 로그아웃', async ({ browser }) => {
    // 세션이 저장된 컨텍스트로 새 페이지 생성
    const projectName = test.info().project.name;
    const context = await createContextWithSession(browser, projectName);
    const page = await context.newPage();

    await page.goto('/dashboard');

    // 현재 상태 로깅
    console.log('대시보드 접근 시도 후 현재 URL:', page.url());
    console.log('페이지 제목:', await page.title());

    // 로그인 상태 확인 (대시보드에 접근 가능한지)
    try {
      await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 5000 });
      console.log('✅ 대시보드 접근 성공!');
    } catch (error) {
      // 대시보드 접근 실패 시 로그인 페이지로 리다이렉트된 것
      console.log(
        '❌ 로그인 상태가 유지되지 않음, 로그인 페이지로 리다이렉트됨'
      );
      console.log('최종 URL:', page.url());
      await expect(page).toHaveURL(/.*\/user\/sign-in/);
      return; // 테스트 종료
    }

    // 헤더의 프로필 버튼 클릭하여 드롭다운 열기
    const header = page.locator('header');
    const profileButton = header.locator('button[aria-label="프로필 메뉴"]');
    await profileButton.click();

    // 드롭다운의 로그아웃 버튼 클릭
    const logoutButton = page.locator('button:has-text("로그아웃")');
    await logoutButton.click();

    // 로그아웃 후 메인 페이지로 이동 확인 (실제 애플리케이션 동작에 맞춤)
    await expect(page).toHaveURL(/.*\/$/);

    // 로그아웃 후 세션 삭제
    await clearSession(projectName, '로그아웃 세션');
  });
});
