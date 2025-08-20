# Utilities Kit

개발할 때마다 이곳저곳 찾아서 쓰기 귀찮아서 한꺼번에 모아놓은 나만의 Dev Tools 토이 프로젝트

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

## 📖 프로젝트 개요

### 🎯 목적
개발 과정에서 자주 사용하는 도구들을 한 곳에 모아서 효율적으로 사용할 수 있는 개발자 도구 모음집

### 🏗️ 아키텍처
- **모노레포**: TurboRepo + pnpm workspace
- **앱**: Next.js 기반의 개발 도구 웹 애플리케이션
- **패키지**: 재사용 가능한 UI 컴포넌트, 설정, 유틸리티

## 🏗️ 모노레포 구조

```
utilities-kit/
├── apps/                   # 애플리케이션
│   └── dev-kit/           # 메인 개발 도구 앱
│       ├── src/app/       # Next.js App Router
│       ├── src/components/ # 공통 컴포넌트
│       ├── src/store/     # Zustand 스토어
│       └── src/hooks/     # 커스텀 훅
├── packages/              # 공유 패키지
│   ├── ui/               # UI 컴포넌트 라이브러리
│   ├── shared/           # 공유 유틸리티
│   ├── auto-index/       # 자동 인덱스 생성 도구
│   ├── eslint-config/    # ESLint 설정
│   ├── typescript-config/ # TypeScript 설정
│   └── tailwind-config/  # Tailwind CSS 설정
├── docs/                 # 문서
├── turbo.json            # Turborepo 설정
└── pnpm-workspace.yaml   # pnpm 워크스페이스
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
# dev-kit 앱만 실행
pnpm run dev:kit

# UI 패키지와 함께 실행
pnpm run dev --filter=@repo/ui --filter=dev-kit
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

### 상태 관리 & 데이터
- **Zustand 5.0.6**: 경량 상태 관리
- **NVD API**: CVE 데이터 소스

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

## 🎯 구현된 기능

### 개발 도구
- [x] **JSON Formatter**: JSON 데이터를 보기 좋게 정렬하고 포맷팅
- [x] **Base64 Encoder/Decoder**: Base64 인코딩/디코딩 기능
- [x] **JWT Encoder/Decoder**: JWT 토큰 디코딩 및 검증 기능
- [x] **Regex Tester**: 정규식 테스트 및 유효성 검사 도구
- [x] **Timestamp Converter**: Unix timestamp ↔ 날짜 변환 도구
- [x] **Diff Comparator**: 두 텍스트 간의 차이점 비교 및 하이라이팅
- [x] **Web Editor**: 실시간 HTML 에디터 (TipTap 기반)
- [x] **CVE Viewer**: NVD API를 통한 CVE 데이터 조회 및 무한스크롤

### 계획 중인 기능
- [ ] **타입 생성기**: Backend API 응답값에서 key-value 추출해서 적절한 타입으로 만들어주는 기능
- [ ] **Color Picker**: 색상 선택 및 변환 도구
- [ ] **QR Code Generator**: QR 코드 생성기

## 🔗 관련 링크

- [Dev Kit App README](./apps/dev-kit/README.md)
- [Turborepo Documentation](https://turborepo.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [TipTap Editor](https://tiptap.dev/docs/editor/getting-started/install/react)
