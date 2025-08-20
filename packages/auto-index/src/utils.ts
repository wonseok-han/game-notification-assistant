import fs from 'fs';
import path from 'path';
import { DEFAULT_CONFIG } from './constant';
import { AutoIndexConfig } from './types';

// 로깅 유틸리티
let logEnabled = true;
let debugEnabled = false;

export function setLoggingConfig(log: boolean, debug: boolean): void {
  logEnabled = log;
  debugEnabled = debug;
}

export function log(...args: any[]): void {
  if (logEnabled) {
    console.log(...args);
  }
}

export function error(...args: any[]): void {
  if (logEnabled) {
    console.error(...args);
  }
}

export function warn(...args: any[]): void {
  if (logEnabled) {
    console.warn(...args);
  }
}

export function info(...args: any[]): void {
  if (debugEnabled) {
    console.info(...args);
  }
}

/**
 * 설정 파일에서 autoIndex 설정을 읽어옵니다
 * @returns autoIndex 설정 객체 또는 undefined
 */
export function getConfig(): AutoIndexConfig | undefined {
  const configFiles = [
    '.autoindexrc',
    '.autoindexrc.json',
    'autoindex.config.js',
    'autoindex.config.mjs',
    'autoindex.config.ts',
  ];

  for (const configFile of configFiles) {
    const configPath = path.join(process.cwd(), configFile);

    if (fs.existsSync(configPath)) {
      try {
        if (
          configFile.endsWith('.js') ||
          configFile.endsWith('.mjs') ||
          configFile.endsWith('.ts')
        ) {
          // JavaScript/TypeScript 설정 파일
          const config = require(configPath);
          const fileConfig = config.default || config;

          if (fileConfig) {
            // 로깅 설정 적용
            setLoggingConfig(fileConfig.log ?? true, fileConfig.debug ?? false);
            // DEFAULT_CONFIG와 병합하여 기본값 채우기
            return mergeWithDefaults(fileConfig);
          }
        } else {
          // JSON 설정 파일
          const content = fs.readFileSync(configPath, 'utf-8');
          const fileConfig = JSON.parse(content);

          if (fileConfig) {
            // 로깅 설정 적용
            setLoggingConfig(fileConfig.log ?? true, fileConfig.debug ?? false);
            // DEFAULT_CONFIG와 병합하여 기본값 채우기
            return mergeWithDefaults(fileConfig);
          }
        }
      } catch (err) {
        error(`⚠️  설정 파일 ${configFile} 읽기 실패:`, err);
        continue;
      }
    }
  }

  // 설정 파일이 없으면 기본 로깅 설정 적용
  setLoggingConfig(true, false);
  return undefined;
}

/**
 * 설정을 DEFAULT_CONFIG와 병합하여 기본값을 채웁니다
 * @param config - 사용자 설정
 * @returns 병합된 설정
 */
function mergeWithDefaults(config: any): AutoIndexConfig {
  const merged: AutoIndexConfig = { ...DEFAULT_CONFIG };

  if (config.targets && Array.isArray(config.targets)) {
    merged.targets = config.targets.map((target: any) => ({
      ...DEFAULT_CONFIG.targets[0], // 기본 target 설정
      ...target, // 사용자 설정으로 오버라이드
    }));
  }

  return merged;
}

/**
 * 문자열을 불린 값으로 파싱하는 유틸리티
 * @param value - 파싱할 값 (문자열, 불린, undefined)
 * @returns 파싱된 불린 값 또는 undefined
 */
export function parseBoolean(
  value: string | true | undefined
): boolean | undefined {
  if (value === undefined) return undefined;
  if (value === true) return true;
  const lowered = String(value).toLowerCase();
  if (lowered === 'true') return true;
  if (lowered === 'false') return false;
  return undefined;
}

/**
 * 쉼표로 구분된 문자열을 배열로 파싱하는 함수
 * @param value - 쉼표로 구분된 문자열
 * @returns 파싱된 배열 또는 undefined
 */
export function parseCommaSeparated(
  value: string | undefined
): string[] | undefined {
  if (!value) return undefined;

  const raw = value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  if (raw.length === 0) return undefined;

  return raw;
}

/**
 * 파일명을 유효한 JavaScript 변수명으로 변환
 * @param str - 변환할 파일명 문자열
 * @returns 유효한 JavaScript 변수명
 */
export function toValidJSVariableName(str: string): string {
  let validName = str.replace(/[^a-zA-Z0-9_]/g, '');
  if (/^[0-9]/.test(validName)) {
    validName = '_' + validName;
  }
  return validName;
}

/**
 * 네이밍 규칙에 따라 파일명을 변환
 * @param name - 변환할 파일명
 * @param namingConvention - 적용할 네이밍 규칙 (camelCase, original, PascalCase)
 * @returns 변환된 파일명
 */
export function transformFileName(
  name: string,
  namingConvention: string
): string {
  // 먼저 하이픈과 언더스코어를 제거하고 camelCase로 변환
  const camelCaseName = name.replace(
    /[-_]([a-z])/g,
    (_match: string, letter: string) => letter.toUpperCase()
  );

  switch (namingConvention) {
    case 'camelCase':
      return camelCaseName.charAt(0).toLowerCase() + camelCaseName.slice(1);
    case 'original':
      return toValidJSVariableName(name);
    case 'PascalCase':
    default:
      return camelCaseName.charAt(0).toUpperCase() + camelCaseName.slice(1);
  }
}

/**
 * 파일의 export 문을 분석합니다
 * @param filePath - 분석할 파일 경로
 * @returns export 정보 객체
 */
export function analyzeFileExports(filePath: string): {
  hasDefaultExport: boolean;
  hasNamedExports: boolean;
  namedExports: string[];
  defaultExports: string[];
} {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // 주석을 제외한 실제 코드에서만 export 검색
    const allLines = content.split('\n');
    const codeLines = allLines.filter((line) => {
      const trimmedLine = line.trim();
      return (
        !trimmedLine.startsWith('//') &&
        !trimmedLine.startsWith('/*') &&
        !trimmedLine.startsWith('*')
      );
    });

    // 라인 중간의 주석도 제거
    const cleanCodeLines = codeLines.map((line) => {
      // // 주석 제거
      const commentIndex = line.indexOf('//');
      if (commentIndex !== -1) {
        return line.substring(0, commentIndex).trim();
      }
      return line;
    });

    const codeContent = cleanCodeLines.join('\n');

    // 문자열 리터럴(", ', `) 내부 내용 제거 후 분석 (주석 외 추가 오탐 방지)
    const codeWithoutStrings = codeContent
      .replace(/`(?:\\.|[\s\S])*?`/g, '')
      .replace(/"(?:\\.|[^"\\])*"/g, '')
      .replace(/'(?:\\.|[^'\\])*'/g, '');

    const hasDefaultExport = /export\s+default\s+/.test(codeWithoutStrings);

    info(`🔍 hasDefaultExport 디버깅:`, {
      hasDefaultExport,
      hasExportDefault: /export\s+default\s+/.test(codeWithoutStrings),
      hasExportBraceDefault: /export\s+\{\s*default\s*\}/.test(
        codeWithoutStrings
      ),
      codeContentSample: codeWithoutStrings.substring(0, 500), // 처음 500자만 표시
    });

    // 모든 export 타입 찾기
    const namedExports: string[] = [];
    const defaultExports: string[] = [];

    // 1. export function/const/class/interface/type/enum
    const exportPatterns = [
      /export\s+function\s+(\w+)/g,
      /export\s+const\s+(\w+)/g,
      /export\s+class\s+(\w+)/g,
      /export\s+interface\s+(\w+)/g,
      /export\s+type\s+(\w+)/g,
      /export\s+enum\s+(\w+)/g,
    ];

    exportPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(codeWithoutStrings)) !== null) {
        if (match[1] && !namedExports.includes(match[1])) {
          namedExports.push(match[1]);
        }
      }
    });

    // 2. export { a, b, c } 형태 (주석과 템플릿 리터럴 제외)
    const lines = codeWithoutStrings.split('\n');
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      // 주석 라인은 건너뛰기
      if (
        trimmedLine.startsWith('//') ||
        trimmedLine.startsWith('/*') ||
        trimmedLine.startsWith('*')
      ) {
        return;
      }

      const exportGroupPattern = /export\s+\{\s*([^}]+)\s*\}/g;
      let groupMatch;
      while ((groupMatch = exportGroupPattern.exec(trimmedLine)) !== null) {
        if (groupMatch[1]) {
          const exports = groupMatch[1].split(',').map((e) => e.trim());
          exports.forEach((exp) => {
            // default나 *가 아닌 경우만 추가
            if (
              exp &&
              !/^default\b/.test(exp) &&
              !exp.includes('*') &&
              !exp.includes(' as ')
            ) {
              const cleanExp = exp.split(' as ')[0]?.trim();
              if (cleanExp && !namedExports.includes(cleanExp)) {
                namedExports.push(cleanExp);
              }
            }
          });
        }
      }
    });

    // 3. export default const/function/class (이름을 가진 default 만 추출)
    const defaultPatterns = [
      /export\s+default\s+const\s+(\w+)/g,
      /export\s+default\s+function\s+(\w+)/g,
      /export\s+default\s+class\s+(\w+)/g,
    ];

    defaultPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(codeWithoutStrings)) !== null) {
        if (match[1] && !defaultExports.includes(match[1])) {
          defaultExports.push(match[1]);
        }
      }
    });

    info(`🔍 analyzeFileExports 디버깅:`, {
      filePath,
      contentLength: content.length,
      namedExports,
      defaultExports,
    });

    const hasNamedExports = namedExports.length > 0;

    info(`📊 최종 결과:`, {
      hasDefaultExport,
      hasNamedExports,
      namedExports,
      defaultExports,
    });

    return {
      hasDefaultExport,
      hasNamedExports,
      namedExports,
      defaultExports,
    };
  } catch (err) {
    error(`⚠️  파일 분석 실패: ${filePath}`, err);
    return {
      hasDefaultExport: false,
      hasNamedExports: false,
      namedExports: [],
      defaultExports: [],
    };
  }
}

/**
 * 도움말 메시지를 출력합니다.
 */
export function printHelp(): void {
  console.log(`
auto-index - 폴더를 자동으로 스캔하여 index.ts 파일을 생성하는 도구

사용법:
  auto-index --paths=<경로1,경로2> [옵션들]

필수 옵션:
  --paths=<경로1,경로2>    처리할 폴더 경로 (쉼표로 구분하여 여러 경로 지정 가능)

일반 옵션:
  --outputFile=<파일명>     생성할 index.ts 파일의 이름 (기본값: index.ts)
  --fileExtensions=<확장자> 감시할 파일 확장자 (예: .tsx,.ts)
  --excludes=<패턴1,패턴2>  제외할 파일 패턴 (예: *.d.ts,*.png)
  --exportStyle=<스타일>    생성할 export 스타일 (default, named, star, star-as, mixed, auto)
  --namingConvention=<규칙> 파일명 변환 규칙 (camelCase, original, PascalCase)
  --fromWithExtension=<true|false> 파일 경로에 확장자 포함 여부 (기본값: false)

로깅 옵션:
  --log=<true|false>       로그 출력 여부 (기본값: true)

모드 옵션:
  --watch                  감시 모드 활성화
  -h, --help              도움말 출력

예시:
  auto-index --paths=src/components
  auto-index --paths=src/components --watch --exportStyle=named
  auto-index --paths=src/components --log=false --debug=true
  auto-index --watch
`);
}
