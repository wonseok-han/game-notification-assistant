# 🎮 게임 알림 어시스턴트

게임에서 중요한 순간을 놓치지 않도록 이미지를 캡처하고 원하는 시간에 카카오톡으로 알림을 받을 수 있는 스마트 알림 시스템

## 📋 목차

- [개발 환경](#📦-개발-환경)
- [프로젝트 개요](#📖-프로젝트-개요)
- [모노레포 구조](#🏗️-모노레포-구조)
- [Getting Started](#🚀-Getting-Started)
- [개발 워크플로우](#🔄-개발-워크플로우)
- [기술 스택](#🛠️-기술-스택)

## 📦 개발 환경

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

## 📖 프로젝트 개요

### 🎯 목적
게임 플레이 중 중요한 이벤트나 시간을 놓치지 않도록 이미지 기반으로 시간을 자동 추출하고, 지정된 시간에 카카오톡으로 알림을 보내는 서비스

### 🏗️ 아키텍처
- **모노레포**: TurboRepo + pnpm workspace
- **앱**: Next.js 기반의 게임 알림 웹 애플리케이션
- **패키지**: 재사용 가능한 UI 컴포넌트, 설정, 유틸리티
- **백엔드**: Supabase (인증, 데이터베이스, 실시간 기능)
- **OCR**: Google Cloud Vision API를 통한 이미지 텍스트 추출

## 🏗️ 모노레포 구조

```
game-notification-assistant/
├── apps/                           # 애플리케이션
│   └── game-notification-assistant/ # 메인 게임 알림 앱
│       ├── src/app/               # Next.js App Router
│       ├── src/components/        # 컴포넌트
│       ├── src/store/             # Zustand 스토어
│       ├── src/services/          # API 서비스
│       ├── src/utils/             # 유틸리티 함수
│       └── supabase/              # 데이터베이스 스키마
├── packages/                      # 공유 패키지
│   ├── ui/                       # UI 컴포넌트 라이브러리
│   ├── shared/                   # 공유 유틸리티
│   ├── eslint-config/            # ESLint 설정
│   ├── typescript-config/        # TypeScript 설정
│   └── tailwind-config/          # Tailwind CSS 설정
├── docker/                       # Docker 설정
├── docs/                         # 문서
├── turbo.json                    # Turborepo 설정
└── pnpm-workspace.yaml           # pnpm 워크스페이스
```

## 🚀 Getting Started

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

## 🔄 개발 워크플로우

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

## 🛠️ 기술 스택

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

## 📦 패키지 설명

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

### 설정 패키지들
- `@repo/eslint-config`: ESLint 설정
- `@repo/typescript-config`: TypeScript 설정
- `@repo/tailwind-config`: Tailwind CSS 설정

## 🔗 관련 링크

- [Supabase Documentation](https://supabase.com/docs)
- [Kakao Developers](https://developers.kakao.com/)
- [Google Cloud Vision API](https://cloud.google.com/vision)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
