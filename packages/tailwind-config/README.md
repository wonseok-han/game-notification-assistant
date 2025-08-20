# @repo/tailwind-config

Utilities Kit의 공유 Tailwind CSS 설정 패키지입니다.

## 📦 설치

```bash
pnpm add -D @repo/tailwind-config
```

## 🚀 사용법

### 기본 설정 사용
```js
// tailwind.config.js
import sharedConfig from '@repo/tailwind-config';

export default sharedConfig;
```

### 설정 확장
```js
// tailwind.config.js
import sharedConfig from '@repo/tailwind-config';

export default {
  ...sharedConfig,
  content: [
    ...sharedConfig.content,
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    ...sharedConfig.theme,
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
      },
    },
  },
};
```

## 🎨 포함된 설정

### 색상 팔레트
```js
colors: {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    900: '#1e3a8a',
  },
  gray: {
    50: '#f9fafb',
    500: '#6b7280',
    900: '#111827',
  },
}
```

### 커스텀 컴포넌트
```css
/* shared-styles.css */
@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}
```

## 📁 구조

```
├── tailwind.config.js    # 메인 설정 파일
├── shared-styles.css     # 공유 스타일
├── postcss.config.js     # PostCSS 설정
└── package.json
```

## 🎯 주요 기능

### 반응형 디자인
```js
screens: {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}
```

## 🔧 개발

```bash
# 개발 모드 실행
pnpm run dev

# 빌드
pnpm run build

# 설정 검증
pnpm run lint
```

## 📋 사용 예시

### 기본 사용
```js
// tailwind.config.js
import sharedConfig from '@repo/tailwind-config';

export default sharedConfig;
```

### 커스터마이징
```js
// tailwind.config.js
import sharedConfig from '@repo/tailwind-config';

export default {
  ...sharedConfig,
  theme: {
    ...sharedConfig.theme,
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [
    ...sharedConfig.plugins,
    // 추가 플러그인
  ],
};
```

### CSS 파일에서 사용
```css
/* globals.css */
@import '@repo/tailwind-config/shared-styles.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 🔗 관련 링크

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [PostCSS](https://postcss.org/)
- [Inter Font](https://rsms.me/inter/)
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
