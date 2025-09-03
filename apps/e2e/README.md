# E2E Tests

게임 알림 어시스턴트 애플리케이션의 End-to-End 테스트를 위한 Playwright 테스트 스위트입니다.

## 📁 구조

```
apps/e2e/
├── tests/                    # 테스트 파일들
│   ├── scenarios/           # 시나리오 기반 테스트
│   │   ├── complete-user-scenario.spec.ts # 완전한 사용자 시나리오 (7단계)
│   │   └── archive/         # 아카이브된 테스트 파일들
│   │       ├── user-journey.spec.ts
│   │       ├── notification-workflow.spec.ts
│   │       └── kakao-integration-flow.spec.ts
│   ├── legacy/              # 기존 기능별 테스트 (참고용)
│   │   ├── auth.spec.ts
│   │   ├── notification.spec.ts
│   │   ├── kakao-integration.spec.ts
│   │   └── navigation.spec.ts
│   ├── helpers/             # 테스트 헬퍼 함수들
│   │   ├── test-helpers.ts
│   │   └── scenario-helpers.ts
│   ├── fixtures/            # 테스트 픽스처들
│   │   └── test-fixtures.ts
│   ├── setup/               # 테스트 설정 파일들
│   │   └── test-users.ts
│   ├── global-setup.ts      # 전역 테스트 설정
│   └── global-teardown.ts   # 전역 테스트 정리
├── playwright.config.ts     # Playwright 설정
├── package.json            # 의존성 및 스크립트
└── README.md              # 이 파일
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
# 루트 디렉토리에서
pnpm install

# E2E 앱 의존성 설치
pnpm --filter=e2e install
```

### 2. Playwright 브라우저 설치

```bash
pnpm --filter=e2e install
```

### 3. 애플리케이션 실행

```bash
# 개발 서버 시작 (별도 터미널에서)
pnpm dev:assistant
```

## 🧪 테스트 실행

### 기본 테스트 실행

```bash
# 모든 테스트 실행
pnpm test

# E2E 테스트만 실행
pnpm --filter=e2e test
```

### 실제 인증 테스트

E2E 테스트는 **실제 Supabase 인증**을 사용합니다:

- 실제 데이터베이스에 테스트용 사용자 계정을 자동 생성
- 실제 로그인/로그아웃 프로세스 테스트
- 현실적인 사용자 시나리오 검증
- 전역 설정에서 테스트용 계정 자동 관리

```bash
# 실제 인증으로 테스트 실행
pnpm --filter=e2e test
```

#### 테스트용 계정 정보
- **이메일**: `e2e-scenario-test@example.com`
- **비밀번호**: `E2EScenario123!`
- **사용자명**: `e2e-scenario-user`

이 계정은 시나리오 테스트 시작 시 자동으로 생성되며, 테스트 종료 시 자동으로 삭제됩니다.

### 다양한 실행 옵션

```bash
# UI 모드로 테스트 실행 (브라우저에서 테스트 진행 상황 확인)
pnpm test:ui

# 헤드풀 모드로 테스트 실행 (브라우저 창이 열림)
pnpm test:headed

# 디버그 모드로 테스트 실행 (단계별 디버깅)
pnpm test:debug

# 특정 브라우저에서만 테스트 실행
pnpm --filter=e2e test --project=chromium
pnpm --filter=e2e test --project=firefox
pnpm --filter=e2e test --project=webkit

# 특정 테스트 파일만 실행
pnpm --filter=e2e test tests/auth.spec.ts

# 특정 테스트만 실행
pnpm --filter=e2e test --grep "로그인"
```

### 테스트 결과 확인

```bash
# HTML 리포트 열기
pnpm test:report
```

## 📝 테스트 작성 가이드

### 1. 기본 테스트 구조

```typescript
import { test, expect } from '@playwright/test';

test.describe('기능명', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전 실행될 코드
    await page.goto('/');
  });

  test('테스트 케이스 설명', async ({ page }) => {
    // 테스트 로직
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

### 2. 헬퍼 함수 사용

```typescript
import { loginUser, createNotification } from '../helpers/test-helpers';

test('로그인 후 알림 생성', async ({ page }) => {
  await loginUser(page);
  await createNotification(page, {
    gameName: '테스트 게임',
    notificationTime: '14:00',
    description: '테스트 알림'
  });
});
```

### 3. 픽스처 사용

```typescript
import { test, expect } from '../fixtures/test-fixtures';

test('로그인된 사용자 테스트', async ({ loggedInPage }) => {
  // 이미 로그인된 상태로 테스트 실행
  await expect(loggedInPage).toHaveURL(/.*\/dashboard/);
});
```

## 🔧 설정

### Playwright 설정 (playwright.config.ts)

- **브라우저**: Chromium, Firefox, WebKit 지원
- **모바일 테스트**: Pixel 5, iPhone 12 지원
- **자동 재시도**: CI 환경에서 2회 재시도
- **리포터**: HTML, JSON, JUnit 리포트 생성
- **스크린샷/비디오**: 실패 시에만 캡처

### 환경 변수

```bash
# .env 파일에 추가
PLAYWRIGHT_BASE_URL=http://localhost:3000
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_RETRIES=2
```

## 🐛 디버깅

### 1. 디버그 모드

```bash
pnpm test:debug
```

### 2. 특정 테스트 디버깅

```bash
pnpm --filter=e2e test --debug tests/auth.spec.ts
```

### 3. 브라우저 개발자 도구

```bash
# 헤드풀 모드로 실행하여 브라우저에서 직접 디버깅
pnpm test:headed
```

### 4. 로그 확인

```bash
# 상세 로그와 함께 실행
DEBUG=pw:api pnpm --filter=e2e test
```

## 📊 CI/CD

### GitHub Actions

`.github/workflows/e2e.yml` 파일을 통해 자동화된 E2E 테스트가 설정되어 있습니다:

- **트리거**: main, develop 브랜치 push/PR
- **브라우저 매트릭스**: Chromium, Firefox, WebKit
- **아티팩트**: 테스트 결과 및 리포트 자동 업로드

### 로컬 CI 시뮬레이션

```bash
# CI 환경과 동일한 설정으로 테스트
CI=true pnpm --filter=e2e test
```

## 🎯 테스트 전략

### 1. 완전한 사용자 시나리오

E2E 테스트는 **고정된 데이터**로 **7단계 시나리오**를 순차적으로 실행합니다:

1. **새로운 유저로 회원가입**: `e2e-scenario-test@example.com`
2. **회원가입한 유저로 로그인**: 대시보드 접근
3. **대시보드에서 알림 생성**: 첫 번째 알림 생성
4. **생성한 알림 리스트 확인**: 알림 목록 조회
5. **생성한 알림 편집**: 알림 정보 수정
6. **카카오톡 연동**: OAuth 연동 및 알림 전송 테스트
7. **테스트 종료 시 사용자 삭제**: 자동 정리

### 2. 테스트 우선순위

1. **Critical Path**: 사용자 인증, 알림 생성/수정/삭제
2. **Integration**: 카카오 연동, API 통합
3. **UI/UX**: 네비게이션, 반응형 디자인
4. **Edge Cases**: 에러 처리, 유효성 검사

### 2. 테스트 데이터 관리

- 테스트용 사용자 계정 사용
- 각 테스트 후 데이터 정리
- 격리된 테스트 환경 유지

### 3. 성능 고려사항

- 병렬 테스트 실행
- 불필요한 대기 시간 최소화
- 효율적인 선택자 사용

## 🔍 문제 해결

### 자주 발생하는 문제

1. **브라우저 설치 실패**
   ```bash
   pnpm --filter=e2e install
   ```

2. **포트 충돌**
   ```bash
   # 다른 포트 사용
   PLAYWRIGHT_BASE_URL=http://localhost:3001 pnpm --filter=e2e test
   ```

3. **타임아웃 오류**
   - `playwright.config.ts`에서 timeout 값 조정
   - 네트워크 상태 확인

4. **선택자 오류**
   - 브라우저 개발자 도구로 요소 확인
   - `data-testid` 속성 사용 권장

## 📚 참고 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
