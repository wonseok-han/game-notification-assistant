# Dev-Kit Docker 가이드

이 디렉토리에는 dev-kit 앱을 Docker로 빌드하고 실행하기 위한 파일들이 포함되어 있습니다.

## 파일 구조

- `Dockerfile` - 멀티스테이지 빌드를 통한 최적화된 이미지 생성
- `.dockerignore` - Docker 빌드 시 제외할 파일들
- `docker-compose.yml` - 컨테이너 실행을 위한 설정
- `README.md` - 사용법 가이드

## 빌드 및 실행 방법

### 1. 환경 변수 설정

Docker 빌드 및 실행 시 필요한 환경 변수를 설정합니다:

```bash
# docker 디렉토리에 .env 파일 생성
cd docker
cat > .env << 'EOF'
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_supabase_secret_key

# 애플리케이션 환경
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# 카카오톡 API 설정
KAKAO_REST_API_KEY=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# Google Cloud Vision API
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key

# Cron Job 설정
CRON_SECRET=your_cron_secret_key
EOF
```

**중요**: 
- 환경 변수는 **빌드 시점**에 ARG로 전달되어 Next.js 빌드에 포함됩니다
- 런타임에도 environment로 다시 전달되어 서버 API에서 사용됩니다
- `.env` 파일은 보안상 Docker 이미지에 포함되지 않습니다 (`.dockerignore`에서 제외)

### 2. Docker Compose 사용 (권장)

```bash
# 프로젝트 루트 디렉토리에서 실행
cd docker
docker-compose up --build
```

### 3. Docker 명령어 직접 사용

```bash
# 이미지 빌드
docker build -f docker/Dockerfile -t game-notification-assistant:latest .

# 컨테이너 실행
docker run -p 3000:3000 --name game-notification-assistant-app game-notification-assistant:latest
```

### 4. 개발 환경에서 실행

```bash
# 백그라운드 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f game-notification-assistant

# 컨테이너 중지
docker-compose down
```

## 접속 정보

- **URL**: http://localhost:3000
- **포트**: 3000
- **환경**: Production

## 주요 특징

### 멀티스테이지 빌드
- **base**: 기본 Node.js 환경 및 pnpm 설정
- **deps**: 의존성 설치
- **builder**: 애플리케이션 빌드
- **runner**: 프로덕션 실행 환경

### 최적화
- Next.js standalone 출력 사용
- 불필요한 파일 제외 (.dockerignore)
- 보안 강화 (비root 사용자)
- 헬스체크 포함

### pnpm Workspace 지원
- 모노레포 구조 지원
- workspace 패키지 자동 설치
- 의존성 캐싱 최적화

## 환경 변수

### 필수 환경 변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase 공개 키 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SECRET_KEY` | Supabase 서비스 역할 키 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `KAKAO_REST_API_KEY` | 카카오 REST API 키 | `1234567890abcdef...` |
| `KAKAO_CLIENT_SECRET` | 카카오 클라이언트 시크릿 | `abcdef1234567890...` |
| `GOOGLE_CLOUD_API_KEY` | Google Cloud Vision API 키 | `AIzaSyAbc123...` |
| `CRON_SECRET` | Cron Job 인증용 비밀키 | `your-secure-secret` |

### 시스템 환경 변수

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `NODE_ENV` | `production` | Node.js 환경 |
| `PORT` | `3000` | 서버 포트 |
| `HOSTNAME` | `0.0.0.0` | 서버 호스트 |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | 사이트 URL |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3000` | API 기본 URL |

## 문제 해결

### Supabase 연결 오류
```bash
# 환경 변수 확인
docker exec -it game-notification-assistant-app env | grep SUPABASE

# 컨테이너 로그 확인
docker-compose logs game-notification-assistant
```

**원인**: Supabase URL과 키가 설정되지 않음  
**해결**: `docker/.env` 파일에 올바른 Supabase 정보 설정

### 빌드 실패
```bash
# 캐시 제거 후 재빌드
docker-compose build --no-cache
```

### 권한 문제
```bash
# 컨테이너 내부 확인
docker exec -it game-notification-assistant-app sh
```

### 환경 변수 문제
```bash
# .env 파일 확인
cat docker/.env

# 환경 변수 로드 테스트
docker-compose config
```
