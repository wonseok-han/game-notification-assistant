import fs from 'fs';
import path from 'path';
import { DEFAULT_TARGETS_CONFIG } from './constant';
import { AutoIndexConfig, ParsedCliArgs, TargetConfig } from './types';
import {
  analyzeFileExports,
  getConfig,
  parseBoolean,
  parseCommaSeparated,
  printHelp,
  transformFileName,
  setLoggingConfig,
  error,
  log,
  info,
} from './utils';

/**
 * CLI 인자 파싱 유틸리티
 * @param args - 명령행 인자 배열
 * @returns 파싱된 CLI 인자 객체
 */
export function parseCliArgs(args: string[]): ParsedCliArgs {
  const overrides: Partial<TargetConfig> = {};
  let isWatch = false;
  let isHelp = false;
  let hasConfigOptions = false; // 설정 관련 옵션이 있는지 확인
  let logOverride: boolean | undefined;
  let debugOverride: boolean | undefined;

  for (const arg of args) {
    if (arg === '--watch') {
      isWatch = true;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      isHelp = true;
      continue;
    }
    if (arg.startsWith('--')) {
      const [rawKey, rawVal] = arg.replace(/^--/, '').split('=');
      const key = rawKey?.trim();
      const val = rawVal === undefined ? true : rawVal.trim();

      // 설정 관련 옵션이 있는지 확인
      if (
        [
          'paths',
          'outputFile',
          'fileExtensions',
          'exportStyle',
          'namingConvention',
          'fromWithExtension',
          'excludes',
          'log',
          'debug',
        ].includes(key || '')
      ) {
        hasConfigOptions = true;
      }

      switch (key) {
        case 'paths': {
          const paths =
            typeof val === 'string' ? parseCommaSeparated(val) : undefined;
          if (paths) overrides.paths = paths;
          break;
        }
        case 'outputFile': {
          if (typeof val === 'string' && val) overrides.outputFile = val;
          break;
        }
        case 'fileExtensions': {
          const exts =
            typeof val === 'string' ? parseCommaSeparated(val) : undefined;
          if (exts)
            overrides.fileExtensions = exts.map((ext) =>
              ext.startsWith('.') ? ext : `.${ext}`
            );
          break;
        }
        case 'excludes': {
          const excludes =
            typeof val === 'string' ? parseCommaSeparated(val) : undefined;
          if (excludes) overrides.excludes = excludes;
          break;
        }
        case 'exportStyle': {
          if (typeof val === 'string' && val)
            overrides.exportStyle = val as TargetConfig['exportStyle'];
          break;
        }
        case 'namingConvention': {
          if (typeof val === 'string' && val)
            overrides.namingConvention =
              val as TargetConfig['namingConvention'];
          break;
        }
        case 'fromWithExtension': {
          const boolVal = parseBoolean(val);
          if (typeof boolVal === 'boolean')
            overrides.fromWithExtension = boolVal;
          break;
        }
        case 'log': {
          const boolVal = parseBoolean(val);
          if (typeof boolVal === 'boolean') {
            logOverride = boolVal;
          }
          break;
        }
        case 'debug': {
          const boolVal = parseBoolean(val);
          if (typeof boolVal === 'boolean') {
            debugOverride = boolVal;
          }
          break;
        }
        default: {
          printHelp();
          process.exit(1);
        }
      }
    }
  }

  // 모드 결정 - 설정 파일 존재 여부 확인
  let mode: ParsedCliArgs['mode'];

  // 설정 파일을 먼저 확인
  const config = getConfig();
  const hasPackageConfig =
    config?.targets &&
    config.targets.length > 0 &&
    config.targets[0]?.paths &&
    config.targets[0]?.paths.length > 0;

  // paths 옵션이 있는지 확인
  const hasPaths = overrides.paths && overrides.paths.length > 0;

  if (hasPackageConfig && hasPaths && hasConfigOptions) {
    mode = 'hybrid'; // CLI 설정 + 설정 파일 + 경로
  } else if (!hasPackageConfig && hasPaths) {
    mode = 'cli-only'; // CLI 설정만
  } else if (hasPackageConfig) {
    mode = 'config-based'; // 설정 파일 기반
  } else {
    mode = 'cli-only'; // CLI 설정만, 기본값
  }

  return { mode, overrides, isWatch, isHelp, logOverride, debugOverride };
}

/**
 * 경로가 glob 패턴과 일치하는지 확인합니다
 * @param relativePath - 확인할 상대 경로
 * @param watchPath - glob 패턴 경로
 * @returns 패턴 매칭 여부
 */
function isPathMatchingPattern(
  relativePath: string,
  watchPath: string
): boolean {
  if (!watchPath.includes('**')) {
    // 일반 경로 매칭
    return relativePath === watchPath;
  }

  // **로 끝나는 패턴 (예: src/components/**)
  if (watchPath.endsWith('**')) {
    const basePath = watchPath.replace(/\/?\*\*$/, '');
    return relativePath.startsWith(basePath);
  }

  // 특정 폴더로 끝나는 패턴 (예: src/entities/**/ui)
  const parts = watchPath.split('**');
  if (parts.length === 2) {
    const basePath = parts[0];
    const targetFolder = parts[1];

    if (basePath && targetFolder && relativePath.startsWith(basePath)) {
      return relativePath.endsWith(targetFolder);
    }
  }

  return false;
}

/**
 * 경로별 설정을 찾습니다
 * @param folderPath - 설정을 찾을 폴더 경로 (선택사항)
 * @param config - autoIndex 설정 객체
 * @param cliOverrides - CLI에서 전달된 설정 오버라이드 (선택사항)
 * @returns 해당 경로에 적용할 TargetConfig 설정
 */
export function findTargetConfig(
  folderPath: string | undefined,
  config: AutoIndexConfig,
  cliOverrides?: Partial<TargetConfig>
): TargetConfig {
  let targetConfig: TargetConfig | undefined;

  log(`🔍 findTargetConfig 호출: folderPath=${folderPath}`);

  // targets 설정이 있는지 확인
  if (config?.targets && Array.isArray(config.targets)) {
    if (folderPath) {
      // folderPath가 있는 경우: 경로 매칭
      const relativePath = path.relative(process.cwd(), folderPath);
      log(`🔍 상대 경로: ${relativePath}`);

      for (const target of config.targets) {
        log(`🔍 target 검사:`, {
          paths: target.paths,
          exportStyle: target.exportStyle,
        });
        if (target.paths && Array.isArray(target.paths)) {
          for (const watchPath of target.paths) {
            log(`🔍 watchPath 검사: ${watchPath}`);
            // glob 패턴 매칭 개선
            if (watchPath.includes('**')) {
              const parts = watchPath.split('**');
              log(`🔍 glob 패턴 분할:`, parts);

              // src/components/** 패턴 처리
              if (watchPath.endsWith('**')) {
                const basePath = watchPath
                  .replace(/\*\*$/, '')
                  .replace(/\/$/, '');
                log(
                  `🔍 **로 끝나는 패턴: basePath=${basePath}, relativePath=${relativePath}`
                );
                if (
                  relativePath === basePath ||
                  relativePath.startsWith(basePath + '/')
                ) {
                  log(`🔍 **로 끝나는 패턴 매칭 성공`);
                  targetConfig = { ...DEFAULT_TARGETS_CONFIG, ...target };
                  break;
                }
              } else if (watchPath.startsWith('**/')) {
                // **/components 패턴 처리
                const targetFolder = watchPath.replace(/^\*\*\//, '');
                log(
                  `🔍 **/로 시작하는 패턴: targetFolder=${targetFolder}, relativePath=${relativePath}`
                );
                if (relativePath.includes(targetFolder)) {
                  log(`🔍 **/로 시작하는 패턴 매칭 성공`);
                  targetConfig = { ...DEFAULT_TARGETS_CONFIG, ...target };
                  break;
                }
              } else if (parts.length === 2) {
                const basePath = parts[0];
                const targetFolder = parts[1];

                if (
                  basePath !== undefined &&
                  targetFolder !== undefined &&
                  relativePath.startsWith(basePath) &&
                  relativePath.includes(targetFolder)
                ) {
                  log(`🔍 2개 부분 패턴 매칭 성공`);
                  // 해당 target에 기본값 병합
                  targetConfig = { ...DEFAULT_TARGETS_CONFIG, ...target };
                  break;
                }
              } else if (parts.length === 1) {
                // **/components/** 패턴 또는 components/** 패턴
                const basePath = parts[0];
                log(
                  `🔍 1개 부분 패턴 검사: basePath=${basePath}, relativePath=${relativePath}`
                );
                if (
                  basePath !== undefined &&
                  (relativePath === basePath ||
                    relativePath.startsWith(basePath + '/'))
                ) {
                  log(`🔍 1개 부분 패턴 매칭 성공`);
                  targetConfig = { ...DEFAULT_TARGETS_CONFIG, ...target };
                  break;
                }
              }
            } else {
              // 정확한 경로 매칭
              if (relativePath === watchPath) {
                log(`🔍 정확한 경로 매칭 성공`);
                // 해당 target에 기본값 병합
                targetConfig = { ...DEFAULT_TARGETS_CONFIG, ...target };
                break;
              }
            }
          }
          if (targetConfig) break;
        }
      }
    } else {
      // folderPath가 없는 경우: 첫 번째 설정 사용
      if (config.targets.length > 0) {
        log(`🔍 첫 번째 설정 사용`);
        targetConfig = {
          ...DEFAULT_TARGETS_CONFIG,
          ...config.targets[0],
        };
      }
    }
  }

  // 매칭되는 설정이 없으면 기본값 사용
  if (!targetConfig) {
    log(`🔍 기본값 사용`);
    targetConfig = { ...DEFAULT_TARGETS_CONFIG };
  }

  log(`🔍 최종 targetConfig:`, { exportStyle: targetConfig.exportStyle });

  // CLI 오버라이드 적용 (최우선)
  if (cliOverrides) {
    targetConfig = { ...targetConfig, ...cliOverrides };
  }

  return targetConfig;
}

/**
 * 컴포넌트 폴더를 스캔하여 index.ts 파일을 생성합니다
 * @param folderPath - 스캔할 폴더 경로 (선택사항)
 * @param cliOverrides - CLI에서 전달된 설정 오버라이드 (선택사항)
 */
function generateIndex(
  folderPath: string | undefined,
  cliOverrides?: Partial<TargetConfig>
): void {
  try {
    const config = getConfig();

    if (folderPath) {
      // glob 패턴을 실제 경로로 변환
      let actualFolderPath = folderPath;
      if (folderPath.includes('**')) {
        // ** 패턴을 제거하고 기본 경로만 사용
        actualFolderPath = folderPath.replace(/\*\*/g, '').replace(/\/$/, '');
        log(`🔍 glob 패턴 변환: ${folderPath} → ${actualFolderPath}`);
      }

      // folderPath가 있는 경우: 특정 폴더 처리
      const fullPath = path.resolve(actualFolderPath);

      if (!fs.existsSync(fullPath)) {
        error(`폴더가 존재하지 않습니다: ${actualFolderPath}`);
        return;
      }

      // 모드별 설정 처리
      if (!config) {
        error('❌ 설정 파일을 읽을 수 없습니다.');
        return;
      }

      const targetConfig = findTargetConfig(
        actualFolderPath,
        config,
        cliOverrides
      );

      // glob 패턴이 있는지 확인하고 하위 폴더까지 처리
      const hasGlobPattern = config.targets?.some((target) =>
        target.paths?.some((p) => p.includes('**'))
      );

      if (hasGlobPattern) {
        // glob 패턴이 있으면 하위 폴더까지 재귀적으로 처리
        processDirectoryRecursively(fullPath, targetConfig);
      } else {
        // 일반적인 단일 폴더 처리
        processSingleDirectory(fullPath, targetConfig);
      }
    } else {
      // folderPath가 없는 경우: 설정 파일의 targets 설정 사용
      if (!config || !config.targets || config.targets.length === 0) {
        error('❌ 설정 파일에 autoIndex 설정이 없습니다.');
        return;
      }

      log('🔍 설정 파일로 인덱스 파일 생성...');

      config.targets.forEach((target, index) => {
        if (target.paths && Array.isArray(target.paths)) {
          target.paths.forEach((watchPath) => {
            log(`📁 처리 중: ${watchPath}`);

            // glob 패턴을 실제 경로로 변환
            let actualPath = watchPath;
            if (watchPath.includes('**')) {
              // ** 패턴이 있는 경우 기본 경로만 사용
              const basePath = watchPath.split('**')[0];
              if (basePath) {
                actualPath = basePath.replace(/\/$/, '');
              }
            }

            generateIndex(actualPath, cliOverrides);
          });
        }
      });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    error('인덱스 생성 오류:', errorMessage);
  }
}

/**
 * 단일 디렉토리를 처리하여 index 파일을 생성합니다
 * @param fullPath - 처리할 디렉토리 전체 경로
 * @param targetConfig - 타겟 설정
 */
function processSingleDirectory(
  fullPath: string,
  targetConfig: TargetConfig
): void {
  const files = fs.readdirSync(fullPath);
  const componentFiles = files.filter((file: string) => {
    const filePath = path.join(fullPath, file);
    const stat = fs.statSync(filePath);

    // 디렉토리는 제외
    if (stat.isDirectory()) {
      return false;
    }

    // excludes 패턴에 맞는 파일은 제외
    if (targetConfig.excludes && targetConfig.excludes.length > 0) {
      for (const excludePattern of targetConfig.excludes) {
        if (excludePattern.startsWith('*.')) {
          // *.ext 패턴 매칭
          const ext = excludePattern.substring(1);
          if (file.endsWith(ext)) {
            return false;
          }
        } else if (excludePattern.startsWith('*')) {
          // *filename 패턴 매칭
          const suffix = excludePattern.substring(1);
          if (file.endsWith(suffix)) {
            return false;
          }
        } else if (file === excludePattern) {
          // 정확한 파일명 매칭
          return false;
        }
      }
    }

    // outputFile 자체는 제외 (무한 루프 방지)
    const outputFileName = targetConfig.outputFile || 'index.ts';
    if (file === outputFileName) {
      return false;
    }

    // 설정된 확장자와 일치하는지 확인
    const fileExt = path.extname(file);
    return targetConfig.fileExtensions.includes(fileExt);
  });

  if (componentFiles.length === 0) {
    log(`📁 ${fullPath}에 처리할 파일이 없습니다.`);
    return;
  }

  // export 문 생성
  const exportStatements: string[] = [];
  const outputFileName = targetConfig.outputFile || 'index.ts';

  componentFiles.forEach((file) => {
    const fileName = path.basename(file, path.extname(file));
    const transformedName = transformFileName(
      fileName,
      targetConfig.namingConvention
    );
    const filePath = path.join(fullPath, file);
    const fromPath = targetConfig.fromWithExtension ? file : fileName;

    exportStatements.push(
      ...generateExportStatements(
        file,
        filePath,
        fromPath,
        transformedName,
        targetConfig
      )
    );
  });

  // index.ts 파일 생성
  const indexPath = path.join(fullPath, outputFileName);

  // outputFileName에 폴더가 포함되어 있는지 확인하고 필요한 폴더 생성
  const outputDir = path.dirname(indexPath);
  if (outputDir !== fullPath && !fs.existsSync(outputDir)) {
    log(`📁 폴더 생성: ${outputDir}`);
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const indexContent = exportStatements.join('\n') + '\n';

  fs.writeFileSync(indexPath, indexContent, 'utf-8');
  log(`✅ ${indexPath} 생성 완료 (${componentFiles.length}개 파일)`);
}

/**
 * 디렉토리를 재귀적으로 처리하여 모든 하위 폴더에 index 파일을 생성합니다
 * @param fullPath - 처리할 디렉토리 전체 경로
 * @param targetConfig - 타겟 설정
 */
function processDirectoryRecursively(
  fullPath: string,
  targetConfig: TargetConfig
): void {
  const processDirectory = (dirPath: string) => {
    try {
      const files = fs.readdirSync(dirPath);

      // 하위 디렉토리 먼저 재귀 처리
      files.forEach((file: string) => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          // node_modules, .git 등 특수 폴더 제외
          if (!file.startsWith('.') && file !== 'node_modules') {
            processDirectory(filePath);
          }
        }
      });

      // 하위 폴더 처리 완료 후 현재 디렉토리에 index 파일 생성
      // 현재 디렉토리가 설정된 경로 패턴과 일치하는지 확인
      const relativePath = path.relative(process.cwd(), dirPath);
      const shouldProcessDirectory = getConfig()?.targets?.some((target) => {
        if (target.paths && Array.isArray(target.paths)) {
          return target.paths.some((watchPath) =>
            isPathMatchingPattern(relativePath, watchPath)
          );
        }
        return false;
      });

      if (shouldProcessDirectory) {
        log(`🔍 패턴 매칭 폴더 감지: ${dirPath}`);
        processDirectoryWithSubfolders(dirPath, targetConfig);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      error(`디렉토리 처리 오류 (${dirPath}):`, errorMessage);
    }
  };

  processDirectory(fullPath);
}

/**
 * 디렉토리와 하위 폴더를 함께 처리하여 index 파일을 생성합니다
 * @param fullPath - 처리할 디렉토리 전체 경로
 * @param targetConfig - 타겟 설정
 */
function processDirectoryWithSubfolders(
  fullPath: string,
  targetConfig: TargetConfig
): void {
  const files = fs.readdirSync(fullPath);

  // 파일과 폴더 분리
  const componentFiles = files.filter((file: string) => {
    const filePath = path.join(fullPath, file);
    const stat = fs.statSync(filePath);

    // 디렉토리는 제외 (별도로 처리)
    if (stat.isDirectory()) {
      return false;
    }

    // excludes 패턴에 맞는 파일은 제외
    if (targetConfig.excludes && targetConfig.excludes.length > 0) {
      for (const excludePattern of targetConfig.excludes) {
        if (excludePattern.startsWith('*.')) {
          // *.ext 패턴 매칭
          const ext = excludePattern.substring(1);
          if (file.endsWith(ext)) {
            return false;
          }
        } else if (excludePattern.startsWith('*')) {
          // *filename 패턴 매칭
          const suffix = excludePattern.substring(1);
          if (file.endsWith(suffix)) {
            return false;
          }
        } else if (file === excludePattern) {
          // 정확한 파일명 매칭
          return false;
        }
      }
    }

    // outputFile 자체는 제외 (무한 루프 방지)
    const outputFileName = targetConfig.outputFile || 'index.ts';
    if (file === outputFileName) {
      return false;
    }

    // 설정된 확장자와 일치하는지 확인
    const fileExt = path.extname(file);
    return targetConfig.fileExtensions.includes(fileExt);
  });

  // 하위 폴더 찾기 (index.ts가 있는 폴더만)
  const subfolders = files.filter((file: string) => {
    const filePath = path.join(fullPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // node_modules, .git 등 특수 폴더 제외
      if (!file.startsWith('.') && file !== 'node_modules') {
        const indexPath = path.join(
          filePath,
          targetConfig.outputFile || 'index.ts'
        );
        return fs.existsSync(indexPath);
      }
    }
    return false;
  });

  // 처리할 항목이 없으면 종료
  if (componentFiles.length === 0 && subfolders.length === 0) {
    log(`📁 ${fullPath}에 처리할 파일이나 폴더가 없습니다.`);
    return;
  }

  // 현재 디렉토리가 설정된 경로 패턴과 일치하는지 확인
  const relativePath = path.relative(process.cwd(), fullPath);
  const shouldProcessDirectory = getConfig()?.targets?.some((target) => {
    if (target.paths && Array.isArray(target.paths)) {
      return target.paths.some((watchPath) =>
        isPathMatchingPattern(relativePath, watchPath)
      );
    }
    return false;
  });

  if (!shouldProcessDirectory) {
    log(`📁 패턴 매칭 안됨, 건너뜀: ${fullPath}`);
    return;
  }

  // export 문 생성
  const exportStatements: string[] = [];
  const outputFileName = targetConfig.outputFile || 'index.ts';

  // 파일 export 문 생성
  componentFiles.forEach((file) => {
    const fileName = path.basename(file, path.extname(file));
    const transformedName = transformFileName(
      fileName,
      targetConfig.namingConvention
    );
    const filePath = path.join(fullPath, file);
    const fromPath = targetConfig.fromWithExtension ? file : fileName;

    log(`🔍 파일 처리 중: ${file} (exportStyle: ${targetConfig.exportStyle})`);

    exportStatements.push(
      ...generateExportStatements(
        file,
        filePath,
        fromPath,
        transformedName,
        targetConfig
      )
    );
  });

  // 하위 폴더 export 문 생성
  subfolders.forEach((folder) => {
    exportStatements.push(`export * from './${folder}';`);
  });

  // index.ts 파일 생성
  const indexPath = path.join(fullPath, outputFileName);

  // outputFileName에 폴더가 포함되어 있는지 확인하고 필요한 폴더 생성
  const outputDir = path.dirname(indexPath);
  if (outputDir !== fullPath && !fs.existsSync(outputDir)) {
    log(`📁 폴더 생성: ${outputDir}`);
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const indexContent = exportStatements.join('\n') + '\n';

  fs.writeFileSync(indexPath, indexContent, 'utf-8');
  log(
    `✅ ${indexPath} 생성 완료 (${componentFiles.length}개 파일, ${subfolders.length}개 폴더)`
  );
}

/**
 * exportStyle에 따라 export 문을 생성합니다
 * @param file - 파일명
 * @param filePath - 파일 전체 경로
 * @param fromPath - import 경로
 * @param transformedName - 변환된 파일명
 * @param targetConfig - 타겟 설정
 * @returns 생성된 export 문 배열
 */
function generateExportStatements(
  file: string,
  filePath: string,
  fromPath: string,
  transformedName: string,
  targetConfig: TargetConfig
): string[] {
  const exportStatements: string[] = [];

  switch (targetConfig.exportStyle) {
    case 'named':
      exportStatements.push(
        `export { default as ${transformedName} } from './${fromPath}';`
      );
      break;
    case 'default':
      exportStatements.push(`export { default } from './${fromPath}';`);
      break;
    case 'star':
      exportStatements.push(`export * from './${fromPath}';`);
      break;
    case 'star-as':
      exportStatements.push(
        `export * as ${transformedName} from './${fromPath}';`
      );
      break;
    case 'mixed':
      log(`🔍 mixed 스타일로 처리 중: ${file}`);
      // 파일 내용을 분석하여 export 문 생성
      const exportInfo = analyzeFileExports(filePath);
      info(`🔍 파일 분석 결과:`, {
        file: file,
        hasDefaultExport: exportInfo.hasDefaultExport,
        hasNamedExports: exportInfo.hasNamedExports,
        namedExports: exportInfo.namedExports,
        typeExports: exportInfo.typeExports,
        defaultExports: exportInfo.defaultExports,
      });

      // 유효한 식별자만 사용하도록 필터링
      const identifierRegex = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

      // Value exports (default + named)
      const valueExports: string[] = [];
      if (exportInfo.hasDefaultExport) {
        const defaultAliasCandidate =
          exportInfo.defaultExports[0] || transformedName;
        const defaultAlias = identifierRegex.test(defaultAliasCandidate)
          ? defaultAliasCandidate
          : transformedName;
        valueExports.push(`default as ${defaultAlias}`);
      }
      if (exportInfo.hasNamedExports && exportInfo.namedExports.length > 0) {
        const uniqueNamed = Array.from(new Set(exportInfo.namedExports)).filter(
          (name) => identifierRegex.test(name)
        );
        if (uniqueNamed.length > 0) {
          valueExports.push(...uniqueNamed);
        }
      }

      // Type-only exports
      const uniqueTypeExports = Array.from(
        new Set(exportInfo.typeExports)
      ).filter((name) => identifierRegex.test(name));

      // Value exports 생성
      if (valueExports.length > 0) {
        exportStatements.push(
          `export { ${valueExports.join(', ')} } from './${fromPath}';`
        );
      }

      // Type exports 생성 (isolatedModules 지원)
      if (uniqueTypeExports.length > 0) {
        exportStatements.push(
          `export type { ${uniqueTypeExports.join(', ')} } from './${fromPath}';`
        );
      }

      // export할 내용이 없으면 star export 사용
      if (valueExports.length === 0 && uniqueTypeExports.length === 0) {
        exportStatements.push(`export * from './${fromPath}';`);
      }
      break;
    case 'auto':
    default:
      // 파일 내용을 확인하여 default export가 있는지 확인
      const content = fs.readFileSync(filePath, 'utf-8');
      const hasDefaultExport =
        content.includes('export default') ||
        content.includes('export { default }');

      if (hasDefaultExport) {
        exportStatements.push(
          `export { default as ${transformedName} } from './${fromPath}';`
        );
      } else {
        exportStatements.push(`export * from './${fromPath}';`);
      }
      break;
  }

  return exportStatements;
}

/**
 * 파일 감시 모드를 시작합니다
 * @param folderPath - 감시할 폴더 경로 (선택사항)
 * @param overrides - CLI 오버라이드 설정
 */
export function startWatchMode(
  folderPath: string | undefined,
  overrides: Partial<TargetConfig>
): void {
  const chokidar = require('chokidar');

  if (folderPath) {
    // 특정 폴더 감시
    log(`🔍 파일 변경 감지 시작: ${folderPath}`);

    const config = getConfig();
    if (!config) {
      error('❌ 설정 파일을 읽을 수 없습니다.');
      return;
    }

    const targetConfig = findTargetConfig(folderPath, config, overrides);
    const outputFileName = targetConfig.outputFile || 'index.ts';

    const watcher = chokidar.watch(folderPath, {
      ignored: [
        /(^|[\/\\])\../, // 숨김 파일 무시
        new RegExp(`${outputFileName.replace('.', '\\.')}$`), // outputFile 무시
        /\.d\.ts$/, // 타입 정의 파일 무시
      ],
      persistent: true,
    });

    watcher.on('add', (filePath: string) => {
      const fileName = path.basename(filePath);
      if (fileName === outputFileName) return;
      log(`📝 파일 추가: ${fileName}`);
      generateIndex(folderPath, overrides);
    });

    watcher.on('unlink', (filePath: string) => {
      const fileName = path.basename(filePath);
      if (fileName === outputFileName) return;
      log(`🗑️  파일 삭제: ${fileName}`);
      generateIndex(folderPath, overrides);
    });

    watcher.on('change', (filePath: string) => {
      const fileName = path.basename(filePath);
      if (fileName === outputFileName) return;
      log(`📝 파일 변경: ${fileName}`);
      generateIndex(folderPath, overrides);
    });

    process.on('SIGINT', () => {
      watcher.close();
      process.exit(0);
    });
  } else {
    // 설정 파일의 targets 설정으로 감시
    const config = getConfig();
    if (!config || !config.targets || config.targets.length === 0) {
      error('❌ 설정 파일에 autoIndex 설정이 없습니다.');
      return;
    }

    log('🔍 설정 파일로 감시 모드 시작...');

    const watchers: any[] = [];

    config.targets.forEach((target, index) => {
      if (target.paths && Array.isArray(target.paths)) {
        target.paths.forEach((watchPath) => {
          log(`📁 감시 시작: ${watchPath}`);

          const targetConfig = findTargetConfig(watchPath, config, overrides);
          const outputFileName = targetConfig.outputFile || 'index.ts';

          // glob 패턴을 실제 경로로 변환
          let actualWatchPath = watchPath;
          if (watchPath.includes('**')) {
            const basePath = watchPath.split('**')[0];
            if (basePath) {
              actualWatchPath = basePath.replace(/\/$/, '');
              log(
                `🔍 감시용 glob 패턴 변환: ${watchPath} → ${actualWatchPath}`
              );
            }
          }

          const watcher = chokidar.watch(actualWatchPath, {
            ignored: [
              /(^|[\/\\])\../,
              new RegExp(`${outputFileName.replace('.', '\\.')}$`),
              /\.d\.ts$/,
            ],
            persistent: true,
          });

          watcher.on('add', (filePath: string) => {
            const fileName = path.basename(filePath);
            if (fileName === outputFileName) return;
            log(`📝 파일 추가: ${fileName} (${watchPath})`);

            // 파일이 변경된 디렉토리 기준으로 처리
            const fileDir = path.dirname(filePath);
            const relativePath = path.relative(process.cwd(), fileDir);

            // 패턴과 일치하는지 확인
            const shouldProcess = target.paths?.some((p) =>
              isPathMatchingPattern(relativePath, p)
            );

            if (shouldProcess) {
              generateIndex(actualWatchPath, overrides);
            }
          });

          watcher.on('unlink', (filePath: string) => {
            const fileName = path.basename(filePath);
            if (fileName === outputFileName) return;
            log(`🗑️  파일 삭제: ${fileName} (${watchPath})`);

            // 파일이 변경된 디렉토리 기준으로 처리
            const fileDir = path.dirname(filePath);
            const relativePath = path.relative(process.cwd(), fileDir);

            // 패턴과 일치하는지 확인
            const shouldProcess = target.paths?.some((p) =>
              isPathMatchingPattern(relativePath, p)
            );

            if (shouldProcess) {
              generateIndex(actualWatchPath, overrides);
            }
          });

          watcher.on('change', (filePath: string) => {
            const fileName = path.basename(filePath);
            if (fileName === outputFileName) return;
            log(`📝 파일 변경: ${fileName} (${watchPath})`);

            // 파일이 변경된 디렉토리 기준으로 처리
            const fileDir = path.dirname(filePath);
            const relativePath = path.relative(process.cwd(), fileDir);

            // 패턴과 일치하는지 확인
            const shouldProcess = target.paths?.some((p) =>
              isPathMatchingPattern(relativePath, p)
            );

            if (shouldProcess) {
              generateIndex(actualWatchPath, overrides);
            }
          });

          watchers.push(watcher);
        });
      }
    });

    // 프로세스 종료 시 모든 감시 중지
    process.on('SIGINT', () => {
      log('\n🛑 감시 모드 종료...');
      watchers.forEach((watcher) => watcher.close());
      process.exit(0);
    });
  }
}

/**
 * CLI 메인 실행 함수
 * 명령행 인자를 파싱하고 적절한 모드로 실행합니다
 */
export function runCli(): void {
  const args = process.argv.slice(2);
  const { mode, overrides, isWatch, isHelp, logOverride, debugOverride } =
    parseCliArgs(args);

  // 도움말 출력
  if (isHelp) {
    printHelp();
    return;
  }

  // 로깅 설정 적용
  if (logOverride !== undefined || debugOverride !== undefined) {
    const currentConfig = getConfig();
    const currentLog = currentConfig?.log ?? true;
    const currentDebug = currentConfig?.debug ?? false;

    const finalLog = logOverride !== undefined ? logOverride : currentLog;
    const finalDebug =
      debugOverride !== undefined ? debugOverride : currentDebug;

    setLoggingConfig(finalLog, finalDebug);
  }

  if (mode === 'hybrid') {
    // 하이브리드 모드: CLI 설정 + 설정 파일 + 경로
    if (isWatch) {
      startWatchMode(overrides.paths?.[0], overrides);
    } else {
      generateIndex(overrides.paths?.[0], overrides);
    }
  } else if (mode === 'cli-only') {
    // CLI 설정만 사용
    if (!overrides.paths || overrides.paths.length === 0) {
      error('❌ CLI 설정 모드에서는 폴더 경로를 지정해야 합니다.');
      return;
    }

    if (isWatch) {
      startWatchMode(overrides.paths[0], overrides);
    } else {
      generateIndex(overrides.paths[0], overrides);
    }
  } else {
    // config-based 모드: 설정 파일 기반
    if (isWatch) {
      startWatchMode(undefined, overrides);
    } else {
      if (overrides.paths && overrides.paths.length > 0) {
        generateIndex(overrides.paths[0], overrides);
      } else {
        generateIndex(undefined, overrides);
      }
    }
  }
}
