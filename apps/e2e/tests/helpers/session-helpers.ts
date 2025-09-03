import { Browser, BrowserContext, Page } from '@playwright/test';
import { existsSync } from 'fs';
import { mkdir, unlink } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/**
 * 현재 파일의 디렉토리 경로 (ES 모듈용)
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 세션 파일 경로 (E2E 앱 디렉토리 기준)
 */
const SESSION_PATH = join(__dirname, '..', '..', '.auth', 'user.json');

/**
 * 저장된 세션으로 브라우저 컨텍스트를 생성합니다
 * @param browser - Playwright 브라우저 인스턴스
 * @returns 브라우저 컨텍스트
 */
export async function createContextWithSession(
  browser: Browser
): Promise<BrowserContext> {
  console.log(`세션 파일 경로: ${SESSION_PATH}`);
  console.log(`세션 파일 존재 여부: ${existsSync(SESSION_PATH)}`);

  if (existsSync(SESSION_PATH)) {
    console.log('저장된 세션을 로드합니다.');
    return await browser.newContext({ storageState: SESSION_PATH });
  } else {
    console.log('세션 파일이 없습니다. 새 컨텍스트를 생성합니다.');
    return await browser.newContext();
  }
}

/**
 * 세션 파일이 존재하는지 확인합니다
 * @returns 세션 파일 존재 여부
 */
export function hasStoredSession(): boolean {
  return existsSync(SESSION_PATH);
}

/**
 * 세션 파일 경로를 반환합니다
 * @returns 세션 파일 경로
 */
export function getSessionPath(): string {
  return SESSION_PATH;
}

/**
 * 현재 페이지의 세션을 저장합니다
 * @param page - Playwright 페이지 인스턴스
 * @param description - 세션 저장 설명 (로그용)
 */
export async function saveSession(
  page: Page,
  description: string = '세션'
): Promise<void> {
  try {
    // .auth 디렉토리 생성
    const authDir = join(SESSION_PATH, '..');
    await mkdir(authDir, { recursive: true });

    // 세션 저장
    await page.context().storageState({ path: SESSION_PATH });

    console.log(`${description} 저장 완료: .auth/user.json`);
    console.log('현재 URL:', page.url());
    console.log('페이지 제목:', await page.title());
  } catch (error) {
    console.error(`${description} 저장 실패:`, error);
    throw error;
  }
}

/**
 * 저장된 세션 파일을 삭제합니다
 * @param description - 세션 삭제 설명 (로그용)
 */
export async function clearSession(
  description: string = '세션'
): Promise<void> {
  try {
    if (existsSync(SESSION_PATH)) {
      await unlink(SESSION_PATH);
      console.log(`${description} 삭제 완료: .auth/user.json`);
    } else {
      console.log(`${description} 파일이 존재하지 않습니다.`);
    }
  } catch (error) {
    console.error(`${description} 삭제 실패:`, error);
    throw error;
  }
}
