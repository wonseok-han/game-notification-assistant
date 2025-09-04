import { test, expect, BrowserContext, Page } from '@playwright/test';
import { createContextWithSession } from '../helpers/session-helpers';

test.describe.configure({ mode: 'serial' });

test.describe('05 - 알림 편집', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    // 세션이 저장된 컨텍스트로 새 페이지 생성
    const projectName = test.info().project.name;
    context = await createContextWithSession(browser, projectName);
    page = await context.newPage();
  });

  test('알림 편집 모달을 통한 수정', async () => {
    await page.goto('/dashboard');

    // ===== 알림 목록이 로드될 때까지 대기 =====
    await page.waitForSelector(
      'table[data-testid="notifications-table"] tbody tr',
      {
        timeout: 10000,
      }
    );

    // ===== 알림 행이 있는지 확인 =====
    const notificationRows = page.locator(
      'table[data-testid="notifications-table"] tbody tr'
    );

    // ===== 첫 번째 알림 행 클릭 =====
    const notificationRow = notificationRows.first();
    await expect(notificationRow).toBeVisible();

    // 행 클릭
    await notificationRow.click();

    // ===== 편집 모달이 열렸는지 확인 =====
    await page.waitForTimeout(3000); // 모달 로딩 대기

    // 모달이 열렸는지 확인 (modal-root 내부에서 찾기)
    await expect(
      page.locator('#modal-root h2:has-text("알림 수정")')
    ).toBeVisible();

    // ===== 기존 데이터 확인 =====
    const titleInput = page.locator('input[id="edit-title"]');
    const descriptionInput = page.locator('textarea[id="edit-description"]');

    await expect(titleInput).toBeVisible();
    await expect(descriptionInput).toBeVisible();

    // ===== 데이터 수정 =====
    await titleInput.clear();
    await titleInput.fill('수정된 E2E 테스트 알림');

    await descriptionInput.clear();
    await descriptionInput.fill('수정된 E2E 시나리오 테스트용 알림입니다');

    // ===== 활성 상태 토글 (선택사항) =====
    const activeSwitch = page
      .locator('#modal-root button.inline-flex.h-6.w-11')
      .first();
    await expect(activeSwitch).toBeVisible();
    await activeSwitch.click();
    await page.waitForTimeout(500);

    // ===== 저장 버튼 클릭 =====
    const saveButton = page.locator('#modal-root button:has-text("저장")');
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // ===== 성공 메시지 확인 =====
    await expect(page.locator('text=알림이 수정되었습니다')).toBeVisible({
      timeout: 10000,
    });

    // ===== 모달이 닫혔는지 확인 =====
    await expect(
      page.locator('#modal-root h2:has-text("알림 수정")')
    ).not.toBeVisible();

    // ===== 수정된 데이터가 목록에 반영되었는지 확인 =====
    await expect(
      page.locator(
        'table[data-testid="notifications-table"] tbody tr:has-text("수정된 E2E 테스트 알림")'
      )
    ).toBeVisible();
  });

  test('편집 모달 취소', async () => {
    await page.goto('/dashboard');

    // ===== 알림 행 클릭하여 편집 모달 열기 =====
    const notificationRow = page
      .locator('table[data-testid="notifications-table"] tbody tr')
      .first();
    await expect(notificationRow).toBeVisible();

    await notificationRow.click();

    // ===== 편집 모달이 열렸는지 확인 =====
    await page.waitForTimeout(2000);
    await expect(
      page.locator('#modal-root h2:has-text("알림 수정")')
    ).toBeVisible();

    // ===== 데이터 수정 =====
    const titleInput = page.locator('#modal-root input[id="edit-title"]');
    await titleInput.clear();
    await titleInput.fill('취소 테스트용 제목');

    // ===== 취소 버튼 클릭 =====
    const cancelButton = page.locator('#modal-root button:has-text("취소")');
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // ===== 모달이 닫혔는지 확인 =====
    await expect(
      page.locator('#modal-root h2:has-text("알림 수정")')
    ).not.toBeVisible();

    // ===== 원래 데이터가 유지되었는지 확인 =====
    await expect(
      page.locator(
        'table[data-testid="notifications-table"] tbody tr:has-text("취소 테스트용 제목")'
      )
    ).not.toBeVisible();
  });

  test('편집 모달 ESC 키로 닫기', async () => {
    await page.goto('/dashboard');

    // ===== 알림 행 클릭하여 편집 모달 열기 =====
    const notificationRow = page
      .locator('table[data-testid="notifications-table"] tbody tr')
      .first();
    await expect(notificationRow).toBeVisible();

    await notificationRow.click();

    // ===== 편집 모달이 열렸는지 확인 =====
    await page.waitForTimeout(2000);
    await expect(
      page.locator('#modal-root h2:has-text("알림 수정")')
    ).toBeVisible();

    // ===== ESC 키로 모달 닫기 =====
    await page.keyboard.press('Escape');

    // ===== 모달이 닫혔는지 확인 =====
    await expect(
      page.locator('#modal-root h2:has-text("알림 수정")')
    ).not.toBeVisible();
  });
});
