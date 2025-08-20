# @repo/eslint-config

Utilities Kit의 공유 ESLint 설정 패키지입니다.

## 📦 설치

```bash
pnpm add -D @repo/eslint-config
```

## 🚀 사용법

### 기본 설정 사용
```js
// eslint.config.js
import baseConfig from '@repo/eslint-config/base';

export default baseConfig;
```

### Next.js 설정 사용
```js
// eslint.config.js
import nextConfig from '@repo/eslint-config/next';

export default nextConfig;
```

### React 내부 설정 사용
```js
// eslint.config.js
import reactInternalConfig from '@repo/eslint-config/react-internal';

export default reactInternalConfig;
```

## 📁 설정 파일들

### base.js
기본 ESLint 설정으로 모든 프로젝트에서 사용할 수 있습니다.

**포함된 규칙:**
- TypeScript 엄격 모드
- React Hooks 규칙
- import/export 정렬
- 코드 스타일 통일

### next.js
Next.js 프로젝트를 위한 설정입니다.

**추가된 규칙:**
- Next.js 권장 설정
- App Router 규칙
- 이미지 최적화 규칙

### react-internal.js
React 내부 컴포넌트를 위한 설정입니다.

**특별한 규칙:**
- React 19 컴파일러 최적화 규칙
- useCallback, useMemo 사용 제한
- 자동 메모이제이션 규칙

## 🔧 설정 커스터마이징

### 규칙 추가
```js
// eslint.config.js
import baseConfig from '@repo/eslint-config/base';

export default [
  ...baseConfig,
  {
    rules: {
      'no-console': 'warn',
      'prefer-const': 'error',
    },
  },
];
```

### 파일별 규칙
```js
// eslint.config.js
import baseConfig from '@repo/eslint-config/base';

export default [
  ...baseConfig,
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
```

## 📋 포함된 플러그인

- **@typescript-eslint/eslint-plugin**: TypeScript 규칙
- **@typescript-eslint/parser**: TypeScript 파서
- **eslint-plugin-react**: React 규칙
- **eslint-plugin-react-hooks**: React Hooks 규칙
- **eslint-plugin-import**: import/export 규칙
- **eslint-plugin-jsx-a11y**: 접근성 규칙

## 🔧 개발

```bash
# 설정 테스트
pnpm run test

# 설정 검증
pnpm run lint

# 타입 체크
pnpm run check-types
```

## 📁 구조

```
├── base.js              # 기본 설정
├── next.js              # Next.js 설정
├── react-internal.js    # React 내부 설정
└── package.json
```

## 🔗 관련 링크

- [ESLint Documentation](https://eslint.org/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Next.js ESLint Config](https://nextjs.org/docs/basic-features/eslint)
