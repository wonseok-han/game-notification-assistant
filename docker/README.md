# Dev-Kit Docker 가이드

이 디렉토리에는 dev-kit 앱을 Docker로 빌드하고 실행하기 위한 파일들이 포함되어 있습니다.

## 파일 구조

- `Dockerfile` - 멀티스테이지 빌드를 통한 최적화된 이미지 생성
- `.dockerignore` - Docker 빌드 시 제외할 파일들
- `docker-compose.yml` - 컨테이너 실행을 위한 설정
- `README.md` - 사용법 가이드

## 빌드 및 실행 방법

### 1. Docker Compose 사용 (권장)

```bash
# 프로젝트 루트 디렉토리에서 실행
cd docker
docker-compose up --build
```

### 2. Docker 명령어 직접 사용

```bash
# 이미지 빌드
docker build -f docker/Dockerfile -t dev-kit:latest .

# 컨테이너 실행
docker run -p 3001:3001 --name dev-kit-app dev-kit:latest
```

### 3. 개발 환경에서 실행

```bash
# 백그라운드 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f dev-kit

# 컨테이너 중지
docker-compose down
```

## 접속 정보

- **URL**: http://localhost:3001
- **포트**: 3001
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

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `NODE_ENV` | `production` | Node.js 환경 |
| `PORT` | `3001` | 서버 포트 |
| `HOSTNAME` | `0.0.0.0` | 서버 호스트 |

## 문제 해결

### 빌드 실패
```bash
# 캐시 제거 후 재빌드
docker-compose build --no-cache
```

### 권한 문제
```bash
# 컨테이너 내부 확인
docker exec -it dev-kit-app sh
```
