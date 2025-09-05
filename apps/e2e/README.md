# E2E 테스트 가이드

게임 알림 어시스턴트의 End-to-End 테스트를 위한 종합 가이드입니다.

## 빠른 시작

### 1. 환경 설정
```bash
# 환경 변수 파일 생성 (자동으로 실행됨)
pnpm test

# 또는 수동으로 생성
pnpm env:setup
```

### 2. 기본 테스트 실행
```bash
# 모든 브라우저에서 테스트
pnpm test

# 특정 브라우저에서 테스트
pnpm test:mobile-chrome
pnpm test:mobile-safari
```

## 테스트 시나리오

현재 구현된 E2E 테스트 시나리오:

1. **01-sign-up**: 신규 사용자 회원가입
   - 메인 페이지 진입 및 UI 확인
   - 회원가입 폼 작성 및 제출
   - 회원가입 후 로그아웃

2. **02-login**: 사용자 로그인
   - 회원가입한 사용자로 로그인
   - 세션 저장 및 복원

3. **03-create-notification**: 알림 생성
   - 필수 필드 검증
   - 단일/다중 시간 설정
   - 폼 초기화 기능

4. **04-list-notifications**: 알림 목록 관리
   - 알림 목록 표시
   - 활성/비활성 토글
   - 알림 편집 모달
   - 알림 삭제

5. **05-edit-notification**: 알림 편집
   - 모달을 통한 수정
   - 취소 및 ESC 키 처리

6. **06-kakao-integration**: 카카오톡 연동
   - 연동 UI 확인
   - Mock API 테스트

## 환경 변수 설정

### 사용 가능한 환경 변수

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `BASE_URL` | `http://localhost:3000` | 테스트 대상 애플리케이션 URL |
| `REUSE_EXISTING_SERVER` | `true` | 기존 서버 재사용 여부 |
| `HEADLESS` | `true` | 헤드리스 모드 실행 여부 |
| `SHOW_STEP_LOG` | `false` | 상세한 Step 로그 출력 여부 |
| `TIMEOUT` | `30000` | 테스트 타임아웃 (ms) |
| `RETRIES` | `0` | 실패 시 재시도 횟수 |
| `BROWSER_TIMEOUT` | `10000` | 브라우저 액션 타임아웃 (ms) |
| `NAVIGATION_TIMEOUT` | `30000` | 페이지 네비게이션 타임아웃 (ms) |
| `REPORTER_OUTPUT_DIR` | `test-results` | 리포트 출력 디렉토리 |

### 환경 변수 설정 방법

1. **자동 설정** (권장):
   ```bash
   pnpm test  # pretest 훅이 자동으로 .env 파일 생성
   ```

2. **수동 설정**:
   ```bash
   pnpm env:setup
   # .env 파일을 편집하여 원하는 설정 적용
   ```

3. **일회성 오버라이드**:
   ```bash
   HEADLESS=false SHOW_STEP_LOG=true pnpm test
   BASE_URL=http://localhost:4000 pnpm test
   ```

## 테스트 스크립트

### 기본 테스트
```bash
pnpm test                    # 모든 브라우저에서 기본 테스트
pnpm test:html              # HTML 리포트 생성
pnpm test:report            # HTML 리포트 열기
```

### 브라우저별 테스트
```bash
pnpm test:chrome            # Desktop Chrome
pnpm test:firefox           # Desktop Firefox  
pnpm test:webkit            # Desktop Safari
pnpm test:mobile-chrome     # Mobile Chrome (Pixel 5)
pnpm test:mobile-safari     # Mobile Safari (iPhone 12) + Step 로그
```

### 개발 및 디버깅
```bash
pnpm test:headed            # 브라우저 UI 표시
pnpm test:debug             # 디버그 모드
pnpm test:ui                # Playwright UI 모드
pnpm codegen                # 테스트 코드 생성 도구
```

## 커스텀 리포터

### 실시간 로그 출력
- **파일 단위 그룹화**: 같은 파일의 테스트들이 하나의 블록으로 출력
- **Step 로그**: `SHOW_STEP_LOG=true`로 상세한 실행 과정 확인
- **컬러 출력**: 성공/실패/진행 상태를 색상으로 구분
- **실시간 피드백**: 테스트 완료 즉시 결과 출력

### 리포터 출력 예시
```
[mobile-chrome] 01-sign-up
  ▶ 01 - 신규 사용자 회원가입
    → 시작: 메인 페이지로 진입
      • Launch browser
      • Create context
      • Navigate to "/"
      • Click locator('button:has-text("로그인")')
    PASS 메인 페이지로 진입 (910ms)
```

## 로컬 개발 환경

### 서버 설정
- **자동 서버 시작**: 테스트 실행 시 자동으로 개발 서버 시작
- **기존 서버 재사용**: 로컬에서 이미 실행 중인 서버 재사용 (빠른 실행)
- **포트 설정**: `BASE_URL` 환경 변수로 서버 URL 변경 가능

### 브라우저 설정
- **헤드리스 모드**: 기본적으로 브라우저 UI 숨김
- **병렬 실행**: 프로젝트별로 병렬 실행, 프로젝트 내에서는 순차 실행
- **타임아웃 설정**: 각종 타임아웃을 환경 변수로 조정 가능

## CI/CD 통합

### GitHub Actions
- **자동 실행**: `main`, `develop` 브라우치 push 시 자동 실행
- **Pull Request**: PR 생성 시 자동 실행
- **다중 브라우저**: 모든 지원 브라우저에서 병렬 실행
- **아티팩트**: 테스트 결과 및 HTML 리포트 자동 업로드

### CI 환경 설정
CI 환경에서는 다음 설정이 자동 적용됩니다:
- `REUSE_EXISTING_SERVER=false` (새 서버 시작)
- `RETRIES=2` (2회 재시도)
- `HEADLESS=true` (헤드리스 모드)

## 파일 구조

```
apps/e2e/
├── .env.local              # 환경 변수 템플릿
├── .env                    # 실제 환경 변수 (git에서 제외)
├── playwright.config.ts    # Playwright 설정
├── custom-reporter.ts      # 커스텀 리포터
├── package.json            # 테스트 스크립트
├── tests/
│   ├── scenarios/          # 테스트 시나리오
│   │   ├── 01-sign-up.spec.ts
│   │   ├── 02-login.spec.ts
│   │   ├── 03-create-notification.spec.ts
│   │   ├── 04-list-notifications.spec.ts
│   │   ├── 05-edit-notification.spec.ts
│   │   └── 06-kakao-integration.spec.ts
│   ├── helpers/            # 테스트 헬퍼 함수
│   ├── global-setup.ts     # 전역 설정
│   └── global-teardown.ts  # 전역 정리
├── .storage/               # 브라우저 세션 저장소
└── test-results/           # 테스트 결과 및 리포트
```

## 추가 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [VSCode GitHub Actions 확장](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-pull-request-github)
