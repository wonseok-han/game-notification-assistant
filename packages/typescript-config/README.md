# @repo/typescript-config

Utilities Kit의 공유 TypeScript 설정 패키지입니다.

## 📦 설치

```bash
pnpm add -D @repo/typescript-config
```

## 🚀 사용법

### 기본 설정 사용
```json
// tsconfig.json
{
  "extends": "@repo/typescript-config/base.json"
}
```

### Next.js 설정 사용
```json
// tsconfig.json
{
  "extends": "@repo/typescript-config/nextjs.json"
}
```

### React 라이브러리 설정 사용
```json
// tsconfig.json
{
  "extends": "@repo/typescript-config/react-library.json"
}
```

## 📁 설정 파일들

### base.json
기본 TypeScript 설정으로 모든 프로젝트에서 사용할 수 있습니다.

**포함된 설정:**
- 엄격한 타입 체크
- ES2022 타겟
- 모듈 해상도 설정
- 경로 매핑 설정

### nextjs.json
Next.js 프로젝트를 위한 설정입니다.

**추가된 설정:**
- Next.js 타입 정의
- App Router 지원
- 이미지 최적화 타입

### react-library.json
React 라이브러리를 위한 설정입니다.

**특별한 설정:**
- 라이브러리 빌드 최적화
- 외부 의존성 설정
- 타입 선언 파일 생성

## 🔧 설정 커스터마이징

### 기본 설정 확장
```json
// tsconfig.json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Next.js 설정 확장
```json
// tsconfig.json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"]
    }
  }
}
```

## 🎯 컴파일러 옵션

### 엄격한 타입 체크
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true,
  "strictBindCallApply": true,
  "strictPropertyInitialization": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true
}
```

### 모듈 설정
```json
{
  "module": "ESNext",
  "moduleResolution": "bundler",
  "allowSyntheticDefaultImports": true,
  "esModuleInterop": true,
  "allowImportingTsExtensions": true
}
```

### 타겟 설정
```json
{
  "target": "ES2022",
  "lib": ["ES2022", "DOM", "DOM.Iterable"],
  "useDefineForClassFields": true
}
```

## 📋 타입 정의

### Next.js 타입
```json
{
  "types": ["node", "react", "react-dom"]
}
```

### React 라이브러리 타입
```json
{
  "types": ["react", "react-dom"],
  "declaration": true,
  "declarationMap": true
}
```

## 🔧 개발

```bash
# 설정 검증
pnpm run check-types

# 타입 체크
pnpm run type-check

# 설정 테스트
pnpm run test
```

## 📁 구조

```
├── base.json             # 기본 설정
├── nextjs.json           # Next.js 설정
├── react-library.json    # React 라이브러리 설정
└── package.json
```

## 🔗 관련 링크

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Next.js TypeScript](https://nextjs.org/docs/basic-features/typescript)
- [React TypeScript](https://react.dev/learn/typescript)
