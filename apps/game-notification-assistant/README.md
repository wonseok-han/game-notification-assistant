# 🎮 게임 알림 어시스턴트

게임 이용자가 게임에서 이미지를 캡처해 해당 시간이 도래하면 카카오톡 알림을 받을 수 있도록 하는 AI 어시스턴트입니다.

## ✨ 주요 기능

- **게임 알림 생성**: 게임 스크린샷과 함께 알림 설정
- **시간 기반 알림**: 지정된 시간에 자동 알림 전송
- **카카오톡 연동**: 카카오톡으로 게임 알림 수신
- **보안 인증**: 서버 사이드 전용 Supabase Auth 시스템
- **데이터베이스**: Supabase를 활용한 데이터 영구 저장
- **반복 알림**: 정기적인 게임 알림 설정

## 🚀 기술 스택

- **프론트엔드**: Next.js 15.3.0, React 19.1.0
- **상태 관리**: Zustand
- **스타일링**: Tailwind CSS
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth + 서버 전용 처리
- **타입 안전성**: TypeScript

## 🔒 보안 특징

- **클라이언트 Supabase 제한**: 보안을 위해 클라이언트에서 직접 Supabase 호출 금지
- **서버 전용 인증**: 모든 인증 로직은 서버 사이드에서만 처리
- **HTTP 전용 쿠키**: 세션 토큰을 안전한 HTTP 전용 쿠키로 관리
- **API 라우트 보호**: 모든 데이터베이스 접근은 서버를 통해서만 가능

## 📋 요구사항

- Node.js 18.0.0 이상
- pnpm 9.0.0 이상
- Supabase 계정 및 프로젝트

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
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# 애플리케이션 환경
NODE_ENV=development

# 카카오톡 API 설정 (선택사항)
NEXT_PUBLIC_KAKAO_REST_API_KEY=your_kakao_rest_api_key
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3001/auth/kakao/callback
KAKAO_ADMIN_KEY=your_kakao_admin_key
```

### 4. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 `http://localhost:3001`로 접속하세요.

## 🗄️ 데이터베이스 구조

### 테이블

- **users**: 사용자 정보 (Supabase Auth와 연동)
- **game_notifications**: 게임 알림 데이터

### 보안

- Row Level Security (RLS) 활성화
- Supabase Auth를 통한 사용자 인증
- 사용자별 데이터 접근 제한
- 서버 전용 데이터베이스 접근

## 🔐 인증 시스템

### 서버 전용 Supabase Auth

- 클라이언트에 Supabase 키 노출 없음
- 모든 인증 로직은 서버 사이드에서 처리
- HTTP 전용 쿠키를 통한 안전한 세션 관리
- 자동 세션 만료 및 갱신

### API 엔드포인트

- `POST /api/auth/login`: 로그인 (서버 전용 Supabase 처리)
- `POST /api/auth/register`: 회원가입 (서버 전용 Supabase 처리)
- `POST /api/auth/logout`: 로그아웃 (쿠키 제거)
- `GET /api/auth/verify`: 세션 검증 (쿠키 기반)

### 보안 장점

1. **클라이언트 보안**: Supabase 키가 클라이언트에 노출되지 않음
2. **세션 관리**: HTTP 전용 쿠키로 XSS 공격 방지
3. **데이터 접근 제어**: 모든 데이터베이스 접근은 서버를 통해서만 가능
4. **토큰 보안**: 액세스 토큰과 리프레시 토큰을 안전하게 관리

## 📱 카카오톡 연동

### 설정 방법

1. [Kakao Developers](https://developers.kakao.com)에서 앱 생성
2. 카카오톡 로그인 활성화
3. 리다이렉트 URI 설정
4. API 키를 환경 변수에 추가

### 알림 전송

- 지정된 시간에 자동 알림 전송
- 게임 스크린샷과 함께 메시지 전송
- 반복 알림 지원

## 🎯 사용법

### 1. 회원가입/로그인

- 이메일과 사용자명으로 계정 생성
- 서버 전용 Supabase Auth를 통한 안전한 인증
- 자동 세션 관리

### 2. 게임 알림 생성

- 게임 스크린샷 업로드
- 알림 제목과 설명 입력
- 알림 시간 설정
- 우선순위 및 카테고리 선택
- 반복 알림 옵션 설정

### 3. 알림 관리

- 생성된 알림 목록 조회
- 알림 수정 및 삭제
- 상태 변경 (대기중, 활성, 완료, 취소)
- 필터링 및 검색

### 4. 카카오톡 연동

- 카카오톡 계정 연결
- 알림 수신 설정
- 연결 상태 확인

## 🔧 개발 가이드

### 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트 (서버 전용)
│   │   └── auth/          # 인증 관련 API
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지
├── components/             # React 컴포넌트
│   ├── auth/              # 인증 관련 컴포넌트
│   ├── notification-form.tsx    # 알림 생성 폼
│   ├── notification-list.tsx    # 알림 목록
│   └── kakao-connection.tsx     # 카카오톡 연결
├── store/                  # Zustand 상태 관리
│   ├── auth-store.ts      # 인증 상태 (API 기반)
│   └── game-notification-store.ts # 게임 알림 상태
├── types/                  # TypeScript 타입 정의
│   └── game-notification.d.ts
├── utils/                  # 유틸리티 함수
│   ├── kakao-notification.ts
│   └── supabase.ts        # 서버 전용 Supabase 설정
```

### 상태 관리

- **auth-store**: 사용자 인증 상태 (API 라우트 기반)
- **game-notification-store**: 게임 알림 데이터

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

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해주세요.

---

**게임 알림 어시스턴트**로 게임 시간을 놓치지 마세요! 🎮✨
