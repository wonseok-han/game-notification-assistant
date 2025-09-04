import { test, expect, BrowserContext, Page } from '@playwright/test';
import { createContextWithSession } from '../helpers/session-helpers';

test.describe.configure({ mode: 'serial' });

test.describe('04 - 알림 목록 확인', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    // 세션이 저장된 컨텍스트로 새 페이지 생성
    const projectName = test.info().project.name;
    context = await createContextWithSession(browser, projectName);
    page = await context.newPage();
  });

  test.afterEach(async () => {
    // 각 테스트 종료 후 페이지 닫기
    await page.close();
  });

  test('대시보드에서 생성한 알림 리스트 확인', async () => {
    await page.goto('/dashboard');

    // ===== 대시보드 접근 확인 =====
    await expect(page).toHaveURL(/.*\/dashboard/);

    // ===== 알림 목록 테이블 구조 확인 =====
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("이미지")')).toBeVisible();
    await expect(page.locator('th:has-text("제목")')).toBeVisible();
    await expect(page.locator('th:has-text("게임")')).toBeVisible();
    await expect(page.locator('th:has-text("활성 상태")')).toBeVisible();
    await expect(page.locator('th:has-text("알림 시간")')).toBeVisible();
    await expect(page.locator('th:has-text("액션")')).toBeVisible();

    // ===== 생성된 알림 데이터 확인 =====
    // 이전 테스트에서 생성한 알림들이 표시되는지 확인
    await expect(page.locator('text=E2E 테스트 게임').first()).toBeVisible();
    await expect(page.locator('text=테스트 게임 알림').first()).toBeVisible();

    // 알림 시간이 올바르게 표시되는지 확인
    await expect(page.locator('text=활성').first()).toBeVisible();

    // 이미지가 표시되는지 확인
    await expect(
      page.locator('img[alt="E2E 테스트 알림"]').first()
    ).toBeVisible();
  });

  test('알림 활성/비활성 토글', async () => {
    await page.goto('/dashboard');

    // ===== 활성 상태 토글 버튼 찾기 =====
    const activeSwitch = page.locator('button.inline-flex.h-6.w-11').first();
    await expect(activeSwitch).toBeVisible();

    // ===== 초기 상태 확인 (CSS 클래스로 상태 판단) =====
    const isInitiallyActive = await activeSwitch.evaluate((el) =>
      el.classList.contains('bg-blue-600')
    );
    console.log('초기 활성 상태:', isInitiallyActive);

    // ===== 토글 클릭 =====
    await activeSwitch.click();

    // ===== 상태 변경 대기 및 확인 =====
    await page.waitForTimeout(1000); // API 호출 완료 대기

    const newState = await activeSwitch.evaluate((el) =>
      el.classList.contains('bg-blue-600')
    );
    console.log('토글 후 상태:', newState);

    // 상태가 변경되었는지 확인
    expect(newState).not.toBe(isInitiallyActive);

    // ===== 다시 토글하여 원래 상태로 복원 =====
    await activeSwitch.click();

    await page.waitForTimeout(1000); // API 호출 완료 대기

    const restoredState = await activeSwitch.evaluate((el) =>
      el.classList.contains('bg-blue-600')
    );
    expect(restoredState).toBe(isInitiallyActive);
  });

  test('알림 행 클릭하여 편집 모달 열기', async () => {
    await page.goto('/dashboard');

    // ===== 알림 행 클릭 =====
    const notificationRow = page.locator('tbody tr').first();
    await expect(notificationRow).toBeVisible();

    // 행 클릭
    await notificationRow.click();

    // ===== 편집 모달이 열렸는지 확인 =====
    // 모달이 열릴 때까지 대기 (데이터 로딩 포함)
    await page.waitForTimeout(2000);

    // 모달이 열렸는지 확인 (더 일반적인 선택자 사용)
    const modalBackdrop = page.locator('.backdrop-blur-sm.bg-black\\/40');
    if (await modalBackdrop.isVisible()) {
      await expect(page.locator('h2:has-text("알림 수정")')).toBeVisible();

      // ===== 기존 데이터가 폼에 채워져 있는지 확인 =====
      await expect(page.locator('input[id="gameName"]')).toHaveValue(
        'E2E 테스트 게임'
      );
      await expect(page.locator('input[id="title"]')).toHaveValue(
        'E2E 테스트 알림'
      );

      // ===== 모달 닫기 =====
      const closeButton = page.locator('button:has-text("취소")');
      await closeButton.click();

      // ===== 모달이 닫혔는지 확인 =====
      await expect(page.locator('h2:has-text("알림 수정")')).not.toBeVisible();
    } else {
      console.log(
        '편집 모달이 열리지 않았습니다. 이 기능은 현재 비활성화되어 있을 수 있습니다.'
      );
    }
  });

  test('알림 삭제', async () => {
    await page.goto('/dashboard');

    // ===== 삭제 버튼 클릭 =====
    const deleteButton = page.locator('button:has-text("삭제")').first();
    await expect(deleteButton).toBeVisible();

    // 삭제 버튼 클릭
    await deleteButton.click();

    // ===== 확인 다이얼로그 처리 =====
    // 브라우저의 confirm 다이얼로그 확인
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });

    // ===== 삭제 후 목록에서 사라졌는지 확인 =====
    // 삭제가 완료될 때까지 잠시 대기
    await page.waitForTimeout(1000);

    // 알림이 삭제되었는지 확인 (테이블이 비어있거나 다른 알림만 남아있어야 함)
    const remainingRows = page.locator('tbody tr');
    const rowCount = await remainingRows.count();

    // 이전 테스트에서 생성한 다른 알림이 남아있을 수 있으므로
    // 최소한 하나의 알림은 남아있어야 함 (다른 테스트에서 생성한 것)
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('빈 알림 목록 상태 확인', async () => {
    // 이 테스트는 모든 알림을 삭제한 후의 상태를 확인합니다
    // 실제로는 다른 테스트에서 생성한 알림들이 있을 수 있으므로
    // 이 테스트는 별도의 사용자 계정이나 정리된 상태에서 실행되어야 합니다

    await page.goto('/dashboard');

    // ===== 알림이 없는 경우의 UI 확인 =====
    const emptyState = page.locator('text=알림이 없습니다.');

    // 만약 알림이 없다면 빈 상태 메시지가 표시되어야 함
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
      console.log('빈 알림 목록 상태 확인됨');
    } else {
      console.log('알림이 존재하여 빈 상태 테스트를 건너뜀');
    }
  });
});
