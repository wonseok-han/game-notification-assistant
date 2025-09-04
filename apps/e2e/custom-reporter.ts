import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
  TestStep,
} from '@playwright/test/reporter';
import { colorize, readLogFile } from '@utils/log';

interface TestStats {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  duration: number;
}

class CompactDetailedReporter implements Reporter {
  private startTime = 0;
  private testStats: TestStats = {
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0,
    duration: 0,
  };
  private testResults: Array<{
    test: string;
    status: string;
    duration: number;
    project: string;
  }> = [];
  private testBuffer: Array<{
    project: string;
    file: string;
    describe: string;
    test: string;
    status: string;
    duration: number;
    error?: string;
    steps?: string[];
    printed?: boolean;
  }> = [];
  private fileTestCounts: Map<string, number> = new Map();

  onBegin(_config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    this.testStats.total = suite.allTests().length;

    // 각 파일별 테스트 수 계산
    const allTests = suite.allTests();
    allTests.forEach((test) => {
      const project = test.parent.project()?.name || 'default';
      const file =
        test.location.file.split('/').pop()?.replace('.spec.ts', '') || '';
      const key = `${project}:${file}`;

      const currentCount = this.fileTestCounts.get(key) || 0;
      this.fileTestCounts.set(key, currentCount + 1);
    });

    // Global Setup 로그 표시
    const setupLogs = readLogFile('global-setup.log');
    if (setupLogs.length > 0) {
      console.log(`\n${colorize('[전역 설정]', 'blue')}`);
      setupLogs.forEach((log) => {
        // 이모지를 심볼로 변환하고 색상 적용
        const cleanLog = log
          .replace('🚀', '▶')
          .replace('📱', '●')
          .replace('🧹', '◐')
          .replace('✅', '✓')
          .replace('ℹ️', 'ℹ')
          .replace('❌', '✗')
          .replace('🎉', '✓');

        if (cleanLog.includes('✓') || cleanLog.includes('완료')) {
          console.log(`  ${colorize(cleanLog, 'green')}`);
        } else if (cleanLog.includes('✗') || cleanLog.includes('실패')) {
          console.log(`  ${colorize(cleanLog, 'red')}`);
        } else {
          console.log(`  ${colorize(cleanLog, 'cyan')}`);
        }
      });
      console.log('');
    }

    console.log(`${colorize('Playwright 테스트 시작', 'bright')}`);
    console.log(
      `${colorize('총', 'cyan')} ${colorize(this.testStats.total.toString(), 'bright')}${colorize('개 테스트 실행 예정', 'cyan')}`
    );
    // 실제 실행되는 프로젝트만 표시
    const runningProjects = Array.from(this.fileTestCounts.keys())
      .map((key) => key.split(':')[0])
      .filter((project, index, arr) => arr.indexOf(project) === index) // 중복 제거
      .sort();

    console.log(
      `${colorize('브라우저:', 'blue')} ${colorize(runningProjects.join(', ') || 'default', 'white')}`
    );
    console.log(colorize('─'.repeat(60), 'gray'));
  }

  onTestBegin(test: TestCase, _result: TestResult) {
    const project = test.parent.project()?.name || 'default';
    const file =
      test.location.file.split('/').pop()?.replace('.spec.ts', '') || '';
    const describeTitle = this.getDescribeTitle(test);

    // 테스트 정보를 버퍼에 저장 (onTestEnd에서 완전한 블록 출력)
    this.testBuffer.push({
      project,
      file,
      describe: describeTitle,
      test: test.title,
      status: 'running',
      duration: 0,
      steps: [], // Step들을 저장할 배열
    });
  }

  onStepBegin(test: TestCase, _result: TestResult, step: TestStep) {
    // 중요한 스텝만 버퍼에 저장 (API 호출, 페이지 네비게이션 등)
    if (step.category === 'pw:api' || step.category === 'test.step') {
      const project = test.parent.project()?.name || 'default';
      const testIndex = this.testBuffer.findIndex(
        (t) =>
          t.project === project &&
          t.test === test.title &&
          t.status === 'running'
      );

      if (testIndex !== -1 && this.testBuffer[testIndex]?.steps) {
        this.testBuffer[testIndex]!.steps!.push(step.title);
      }
    }
  }

  onStepEnd(test: TestCase, _result: TestResult, step: TestStep) {
    // 스텝 완료 시 에러가 있으면 로깅
    if (step.error) {
      const project = test.parent.project()?.name || 'default';
      console.log(
        `      ${colorize('✗', 'red')} ${colorize(`[${project}]`, 'magenta')} ${colorize(step.title, 'red')} - ${step.error.message}`
      );
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const project = test.parent.project()?.name || 'default';
    const file =
      test.location.file.split('/').pop()?.replace('.spec.ts', '') || '';
    const duration = result.duration;
    const status = result.status;

    // 통계 업데이트
    this.testStats[status as keyof TestStats]++;
    this.testStats.duration += duration;

    // 테스트 결과 저장
    this.testResults.push({
      test: test.title,
      status,
      duration,
      project,
    });

    // onTestEnd에서는 헤더 출력하지 않음 (onTestBegin에서 이미 출력됨)

    // 버퍼에서 해당 테스트 찾아서 업데이트
    const testIndex = this.testBuffer.findIndex(
      (t) =>
        t.project === project && t.test === test.title && t.status === 'running'
    );

    if (testIndex !== -1) {
      // 버퍼 업데이트
      const currentTest = this.testBuffer[testIndex]!;
      currentTest.status = status;
      currentTest.duration = duration;
      currentTest.error =
        status === 'failed' && result.error ? result.error.message : undefined;

      // 같은 파일의 모든 테스트가 완료되었는지 확인하고 파일 단위로 출력
      this.checkAndPrintFileBlock(project, file);
    }
  }

  /**
   * 테스트의 describe 블록 제목을 추출하는 헬퍼 메서드
   */
  private getDescribeTitle(test: TestCase): string {
    const titlePath = test.titlePath();
    // titlePath는 ['describe title', 'test title'] 형태
    // 중첩된 describe가 있을 수 있으므로 모든 describe를 조합
    if (titlePath.length <= 1) {
      return '기본 테스트';
    }

    // 마지막 요소는 test title이므로 제외하고 describe들만 조합
    const describeParts = titlePath.slice(0, -1);

    // 프로젝트명과 파일명을 제거하고 실제 describe 블록만 추출
    const filteredParts = describeParts.filter(
      (part) =>
        part &&
        part.trim() !== '' &&
        !part.includes('.spec.ts') &&
        !part.includes('mobile-') &&
        !part.includes('chromium') &&
        !part.includes('firefox') &&
        !part.includes('webkit')
    );

    return filteredParts.length > 0 ? filteredParts.join(' > ') : '기본 테스트';
  }

  /**
   * 같은 파일의 모든 테스트가 완료되었는지 확인하고 파일 단위로 출력
   */
  private checkAndPrintFileBlock(project: string, file: string) {
    const key = `${project}:${file}`;
    const expectedTestCount = this.fileTestCounts.get(key) || 0;

    // 해당 프로젝트/파일의 모든 테스트가 완료되었는지 확인
    const fileTests = this.testBuffer.filter(
      (t) => t.project === project && t.file === file
    );

    const completedTests = fileTests.filter((t) => t.status !== 'running');

    // 실제 테스트 수와 완료된 테스트 수가 일치하고, 아직 출력되지 않았으면 파일 단위로 출력
    if (completedTests.length === expectedTestCount && expectedTestCount > 0) {
      // 이미 출력된 파일인지 확인 (중복 출력 방지)
      const alreadyPrinted = completedTests.some((t) => t.printed);

      if (!alreadyPrinted) {
        this.printFileBlock(project, file, completedTests);

        // 출력 완료 표시
        completedTests.forEach((t) => {
          const testIndex = this.testBuffer.findIndex(
            (test) =>
              test.project === t.project &&
              test.file === t.file &&
              test.test === t.test
          );
          if (testIndex !== -1) {
            this.testBuffer[testIndex]!.printed = true;
          }
        });
      }
    }
  }

  /**
   * 파일 단위로 완전한 테스트 블록을 출력하는 메서드
   */
  private printFileBlock(
    project: string,
    file: string,
    tests: Array<{
      project: string;
      file: string;
      describe: string;
      test: string;
      status: string;
      duration: number;
      error?: string;
      steps?: string[];
    }>
  ) {
    // 프로젝트/파일 헤더
    console.log(
      `\n${colorize(`[${project}]`, 'magenta')} ${colorize(file, 'bright')}`
    );

    // describe별로 그룹핑
    const groupedByDescribe = tests.reduce(
      (acc, test) => {
        if (!acc[test.describe]) {
          acc[test.describe] = [];
        }
        acc[test.describe]!.push(test);
        return acc;
      },
      {} as Record<string, typeof tests>
    );

    // describe별로 출력
    Object.entries(groupedByDescribe).forEach(([describe, describeTests]) => {
      console.log(`  ${colorize('▶', 'cyan')} ${colorize(describe, 'cyan')}`);

      describeTests.forEach((testInfo) => {
        // 테스트 시작
        console.log(
          `    ${colorize('→', 'blue')} ${colorize('시작:', 'blue')} ${testInfo.test}`
        );

        // Step들 출력
        if (testInfo.steps && testInfo.steps.length > 0) {
          testInfo.steps.forEach((step) => {
            console.log(
              `      ${colorize('•', 'gray')} ${colorize(step, 'gray')}`
            );
          });
        }

        // 테스트 결과
        const statusConfig = {
          passed: { symbol: 'PASS', color: 'green' as const },
          failed: { symbol: 'FAIL', color: 'red' as const },
          skipped: { symbol: 'SKIP', color: 'yellow' as const },
          timedOut: { symbol: 'TIMEOUT', color: 'red' as const },
          interrupted: { symbol: 'INTERRUPTED', color: 'red' as const },
        };

        const config = statusConfig[
          testInfo.status as keyof typeof statusConfig
        ] || {
          symbol: '?',
          color: 'white' as const,
        };
        const durationStr =
          testInfo.duration > 1000
            ? `${(testInfo.duration / 1000).toFixed(1)}s`
            : `${testInfo.duration}ms`;

        console.log(
          `    ${colorize(config.symbol, config.color)} ${testInfo.test} ${colorize(`(${durationStr})`, 'gray')}`
        );

        // 실패한 테스트의 경우 에러 정보 출력
        if (testInfo.error) {
          console.log(`       ${colorize('ERROR:', 'red')} ${testInfo.error}`);
        }
      });
    });
  }

  onEnd(_result: FullResult) {
    console.log('\n' + colorize('─'.repeat(60), 'gray'));

    // Global Teardown 로그 표시
    const teardownLogs = readLogFile('global-teardown.log');
    if (teardownLogs.length > 0) {
      console.log(`\n${colorize('[전역 정리]', 'blue')}`);

      teardownLogs.forEach((log) => {
        // 이모지를 심볼로 변환하고 색상 적용
        const cleanLog = log
          .replace('🧹', '◐')
          .replace('✅', '✓')
          .replace('❌', '✗')
          .replace('🎉', '✓');

        if (cleanLog.includes('✓') || cleanLog.includes('완료')) {
          console.log(`  ${colorize(cleanLog, 'green')}`);
        } else if (cleanLog.includes('✗') || cleanLog.includes('실패')) {
          console.log(`  ${colorize(cleanLog, 'red')}`);
        } else {
          console.log(`  ${colorize(cleanLog, 'cyan')}`);
        }
      });
    }

    // ===== 테스트 결과 =====

    const totalDuration = Date.now() - this.startTime;
    const durationStr =
      totalDuration > 1000
        ? `${(totalDuration / 1000).toFixed(1)}s`
        : `${totalDuration}ms`;

    console.log('\n' + colorize('─'.repeat(60), 'gray'));
    console.log(
      `${colorize('테스트 완료', 'bright')} ${colorize(`(${durationStr})`, 'gray')}`
    );

    // 전체 통계
    console.log(`\n${colorize('[전체 결과]', 'blue')}`);
    console.log(
      `   ${colorize('PASSED:', 'green')} ${colorize(this.testStats.passed.toString(), 'bright')}`
    );
    console.log(
      `   ${colorize('FAILED:', 'red')} ${colorize(this.testStats.failed.toString(), 'bright')}`
    );
    console.log(
      `   ${colorize('SKIPPED:', 'yellow')} ${colorize(this.testStats.skipped.toString(), 'bright')}`
    );
    console.log(
      `   ${colorize('SUCCESS RATE:', 'white')} ${colorize(`${((this.testStats.passed / this.testStats.total) * 100).toFixed(1)}%`, 'bright')}`
    );

    // 프로젝트별 통계
    const projectStats = this.testResults.reduce(
      (acc, test) => {
        if (!acc[test.project]) {
          acc[test.project] = { passed: 0, failed: 0, skipped: 0, total: 0 };
        }
        const projectStats = acc[test.project]!;
        projectStats[test.status as keyof typeof projectStats]++;
        projectStats.total++;
        return acc;
      },
      {} as Record<
        string,
        { passed: number; failed: number; skipped: number; total: number }
      >
    );

    if (Object.keys(projectStats).length > 1) {
      console.log(`\n${colorize('브라우저별 결과:', 'blue')}`);
      Object.entries(projectStats).forEach(([project, stats]) => {
        const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
        console.log(
          `   ${colorize(project, 'white')}: ${colorize(stats.passed.toString(), 'green')} ${colorize('PASS', 'green')} ${colorize(stats.failed.toString(), 'red')} ${colorize('FAIL', 'red')} ${colorize(stats.skipped.toString(), 'yellow')} ${colorize('SKIP', 'yellow')} ${colorize(`(${successRate}%)`, 'gray')}`
        );
      });
    }

    // 실패한 테스트 요약
    const failedTests = this.testResults.filter((t) => t.status === 'failed');
    if (failedTests.length > 0) {
      console.log(
        `\n${colorize('실패한 테스트', 'red')} ${colorize(`(${failedTests.length}개):`, 'gray')}`
      );
      failedTests.forEach((test) => {
        console.log(
          `   ${colorize('✗', 'red')} ${colorize(`[${test.project}]`, 'magenta')} ${test.test}`
        );
      });
    }
  }
}

export default CompactDetailedReporter;
