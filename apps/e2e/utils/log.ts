import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

// ANSI 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
};

/**
 * 색상 적용 함수
 * @param text 색상을 적용할 텍스트
 * @param color 색상 키
 * @returns 색상이 적용된 텍스트
 */
export const colorize = (text: string, color: keyof typeof colors): string => {
  return `${colors[color]}${text}${colors.reset}`;
};

/**
 * 로그 저장 함수
 * @param logs 로그 배열
 * @param message 로그 메시지
 */
export const logQueue = (logs: string[], message: string) => {
  logs.push(message);
};

/**
 * 로그를 파일로 저장
 * @param logs 로그 배열
 * @param filename 파일 이름
 */
export const saveLog = (logs: string[], filename: string) => {
  try {
    const logDir = join(process.cwd(), 'test-results');
    mkdirSync(logDir, { recursive: true });
    writeFileSync(join(logDir, filename), logs.join('\n'));
  } catch (error) {
    console.error('로그 파일 저장 실패:', error);
  }
};

/**
 * 로그 파일에서 setup/teardown 로그 읽기
 * @param filename 파일 이름
 * @returns 로그 배열
 */
export const readLogFile = (filename: string): string[] => {
  const logPath = join(process.cwd(), 'test-results', filename);
  if (existsSync(logPath)) {
    try {
      const content = readFileSync(logPath, 'utf-8');
      return content.split('\n').filter((line) => line.trim());
    } catch (error) {
      return [];
    }
  }
  return [];
};
