# 🎮 게임 알림 어시스턴트

게임 이용자가 게임에서 이미지를 캡처해 해당 시간이 도래하면 카카오톡 알림을 받을 수 있도록 하는 AI 어시스턴트입니다.

## ✨ 주요 기능

- **🖼️ 이미지 기반 시간 추출**: Google Cloud Vision API를 사용한 고정밀 OCR로 게임 스크린샷에서 시간 정보 자동 추출
- **⏰ 스마트 알림 시스템**: 다중 알림 시간 설정, 상대/절대 시간 자동 계산, UTC/Local 시간 처리
- **💬 카카오톡 연동**: OAuth 2.0 인증, 자동 토큰 갱신, "나에게 보내기" 알림 전송
- **🎮 게임 알림 관리**: CRUD 기능, 이미지 미리보기, 시간별 상세 정보 관리
- **🔒 보안 인증**: 서버 사이드 전용 Supabase Auth 시스템
- **🗄️ 데이터베이스**: Supabase를 활용한 데이터 영구 저장

## 🚀 기술 스택

- **프론트엔드**: Next.js 15.3.0, React 19.1.0
- **상태 관리**: Zustand 5.0.6
- **스타일링**: Tailwind CSS 4.1.11
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth + 서버 전용 처리
- **타입 안전성**: TypeScript 5.8.2
- **OCR 서비스**: Google Cloud Vision API
- **메시징**: KakaoTalk API
- **배포**: Vercel

## 📋 요구사항

- Node.js 22.18.0 이상
- pnpm 9.0.0 이상
- Supabase 계정 및 프로젝트
- Google Cloud Vision API 키
- Kakao Developers 앱 설정

## 🛠️ 설치 및 설정

### 1. 의존성 설치

```bash
cd apps/game-notification-assistant
pnpm install
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정에서 API 키 확인
3. SQL 편집기에서 `supabase/schema.sql` 실행
4. Authentication > Settings에서 이메일 확인 활성화 (선택사항)

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 애플리케이션 환경
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=your_deployed_site_url

# 카카오톡 API 설정
NEXT_PUBLIC_KAKAO_REST_API_KEY=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# Google Cloud Vision API
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
```

### 4. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

## 📱 카카오톡 연동

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

## 🖼️ OCR 및 시간 추출

### Google Cloud Vision API

- 고정밀 텍스트 인식으로 게임 스크린샷에서 시간 정보 추출
- 다양한 시간 형식 지원 (상대 시간, 절대 시간, 컨텍스트 기반)
- 다중 시간 처리로 하나의 이미지에서 여러 알림 시간 동시 추출

### 시간 파싱 기능

- **상대 시간**: "10분 남음", "3시간 후" 등
- **절대 시간**: "오후 3시", "내일 오전 9시" 등
- **컨텍스트 인식**: 게임 이벤트와 연관된 시간 정보 추출
- **UTC/Local 변환**: 서버와 클라이언트 간 시간대 일관성 유지

## 🎯 사용법

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

## 🔧 개발 가이드

### 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트 (서버 전용)
│   │   ├── auth/          # 인증 관련 API
│   │   ├── kakao/         # 카카오 연동 API
│   │   ├── notifications/ # 알림 관리 API
│   │   └── ocr/           # OCR 처리 API
│   ├── auth/              # 인증 페이지
│   ├── dashboard/         # 대시보드
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지
├── components/             # React 컴포넌트
│   ├── auth/              # 인증 관련 컴포넌트
│   ├── notification-form.tsx    # 알림 생성 폼
│   ├── notification-list.tsx    # 알림 목록
│   └── kakao-connection.tsx     # 카카오톡 연결
├── store/                  # Zustand 상태 관리
│   ├── auth-store.ts      # 인증 상태
│   └── notification-store.ts # 알림 상태
├── services/               # API 서비스
│   ├── auth.ts            # 인증 서비스
│   └── notification.ts    # 알림 서비스
├── utils/                  # 유틸리티 함수
│   ├── time-extractor.ts  # 시간 추출 로직
│   ├── google-vision.ts   # Google Vision API
│   └── supabase.ts        # Supabase 설정
└── types/                  # TypeScript 타입 정의
    └── game-notification.d.ts
```

### 상태 관리

- **auth-store**: 사용자 인증 상태 (API 라우트 기반)
- **notification-store**: 게임 알림 데이터 및 시간 관리

### 보안 원칙

1. **클라이언트 Supabase 금지**: 클라이언트에서 직접 Supabase 호출 금지
2. **API 라우트 활용**: 모든 데이터베이스 작업은 API 라우트를 통해 처리
3. **쿠키 보안**: HTTP 전용, Secure, SameSite 설정으로 쿠키 보안 강화
4. **토큰 검증**: 서버에서 모든 토큰 유효성 검증

## 🚀 배포

### Vercel 배포

1. GitHub 저장소 연결
2. 환경 변수 설정
3. 자동 배포 활성화

### 환경 변수

프로덕션 환경에서 다음 환경 변수를 설정하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 카카오톡 API 설정
NEXT_PUBLIC_KAKAO_REST_API_KEY=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# Google Cloud Vision API
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key

# 애플리케이션 설정
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NODE_ENV=production
```
