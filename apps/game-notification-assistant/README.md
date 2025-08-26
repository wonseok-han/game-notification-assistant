# 게임 알림 어시스턴트

게임 이용자가 게임에서 이미지를 캡처해 해당 시간이 도래하면 카카오톡 알림을 받을 수 있도록 하는 AI 어시스턴트입니다.

## 주요 기능

- **이미지 기반 시간 추출**: Google Cloud Vision API를 사용한 고정밀 OCR로 게임 스크린샷에서 시간 정보 자동 추출
- **스마트 알림 시스템**: 다중 알림 시간 설정, 상대/절대 시간 자동 계산, UTC/Local 시간 처리
- **카카오톡 연동**: OAuth 2.0 인증, 자동 토큰 갱신, "나에게 보내기" 알림 전송
- **게임 알림 관리**: CRUD 기능, 이미지 미리보기, 시간별 상세 정보 관리
- **보안 인증**: 서버 사이드 전용 Supabase Auth 시스템
- **데이터베이스**: Supabase를 활용한 데이터 영구 저장

## 기술 스택

- **아키텍처**: Feature-Sliced Design (FSD)
- **프론트엔드**: Next.js 15.3.0, React 19.1.0
- **상태 관리**: Zustand 5.0.6 + persist
- **스타일링**: Tailwind CSS 4.1.11
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth + 서버 전용 처리
- **타입 안전성**: TypeScript 5.8.2
- **OCR 서비스**: Google Cloud Vision API
- **Cron Job**: cron-job
- **메시징**: KakaoTalk API
- **배포**: Vercel

## 요구사항

- Node.js 22.18.0 이상
- pnpm 9.0.0 이상
- Supabase 계정 및 프로젝트
- Google Cloud Vision API 키
- cron-job 계정 및 설정
- Kakao Developers 앱 설정

## 설치 및 설정

### 1. 의존성 설치

```bash
cd apps/game-notification-assistant
pnpm install
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정에서 API 키 확인:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`에 설정
   - **anon/public key**: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`에 설정
   - **service_role key**: `SUPABASE_SECRET_KEY`에 설정
3. SQL 편집기에서 `supabase/schema.sql` 실행
4. Authentication > Settings에서 이메일 확인 활성화 (선택사항)
5. **중요**: `SUPABASE_SECRET_KEY`는 서버 전용으로 사용되며 클라이언트에 노출하면 안 됩니다

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url                    # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key    # 클라이언트용 공개 키 (anon key)
SUPABASE_SECRET_KEY=your_supabase_secret_key                          # 서버 전용 비밀 키 (service_role key)

# 애플리케이션 환경
NODE_ENV=development                                                   # 개발/프로덕션 환경 구분
NEXT_PUBLIC_SITE_URL=your_deployed_site_url                          # 배포된 사이트 URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000                       # API 기본 URL (개발용)

# 카카오톡 API 설정
KAKAO_REST_API_KEY=your_kakao_rest_api_key                          # 카카오 REST API 키
KAKAO_CLIENT_SECRET=your_kakao_client_secret                         # 카카오 클라이언트 시크릿

# Google Cloud Vision API
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key                       # Google Cloud Vision API 키

# Cron Job 설정
CRON_SECRET=your_cron_secret_key                                     # Cron Job 인증용 비밀키
```

### 4. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

## 카카오톡 연동

### 설정 방법

1. [Kakao Developers](https://developers.kakao.com)에서 앱 생성
2. 카카오톡 로그인 활성화
3. 리다이렉트 URI 설정: `{your-domain}/api/kakao/callback`
4. API 키를 환경 변수에 추가
5. 필요한 스코프 설정: `profile_nickname`, `profile_image`, `account_email`, `talk_message`

### 알림 전송

- 지정된 시간에 자동 알림 전송
- 게임 스크린샷과 함께 메시지 전송
- "나에게 보내기" API를 통한 개인 알림
- 자동 토큰 갱신 및 연결 상태 관리

## Cron Job 설정

### cron-job.org 설정

1. [cron-job.org](https://cron-job.org)에서 계정 생성
2. 새 cron job 생성
3. URL 설정: `{your-domain}/api/cron/notifications`
4. HTTP Method: `GET`
5. 실행 주기: 5분마다
6. Headers 설정:
   ```
   Authorization: Bearer your_cron_secret_key
   ```

### 보안 설정

- `CRON_SECRET` 환경변수에 강력한 비밀키 설정
- cron-job.org에서만 API 호출 가능
- 10분 전부터 현재까지의 대기 중인 알림 처리
- 활성 상태인 게임 알림만 대상으로 처리

### 동작 방식

- **실행 주기**: 5분마다 자동 실행
- **조회 범위**: 현재 시간 기준 10분 전부터
- **처리 대상**: `status = 'pending'`, `is_enabled = true`, `is_active = true`
- **알림 전송**: 카카오톡 "나에게 보내기" API 사용
- **상태 업데이트**: 성공 시 `sent`, 실패 시 `failed`로 자동 업데이트

## OCR 및 시간 추출

### Google Cloud Vision API

- 고정밀 텍스트 인식으로 게임 스크린샷에서 시간 정보 추출
- 다양한 시간 형식 지원 (상대 시간, 절대 시간, 컨텍스트 기반)
- 다중 시간 처리로 하나의 이미지에서 여러 알림 시간 동시 추출

### 시간 파싱 기능

- **상대 시간**: "10분 남음", "3시간 후" 등
- **절대 시간**: "오후 3시", "내일 오전 9시" 등
- **컨텍스트 인식**: 게임 이벤트와 연관된 시간 정보 추출
- **UTC/Local 변환**: 서버와 클라이언트 간 시간대 일관성 유지

## 사용법

### 1. 회원가입/로그인

- 이메일과 사용자명으로 계정 생성
- 서버 전용 Supabase Auth를 통한 안전한 인증
- 자동 세션 관리

### 2. 카카오톡 연동

- 카카오 계정으로 OAuth 인증
- 자동 토큰 갱신 및 연결 상태 관리
- 테스트 알림으로 연동 상태 확인

### 3. 게임 알림 생성

- 게임 스크린샷 업로드
- OCR을 통한 자동 시간 추출
- 알림 제목과 설명 입력
- 다중 알림 시간 설정 및 관리
- 원본 텍스트와 라벨 편집

### 4. 알림 관리

- 생성된 알림 목록 조회 (테이블 형태)
- 알림 수정 및 삭제
- 상태별 필터링 및 검색
- 이미지 미리보기
- 시간별 상세 정보 (아코디언 형태)

## 개발 가이드

### 아키텍처: Feature-Sliced Design (FSD)

본 프로젝트는 **Feature-Sliced Design** 패턴을 적용하여 확장 가능하고 유지보수하기 쉬운 구조로 설계되었습니다.

**자세한 FSD 가이드**: [../../docs/fsd.md](../../docs/fsd.md)

### 프로젝트 구조

```
src/
├── app/                          # App Layer - Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── user/                 # 사용자 인증 API
│   │   ├── kakao/                # 카카오 연동 API
│   │   ├── notifications/        # 알림 관리 API
│   │   ├── ocr/                  # OCR 처리 API
│   │   └── cron/                 # 크론 작업 API
│   ├── dashboard/                # 대시보드 페이지
│   ├── user/                     # 사용자 관련 페이지
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 메인 페이지
├── widgets/                      # Widgets Layer - 복합 UI 블록
│   └── layout/
│       └── app-header.tsx        # 앱 헤더
├── features/                     # Features Layer - 비즈니스 기능
│   ├── create-notification/      # 알림 생성 기능
│   ├── edit-notification/        # 알림 수정 기능
│   ├── list-notification/        # 알림 목록 기능
│   ├── connect-kakao/            # 카카오 연결 기능
│   ├── sign-in-user/             # 로그인 기능
│   └── sign-up-user/             # 회원가입 기능
├── entities/                     # Entities Layer - 비즈니스 엔티티
│   ├── auth/                     # 인증 엔티티
│   │   └── model/                # 인증 상태 관리
│   ├── user/                     # 사용자 엔티티
│   │   ├── api/                  # 사용자 API
│   │   ├── model/                # 사용자 데이터 모델
│   │   └── ui/                   # 사용자 UI 컴포넌트
│   ├── notification/             # 알림 엔티티
│   │   ├── api/                  # 알림 API
│   │   ├── config/               # 알림 설정
│   │   ├── lib/                  # OCR, 시간 추출 로직
│   │   ├── model/                # 알림 데이터 모델
│   │   └── ui/                   # 알림 UI 컴포넌트
│   └── kakao/                    # 카카오 엔티티
│       ├── api/                  # 카카오 API
│       └── model/                # 카카오 데이터 모델
└── shared/                       # Shared Layer - 공통 코드
    ├── config/                   # 공통 설정
    ├── lib/                      # 공통 라이브러리
    │   ├── api/                  # API 클라이언트
    │   └── supabase/             # Supabase 클라이언트
    └── types/                    # 공통 타입 정의
```

### FSD 레이어별 역할

| 레이어       | 역할                   | 예시                                  |
| ------------ | ---------------------- | ------------------------------------- |
| **App**      | Next.js 페이지, 라우팅 | `dashboard/page.tsx`, `layout.tsx`    |
| **Widgets**  | 복합 UI 블록           | `app-header.tsx`                      |
| **Features** | 사용자 기능            | `create-notification`, `sign-in-user` |
| **Entities** | 비즈니스 엔티티        | `user`, `notification`, `auth`        |
| **Shared**   | 공통 코드              | API 클라이언트, 유틸리티, 타입        |

### 네이밍 규칙

- **기본**: kebab-case + 도메인-명사
- **설정**: `도메인-config.ts` (예: `auth-config.ts`)
- **DTO**: `도메인-dto.ts` (예: `user-dto.ts`)
- **API**: `도메인-api.ts` (예: `notification-api.ts`)
- **Features**: `동사-도메인` (예: `create-notification`)

### 상태 관리

FSD 패턴에 따라 각 엔티티별로 상태를 관리합니다:

- **`entities/auth/model/auth-store.ts`**: 사용자 인증 상태
- **`entities/notification/model/notification-store.ts`**: 알림 데이터 및 시간 관리
- **상태 관리 도구**: Zustand 5.0.6 + persist 미들웨어

### 보안 원칙

1. **클라이언트 Supabase 금지**: 클라이언트에서 직접 Supabase 호출 금지
2. **API 라우트 활용**: 모든 데이터베이스 작업은 API 라우트를 통해 처리
3. **쿠키 보안**: HTTP 전용, Secure, SameSite 설정으로 쿠키 보안 강화
4. **토큰 검증**: 서버에서 모든 토큰 유효성 검증

## 배포

### Vercel 배포

1. GitHub 저장소 연결
2. 환경 변수 설정
3. 자동 배포 활성화

### 환경 변수

프로덕션 환경에서 다음 환경 변수를 설정하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url                    # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key    # 클라이언트용 공개 키 (anon key)
SUPABASE_SECRET_KEY=your_supabase_secret_key                          # 서버 전용 비밀 키 (service_role key)

# 카카오톡 API 설정
KAKAO_REST_API_KEY=your_kakao_rest_api_key                          # 카카오 REST API 키
KAKAO_CLIENT_SECRET=your_kakao_client_secret                         # 카카오 클라이언트 시크릿

# Google Cloud Vision API
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key                       # Google Cloud Vision API 키

# Cron Job 설정
CRON_SECRET=your_cron_secret_key                                     # Cron Job 인증용 비밀키

# 애플리케이션 설정
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app                  # 배포된 사이트 URL
NEXT_PUBLIC_API_BASE_URL=https://your-domain.vercel.app              # API 기본 URL (프로덕션용)
NODE_ENV=production                                                   # 프로덕션 환경
```
