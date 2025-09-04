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
 * 프로젝트별 세션 파일 경로 생성
 * @param projectName - Playwright 프로젝트명 (예: 'chromium', 'firefox')
 * @returns 세션 파일 경로
 */
function getSessionPath(projectName: string): string {
  return join(__dirname, '..', '..', '.storage', `${projectName}-state.json`);
}

/**
 * 저장된 세션으로 브라우저 컨텍스트를 생성합니다
 * @param browser - Playwright 브라우저 인스턴스
 * @param projectName - Playwright 프로젝트명
 * @returns 브라우저 컨텍스트
 */
export async function createContextWithSession(
  browser: Browser,
  projectName: string
): Promise<BrowserContext> {
  const sessionPath = getSessionPath(projectName);
  console.log(`[${projectName}] 세션 파일 경로: ${sessionPath}`);
  console.log(
    `[${projectName}] 세션 파일 존재 여부: ${existsSync(sessionPath)}`
  );

  if (existsSync(sessionPath)) {
    console.log(`[${projectName}] 저장된 세션을 로드합니다.`);
    return await browser.newContext({ storageState: sessionPath });
  } else {
    console.log(
      `[${projectName}] 세션 파일이 없습니다. 새 컨텍스트를 생성합니다.`
    );
    return await browser.newContext();
  }
}

/**
 * 세션 파일이 존재하는지 확인합니다
 * @param projectName - Playwright 프로젝트명
 * @returns 세션 파일 존재 여부
 */
export function hasStoredSession(projectName: string): boolean {
  const sessionPath = getSessionPath(projectName);
  return existsSync(sessionPath);
}

/**
 * 세션 파일 경로를 반환합니다
 * @param projectName - Playwright 프로젝트명
 * @returns 세션 파일 경로
 */
export function getSessionFilePath(projectName: string): string {
  return getSessionPath(projectName);
}

/**
 * 현재 페이지의 세션을 저장합니다
 * @param page - Playwright 페이지 인스턴스
 * @param projectName - Playwright 프로젝트명
 * @param description - 세션 저장 설명 (로그용)
 */
export async function saveSession(
  page: Page,
  projectName: string,
  description: string = '세션'
): Promise<void> {
  try {
    const sessionPath = getSessionPath(projectName);

    // .storage 디렉토리 생성
    const storageDir = join(sessionPath, '..');
    await mkdir(storageDir, { recursive: true });

    // 세션 저장
    await page.context().storageState({ path: sessionPath });

    console.log(`[${projectName}] ${description} 저장 완료: ${sessionPath}`);
    console.log(`[${projectName}] 현재 URL:`, page.url());
    console.log(`[${projectName}] 페이지 제목:`, await page.title());
  } catch (error) {
    console.error(`${description} 저장 실패:`, error);
    throw error;
  }
}

/**
 * 저장된 세션 파일을 삭제합니다
 * @param projectName - Playwright 프로젝트명
 * @param description - 세션 삭제 설명 (로그용)
 */
export async function clearSession(
  projectName: string,
  description: string = '세션'
): Promise<void> {
  try {
    const sessionPath = getSessionPath(projectName);
    if (existsSync(sessionPath)) {
      await unlink(sessionPath);
      console.log(`[${projectName}] ${description} 삭제 완료: ${sessionPath}`);
    } else {
      console.log(`[${projectName}] ${description} 파일이 존재하지 않습니다.`);
    }
  } catch (error) {
    console.error(`[${projectName}] ${description} 삭제 실패:`, error);
    throw error;
  }
}
