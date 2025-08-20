# Turborepo 개발 가이드

이 가이드는 Turborepo를 사용한 monorepo 개발 환경 구성과 관리 방법을 다룹니다.

## 📋 목차

- [시작하기](#🚀-시작하기)
- [패키지 관리](#📦-패키지-관리)
- [앱 및 워크스페이스 생성](#🏗️-앱-및-워크스페이스-생성)
- [실행 및 빌드](#🚀-실행-및-빌드)
- [문제 해결](#🐛-문제-해결)

## 🚀 시작하기

### 1. 필수 도구 설치

먼저 pnpm을 전역으로 설치합니다:

```bash
npm install -g pnpm
```

### 2. 프로젝트 설정

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm run dev
```

### 3. 새로운 Turborepo 프로젝트 생성

```bash
npx create-turbo@latest
```

## 📦 패키지 관리

### 1. 종속성 설치

#### 특정 앱에 패키지 추가

```bash
# root 경로에서 실행
pnpm add 패키지명 --filter=앱명

# 예시: dev-tools 앱에 axios 추가
pnpm add axios --filter=dev-tools
```

#### 전역 패키지 설치 (root 레벨)

```bash
# root 경로에서 실행
pnpm add -w 패키지명

# 예시: 개발 의존성 추가
pnpm add -w -D typescript
```

#### 로컬 패키지 설치

```bash
# 해당 패키지/앱 경로로 이동 후 실행
cd apps/dev-tools
pnpm add 패키지명

# 또는 특정 패키지 경로에서
cd packages/ui
pnpm add react
```

### 2. 패키지 제거

```bash
# 특정 앱에서 패키지 제거
pnpm remove 패키지명 --filter=앱명

# 전역 패키지 제거
pnpm remove -w 패키지명
```

## 🏗️ 앱 및 워크스페이스 생성

### 1. 새로운 Next.js 앱 생성

```bash
# apps 디렉토리에 새로운 Next.js 앱 생성
npx create-next-app apps/새로운앱명

# 예시: 관리자 대시보드 앱 생성
npx create-next-app apps/admin-dashboard
```

### 2. 워크스페이스 생성

```bash
# 어떤 경로에서든 실행 가능
npx turbo gen workspace --name 워크스페이스명

# 예시: 유틸리티 패키지 생성
npx turbo gen workspace --name utils
```

### 3. 컴포넌트 생성

```bash
# UI 패키지에 새로운 컴포넌트 생성
cd packages/ui
npx turbo gen component --name 컴포넌트명

# 예시: 모달 컴포넌트 생성
npx turbo gen component --name Modal
```

## 🚀 실행 및 빌드

### 1. 개발 서버 실행

```bash
# 모든 앱 실행
pnpm run dev

# 특정 앱만 실행
pnpm run dev --filter=dev-tools

# 병렬 실행 (성능 향상)
pnpm run dev --parallel
```

### 2. 빌드

```bash
# 모든 앱 빌드
pnpm run build

# 특정 앱만 빌드
pnpm run build --filter=dev-tools

# 의존성 포함 빌드
pnpm run build --filter=dev-tools...
```

### 3. 테스트

```bash
# 모든 패키지 테스트
pnpm run test

# 특정 패키지 테스트
pnpm run test --filter=ui
```

### 4. 린트 및 포맷팅

```bash
# 코드 린트
pnpm run lint

# 코드 포맷팅
pnpm run format

# 타입 체크
pnpm run type-check
```

## 🔧 고급 사용법

### 1. 캐시 관리

```bash
# 캐시 확인
pnpm turbo run build --dry-run

# 캐시 초기화
pnpm turbo run build --force
```

### 2. 병렬 처리

```bash
# 최대 동시 작업 수 설정
pnpm turbo run build --concurrency=4

# 무제한 병렬 처리
pnpm turbo run build --parallel
```

### 3. 선택적 실행

```bash
# 변경된 패키지만 실행
pnpm turbo run build --filter="[HEAD^1]"

# 특정 패키지와 의존성 실행
pnpm turbo run build --filter="dev-tools..."
```

## 🐛 문제 해결

### 1. 일반적인 문제

#### 패키지 설치 오류

```bash
# node_modules 정리 후 재설치
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

#### 캐시 관련 문제

```bash
# Turbo 캐시 초기화
pnpm turbo run build --force

# 전체 캐시 정리
rm -rf .turbo
rm -rf node_modules/.cache
```

#### 포트 충돌 문제

```bash
# 특정 포트로 실행
pnpm run dev --filter=dev-tools -- --port=3001
```

### 2. 디버깅

```bash
# 상세 로그 출력
pnpm turbo run build --verbose

# 의존성 그래프 확인
pnpm turbo run build --graph
```

### 3. 성능 최적화

```bash
# 빌드 시간 분석
pnpm turbo run build --profile

# 병렬 처리 최적화
pnpm turbo run build --parallel --concurrency=8
```

## 📚 추가 자료

- [Turborepo 공식 문서](https://turbo.build/repo/docs)
- [pnpm 워크스페이스 가이드](https://pnpm.io/workspaces)
- [Next.js 공식 문서](https://nextjs.org/docs)
