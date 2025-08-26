# 게임 알림 어시스턴트

게임에서 중요한 순간을 놓치지 않도록 이미지를 캡처하고 원하는 시간에 카카오톡으로 알림을 받을 수 있는 스마트 알림 시스템

## 목차

- [개발 환경](#개발-환경)
- [프로젝트 개요](#프로젝트-개요)
- [모노레포 구조](#모노레포-구조)
- [Getting Started](#Getting-Started)
- [개발 워크플로우](#개발-워크플로우)
- [기술 스택](#기술-스택)

## 개발 환경

| 항목              | 내용                                     |
| ----------------- | ---------------------------------------- |
| **Node.js**       | `v22.18.0` (LTS)                         |
| **패키지 매니저** | `pnpm@9.0.0`                             |
| **모노레포 도구** | `TurboRepo@2.5.4`                        |
| **프레임워크**    | `Next.js@15.3.0` (App Router)            |
| **React**         | `React@19.1.0`                           |
| **언어**          | `TypeScript@5.8.2`                       |
| **스타일링**      | `Tailwind CSS@4.1.11`                    |
| **상태 관리**     | `Zustand@5.0.6`                          |
| **데이터베이스**  | `Supabase` (PostgreSQL)                  |
| **OCR 서비스**    | `Google Cloud Vision API`                |
| **Cron Job**    | `cron-job`                |

## 프로젝트 개요

### 목적
게임 플레이 중 중요한 이벤트나 시간을 놓치지 않도록 이미지 기반으로 시간을 자동 추출하고, 지정된 시간에 카카오톡으로 알림을 보내는 서비스

### 아키텍처
- **모노레포**: TurboRepo + pnpm workspace
- **디자인 패턴**: Feature-Sliced Design (FSD)
- **앱**: Next.js 기반의 게임 알림 웹 애플리케이션
- **패키지**: 재사용 가능한 UI 컴포넌트, 설정, 유틸리티
- **백엔드**: Supabase (인증, 데이터베이스, 실시간 기능)
- **OCR**: Google Cloud Vision API를 통한 이미지 텍스트 추출

## 모노레포 구조

### 전체 구조
```
game-notification-assistant/
├── apps/                           # 애플리케이션
│   └── game-notification-assistant/ # 메인 게임 알림 앱 (FSD 패턴 적용)
├── packages/                      # 공유 패키지
│   ├── ui/                       # UI 컴포넌트 라이브러리
│   ├── shared/                   # 공유 유틸리티
│   ├── auto-index/               # 자동 인덱스 생성 도구
│   ├── eslint-config/            # ESLint 설정
│   ├── typescript-config/        # TypeScript 설정
│   └── tailwind-config/          # Tailwind CSS 설정
├── docker/                       # Docker 설정
├── docs/                         # 문서
├── turbo.json                    # Turborepo 설정
└── pnpm-workspace.yaml           # pnpm 워크스페이스
```

### FSD (Feature-Sliced Design) 아키텍처

메인 앱은 **Feature-Sliced Design** 패턴을 적용하여 확장 가능하고 유지보수하기 쉬운 구조로 설계되었습니다.

**자세한 FSD 가이드**: [docs/fsd.md](./docs/fsd.md)

```
apps/game-notification-assistant/src/
├── app/                          # App Layer - Next.js App Router
│   ├── api/                      # API Routes
│   ├── dashboard/                # 페이지 컴포넌트
│   ├── user/                     # 사용자 관련 페이지
│   ├── layout.tsx                # 전역 레이아웃
│   └── page.tsx                  # 홈페이지
├── widgets/                      # Widgets Layer - 복합 UI 블록
│   └── layout/
│       └── app-header.tsx        # 앱 헤더 위젯
├── features/                     # Features Layer - 비즈니스 기능
│   ├── connect-kakao/           # 카카오 연결 기능
│   ├── create-notification/     # 알림 생성 기능
│   ├── edit-notification/       # 알림 수정 기능
│   ├── list-notification/       # 알림 목록 기능
│   ├── sign-in-user/           # 로그인 기능
│   └── sign-up-user/           # 회원가입 기능
├── entities/                     # Entities Layer - 비즈니스 엔티티
│   ├── auth/                    # 인증 엔티티
│   │   └── model/               # 도메인 모델 & 상태
│   ├── user/                    # 사용자 엔티티
│   │   ├── api/                 # API 통신
│   │   ├── model/               # 도메인 모델
│   │   └── ui/                  # UI 컴포넌트
│   ├── notification/            # 알림 엔티티
│   │   ├── api/                 # API 통신
│   │   ├── config/              # 설정
│   │   ├── lib/                 # 비즈니스 로직
│   │   ├── model/               # 도메인 모델
│   │   └── ui/                  # UI 컴포넌트
│   └── kakao/                   # 카카오 엔티티
│       ├── api/                 # API 통신
│       └── model/               # 도메인 모델
└── shared/                       # Shared Layer - 공통 코드
    ├── config/                  # 설정
    ├── lib/                     # 공통 라이브러리
    │   ├── api/                 # API 클라이언트
    │   └── supabase/            # Supabase 클라이언트
    └── types/                   # 공통 타입 정의
```

### FSD 레이어별 역할

| 레이어 | 역할 | 예시 |
|--------|------|------|
| **🏢 Entities** | 비즈니스 엔티티, 도메인 모델 | `user`, `notification`, `auth` |
| **⚡ Features** | 사용자 기능, 상호작용 | `create-notification`, `sign-in-user` |
| **🧩 Widgets** | 복합 UI 블록, 페이지 섹션 | `app-header`, `dashboard-content` |
| **📱 App** | 애플리케이션 초기화, 라우팅 | Next.js pages, layouts |
| **🔧 Shared** | 재사용 가능한 코드 | API 클라이언트, 유틸리티, 타입 |

### 세그먼트별 구조

각 레이어 내부는 다음과 같은 세그먼트로 구성됩니다:

```
├── api/          # API 통신 로직
├── config/       # 설정 파일
├── lib/          # 비즈니스 로직, 유틸리티
├── model/        # 도메인 모델, 상태 관리
└── ui/           # UI 컴포넌트
```

## Getting Started

### 전체 프로젝트 실행
```bash
# 의존성 설치
pnpm install

# 모든 앱과 패키지 개발 모드 실행
pnpm run dev
```

### 특정 앱만 실행
```bash
# 게임 알림 앱만 실행
pnpm run dev --filter=game-notification-assistant

# UI 패키지와 함께 실행
pnpm run dev --filter=@repo/ui --filter=game-notification-assistant
```

### 개발 도구
```bash
# 타입 체크
pnpm run check-types

# 린팅
pnpm run lint

# 포맷팅
pnpm run format

# 빌드
pnpm run build
```

## 개발 워크플로우

### 1. 새 기능 개발
```bash
# 1. 새 브랜치 생성
git checkout -b feature/new-tool

# 2. 개발 서버 실행
pnpm run dev:kit

# 3. 코드 작성 및 테스트
# 4. 커밋 및 푸시
```

### 2. 패키지 개발
```bash
# UI 패키지 개발
cd packages/ui
pnpm run dev

# 설정 패키지 수정
cd packages/eslint-config
# 설정 파일 수정
```

### 3. 자동 인덱스 생성
```bash
# 모든 인덱스 파일 자동 생성
pnpm run auto-index

# 특정 패키지의 인덱스만 생성
pnpm run auto-index --filter=@repo/ui
```

## 기술 스택

### 모노레포 도구
- **TurboRepo 2.5.4**: 빌드 시스템 및 캐싱
- **pnpm 9.0.0**: 빠른 패키지 매니저
- **Husky**: Git hooks 관리
- **lint-staged**: 스테이징된 파일만 린팅

### Frontend
- **Next.js 15.3.0**: App Router 기반 React 프레임워크
- **React 19.1.0**: 최신 React 버전
- **TypeScript 5.8.2**: 정적 타입 검사
- **Tailwind CSS 4.1.11**: 유틸리티 퍼스트 CSS

### Backend & Database
- **Supabase**: 인증, 데이터베이스, 실시간 기능
- **PostgreSQL**: 관계형 데이터베이스
- **Row Level Security (RLS)**: 사용자별 데이터 접근 제어

### 상태 관리 & 인증
- **Zustand 5.0.6**: 경량 상태 관리
- **Supabase Auth**: JWT 기반 인증 시스템
- **HTTP-only Cookies**: 보안 강화된 토큰 저장

### 외부 서비스
- **Google Cloud Vision API**: OCR 텍스트 추출
- **KakaoTalk API**: OAuth 2.0 및 메시지 전송
- **Vercel**: 배포 및 호스팅

### 개발 도구
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **@repo/auto-index**: 자동 인덱스 생성

### UI 컴포넌트
- **TipTap**: 리치 텍스트 에디터
- **Monaco Editor**: 코드 에디터
- **SVGR**: SVG를 React 컴포넌트로 변환

## 패키지 설명

### `@repo/ui`
재사용 가능한 UI 컴포넌트 라이브러리
- ActionButton, CodeTextarea, MonacoEditor 등
- TipTap Editor, Snackbar 등 고급 컴포넌트

### `@repo/shared`
공유 유틸리티 함수들
- 날짜 처리, diff 알고리즘 등

### `@repo/auto-index`
자동으로 인덱스 파일을 생성하는 도구
- 컴포넌트, 훅, 스토어 등의 export 자동화
- Watch 모드: 파일 변경 시 실시간 index.ts 업데이트

### 설정 패키지들
- `@repo/eslint-config`: ESLint 설정
- `@repo/typescript-config`: TypeScript 설정
- `@repo/tailwind-config`: Tailwind CSS 설정

## 관련 링크

### 기술 스택 문서
- [Supabase Documentation](https://supabase.com/docs)
- [Kakao Developers](https://developers.kakao.com/)
- [Google Cloud Vision API](https://cloud.google.com/vision)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [cron-job](https://cron-job.org)
- [FSD 공식](https://feature-sliced.design/kr/docs/get-started/overview#layers)
- [FSD 참고 블로그](https://velog.io/@floatletter91/FSDFeature-Sliced-Design%EB%A5%BC-%EC%A0%95%EB%A7%90-%EC%9E%98-%EC%A0%81%EC%9A%A9%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95)
