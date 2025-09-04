import { test, expect, BrowserContext, Page } from '@playwright/test';
import { createContextWithSession } from '../helpers/session-helpers';

test.describe.configure({ mode: 'serial' });

test.describe('03 - 알림 생성', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    // 세션이 저장된 컨텍스트로 새 페이지 생성
    const projectName = test.info().project.name;
    context = await createContextWithSession(browser, projectName);
    page = await context.newPage();
  });

  /**
   * 테스트용 이미지 파일을 업로드하는 헬퍼 함수
   */
  async function uploadTestImage() {
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );

    await page.setInputFiles('input[type="file"]', {
      name: 'test-game.png',
      mimeType: 'image/png',
      buffer: testImageBuffer,
    });
  }

  test('필수 필드 검증 테스트', async () => {
    await page.goto('/dashboard');

    // ===== 초기 상태: 버튼이 비활성화되어 있는지 확인 =====
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toHaveCSS('cursor', 'not-allowed');

    // ===== 게임 이름만 입력: 여전히 비활성화 =====
    await page.fill('input[id="gameName"]', 'E2E 테스트 게임');
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toHaveCSS('cursor', 'not-allowed');

    // ===== 이미지 업로드: 여전히 비활성화 (시간이 비활성화되어 있음) =====
    await uploadTestImage();
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toHaveCSS('cursor', 'not-allowed');

    // ===== 알림 시간 체크박스만 찾기 (이미지 시간 추출 체크박스 제외) =====
    const timeCheckboxes = page.locator(
      'input[type="checkbox"][aria-label="알림 시간 활성화 여부"]'
    );
    const timeCheckboxCount = await timeCheckboxes.count();

    // 모든 알림 시간을 비활성화
    for (let i = 0; i < timeCheckboxCount; i++) {
      const checkbox = timeCheckboxes.nth(i);
      if (await checkbox.isChecked()) {
        await checkbox.click();
      }
    }

    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toHaveCSS('cursor', 'not-allowed');

    // ===== 알림 시간 활성화: 버튼이 활성화됨 =====
    const firstTimeCheckbox = timeCheckboxes.first();
    await firstTimeCheckbox.click();
    await expect(submitButton).toBeEnabled();
    await expect(submitButton).toHaveCSS('cursor', 'pointer');

    // ===== 이미지 제거: 다시 비활성화됨 =====
    const removeImageButton = page.locator('button:has-text("×")');
    await removeImageButton.click();
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toHaveCSS('cursor', 'not-allowed');
  });

  test('1개의 시간 설정 후 알림 생성', async () => {
    await page.goto('/dashboard');

    // 알림 생성 폼이 표시되는지 확인
    await expect(page.locator('h2:has-text("게임 알림 생성")')).toBeVisible();

    // ===== 게임 정보 입력 =====
    await page.fill('input[id="gameName"]', 'E2E 테스트 게임');

    // ===== 알림 정보 입력 =====
    await page.fill('input[id="title"]', 'E2E 테스트 알림');
    await page.fill(
      'textarea[id="description"]',
      'E2E 시나리오 테스트용 알림입니다'
    );

    // ===== 시간 설정 =====
    // 기본 시간이 설정되어 있는지 확인
    const timeInput = page.locator('input[type="datetime-local"]').first();
    await expect(timeInput).toBeVisible();

    // 시간을 1시간 후로 설정
    const futureTime = new Date();
    futureTime.setHours(futureTime.getHours() + 1);
    const timeString = futureTime.toISOString().slice(0, 16);
    await timeInput.fill(timeString);

    // ===== 이미지 업로드 =====
    await uploadTestImage();

    // 이미지 미리보기가 표시되는지 확인
    await expect(page.locator('img[alt="게임 이미지 미리보기"]')).toBeVisible();

    // ===== 알림 생성 =====
    await page.click('button[type="submit"]');

    // 성공 메시지 확인
    await expect(
      page.locator('text=게임 알림이 성공적으로 생성되었습니다!')
    ).toBeVisible({ timeout: 10000 });

    // 폼이 초기화되었는지 확인
    await expect(page.locator('input[id="gameName"]')).toHaveValue('');
    await expect(page.locator('input[id="title"]')).toHaveValue('');
    await expect(page.locator('textarea[id="description"]')).toHaveValue('');
  });

  test('여러 개의 시간 설정 후 알림 생성', async () => {
    await page.goto('/dashboard');

    // ===== 기본 알림 생성 준비 =====
    await uploadTestImage();

    // 필수 필드들 입력
    await page.fill('input[id="title"]', '테스트 게임 알림');
    await page.fill('input[id="gameName"]', '테스트 게임');
    await page.fill('textarea[id="description"]', '테스트용 게임 알림입니다.');

    // 첫 번째 알림 시간은 기본적으로 활성화되어 있음 (체크박스 클릭 불필요)

    // 첫 번째 시간 설정 (내일 오후 2시)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    const timeString = tomorrow.toISOString().slice(0, 16);
    await page.locator('input[type="datetime-local"]').first().fill(timeString);

    // ===== 두 번째 알림 시간 추가 =====
    await page.click('button:has-text("➕ 시간 추가")');

    // 두 번째 시간도 기본적으로 활성화되어 있음 (체크박스 클릭 불필요)

    // 두 번째 시간 설정 (모레 오전 10시)
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    dayAfterTomorrow.setHours(10, 0, 0, 0);
    const secondTimeString = dayAfterTomorrow.toISOString().slice(0, 16);
    await page
      .locator('input[type="datetime-local"]')
      .nth(1)
      .fill(secondTimeString);

    // ===== 폼 제출 가능 상태 확인 =====
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
    await expect(submitButton).toHaveCSS('cursor', 'pointer');

    // ===== 알림 생성 완료 =====
    await submitButton.click();

    await expect(page).toHaveURL(/.*\/dashboard/);

    // 생성된 알림이 목록에 표시되는지 확인
    await expect(page.locator('text=테스트 게임 알림')).toBeVisible();
  });

  test('폼 초기화', async () => {
    await page.goto('/dashboard');

    // 폼에 데이터 입력
    await page.fill('input[id="gameName"]', 'E2E 테스트 게임');
    await page.fill('input[id="title"]', 'E2E 테스트 알림');
    await page.fill(
      'textarea[id="description"]',
      'E2E 시나리오 테스트용 알림입니다'
    );

    // 이미지 업로드
    await uploadTestImage();

    // 폼 초기화 버튼 클릭
    await page.click('button[title="폼 초기화"]');

    // 모든 필드가 초기화되었는지 확인
    await expect(page.locator('input[id="gameName"]')).toHaveValue('');
    await expect(page.locator('input[id="title"]')).toHaveValue('');
    await expect(page.locator('textarea[id="description"]')).toHaveValue('');

    // 이미지 미리보기가 사라졌는지 확인
    await expect(
      page.locator('img[alt="게임 이미지 미리보기"]')
    ).not.toBeVisible();

    // 폼 초기화 후 버튼이 비활성화되었는지 확인
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toHaveCSS('cursor', 'not-allowed');
  });
});
