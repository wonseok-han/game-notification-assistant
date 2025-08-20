# @repo/shared

Utilities Kit의 공유 유틸리티 함수 라이브러리입니다.

## 📦 설치

```bash
pnpm add @repo/shared
```

## 🚀 사용법

```tsx
import { formatDate, diffText } from '@repo/shared';

// 날짜 포맷팅
const formattedDate = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');

// 텍스트 차이점 비교
const diff = diffText('Hello World', 'Hello React');
console.log(diff); // 차이점 정보
```

## 🔧 개발

```bash
# 개발 모드 실행
pnpm run dev

# 빌드
pnpm run build

# 타입 체크
pnpm run check-types

# 테스트
pnpm run test
```

## 📁 구조

```
src/
├── date.ts          # 날짜 관련 유틸리티
├── diff.ts          # 텍스트 차이점 계산
└── index.ts         # 메인 export 파일
```

## 🧪 테스트

```bash
# 모든 테스트 실행
pnpm run test

# 특정 파일 테스트
pnpm run test date.test.ts

# 커버리지 확인
pnpm run test:coverage
```

## 🔗 관련 링크

- [dayjs](https://day.js.org/)
- [diff-match-patch](https://github.com/google/diff-match-patch)
