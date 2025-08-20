# @repo/auto-index

폴더를 자동으로 스캔하여 `index.ts` 파일을 생성하는 범용 도구입니다.

## 🚀 빠른 시작

```bash
# 패키지 설치
pnpm add @repo/auto-index

# CLI 사용 (필수: --paths 옵션)
npx auto-index --paths=src/components

# CLI 사용 (감시 모드)
npx auto-index --paths=src/components --watch

# 설정 파일 기반 사용
npx auto-index --watch

# 도움말 보기
npx auto-index --help
```

## 설치

```bash
pnpm add @repo/auto-index
```

## 사용법

### 1. CLI 기반 사용

```bash
# 기본 사용법 (--paths는 필수)
auto-index --paths=src/components

# 여러 경로 지정
auto-index --paths=src/components,src/hooks

# 감시 모드 (파일 변경 시 자동 업데이트)
auto-index --paths=src/components --watch

# 출력 파일명 지정
auto-index --paths=src/components --outputFile=exports.ts

# 파일 확장자 지정
auto-index --paths=src/components --fileExtensions=.tsx,.ts

# 제외할 파일 패턴 지정
auto-index --paths=src/components --excludes=*.d.ts,*.test.ts

# export 스타일 지정
auto-index --paths=src/components --exportStyle=named

# 네이밍 규칙 지정
auto-index --paths=src/components --namingConvention=PascalCase

# 확장자 포함 여부
auto-index --paths=src/components --fromWithExtension=false
```

### 2. 설정 파일 기반 사용

설정 파일을 생성한 후 간단하게 사용할 수 있습니다:

```bash
# 설정 파일 기반 감시 모드
auto-index --watch

# CLI 옵션으로 설정 오버라이드
auto-index --paths=src/components --watch --exportStyle=named
```

### 3. CLI 옵션

```bash
# 도움말
auto-index --help

# 필수 옵션
--paths=<경로1,경로2>    처리할 폴더 경로 (쉼표로 구분하여 여러 경로 지정 가능)

# 일반 옵션
--outputFile=<파일명>     생성할 index.ts 파일의 이름 (기본값: index.ts)
--fileExtensions=<확장자> 감시할 파일 확장자 (예: .tsx,.ts)
--excludes=<패턴1,패턴2>  제외할 파일 패턴 (예: *.d.ts,*.png)
--exportStyle=<스타일>    생성할 export 스타일 (default, named, star, star-as, mixed, auto)
--namingConvention=<규칙> 파일명 변환 규칙 (camelCase, original, PascalCase)
--fromWithExtension=<true|false> 파일 경로에 확장자 포함 여부 (기본값: false)

# 모드 옵션
--watch                  감시 모드 활성화
-h, --help              도움말 출력
```

## 설정 옵션

### 설정 파일 사용

ESLint나 Prettier처럼 별도의 설정 파일을 사용합니다:

#### 1. JSON 설정 파일 (`.autoindexrc`)

프로젝트 루트에 `.autoindexrc` 파일을 생성합니다:

```json
{
  "targets": [
    {
      "paths": ["src/components", "src/app/**/components"],
      "fileExtensions": [".tsx", ".ts", ".jsx", ".js"],
      "outputFile": "index.ts",
      "exportStyle": "named",
      "namingConvention": "PascalCase",
      "excludes": ["*.d.ts", "*.test.ts", "*.stories.ts"]
    },
    {
      "paths": ["src/hooks"],
      "fileExtensions": [".tsx", ".ts", ".jsx", ".js"],
      "outputFile": "index.ts",
      "exportStyle": "named",
      "namingConvention": "camelCase",
      "excludes": ["*.d.ts"]
    },
    {
      "paths": ["public/assets/icons"],
      "fileExtensions": [".svg"],
      "outputFile": "index.ts",
      "exportStyle": "named",
      "namingConvention": "PascalCase",
      "fromWithExtension": true,
      "excludes": ["*.png", "*.jpg", "*.gif"]
    }
  ]
}
```

#### 2. JavaScript 설정 파일 (`autoindex.config.js`)

더 복잡한 설정이나 동적 설정이 필요한 경우 JavaScript 파일을 사용할 수 있습니다:

```javascript
module.exports = {
  targets: [
    {
      paths: ['src/components', 'src/app/**/components'],
      fileExtensions: ['.tsx', '.ts', '.jsx', '.js'],
      outputFile: 'index.ts',
      exportStyle: 'named',
      namingConvention: 'PascalCase',
      excludes: ['*.d.ts', '*.test.ts', '*.stories.ts'],
    },
  ],
};
```

#### 3. 지원하는 설정 파일 형식

다음 순서로 설정 파일을 찾습니다:

1. `.autoindexrc` (JSON)
2. `.autoindexrc.json` (JSON)
3. `autoindex.config.js` (CommonJS)
4. `autoindex.config.mjs` (ES Module)
5. `autoindex.config.ts` (TypeScript)

### 설정 옵션 설명

| 옵션      | 타입       | 기본값 | 설명                                                           |
| --------- | ---------- | ------ | -------------------------------------------------------------- |
| `targets` | `Target[]` | -      | 처리할 타겟들                                                  |
| `log`     | `boolean`  | `true` | 일반 로그 출력 여부 (console.log, console.error, console.warn) |

### Target 옵션

| 옵션                | 타입                                                               | 기본값                           | 설명                              |
| ------------------- | ------------------------------------------------------------------ | -------------------------------- | --------------------------------- |
| `paths`             | `string[]`                                                         | -                                | 처리할 경로들 (glob 패턴 지원)    |
| `fileExtensions`    | `string[]`                                                         | `[".tsx", ".ts", ".jsx", ".js"]` | 처리할 파일 확장자                |
| `outputFile`        | `string`                                                           | `"index.ts"`                     | 생성할 파일명                     |
| `exportStyle`       | `"default" \| "named" \| "star" \| "star-as" \| "mixed" \| "auto"` | `"auto"`                         | export 처리 방식                  |
| `namingConvention`  | `"camelCase" \| "PascalCase" \| "original"`                        | `"original"`                     | 네이밍 변환 규칙                  |
| `fromWithExtension` | `boolean`                                                          | `false`                          | from 경로에 파일 확장자 포함 여부 |
| `excludes`          | `string[]`                                                         | `[]`                             | 제외할 파일 패턴들                |

### Export 스타일 옵션

| 스타일    | 설명                       | 예시                                                                  |
| --------- | -------------------------- | --------------------------------------------------------------------- |
| `default` | default export만           | `export { default } from './Component';`                              |
| `named`   | default를 named로 변환     | `export { default as Component } from './Component';`                 |
| `star`    | export \* 사용             | `export * from './Component';`                                        |
| `star-as` | export \* as 사용          | `export * as Component from './Component';`                           |
| `mixed`   | default와 named를 한 줄로  | `export { default as Component, named1, named2 } from './Component';` |
| `auto`    | 파일 내용에 따라 자동 결정 | 파일 내용 분석 후 적절한 스타일 선택                                  |

#### mixed 스타일 상세 설명

`mixed` 스타일은 파일 내용을 분석하여 다음과 같이 동작합니다:

- **default export가 있는 경우**: `export { default as [Alias], [named1], [named2] } from './path';`
- **default export가 없는 경우**: `export { [named1], [named2] } from './path';`

**예시**:

```typescript
// Button.tsx (default export 있음)
export default function Button() { ... }
export const ButtonGroup = () => { ... }
export const ButtonSize = { ... }

// 생성되는 index.ts
export { default as Button, ButtonGroup, ButtonSize } from './Button';

// utils.ts (default export 없음)
export const formatDate = () => { ... }
export const parseDate = () => { ... }

// 생성되는 index.ts
export { formatDate, parseDate } from './utils';
```

### 네이밍 규칙 예시

**파일명**: `user-profile.tsx`

| namingConvention | 결과           | 설명                     |
| ---------------- | -------------- | ------------------------ |
| `original`       | `user_profile` | 기본값, 원본 파일명 유지 |
| `PascalCase`     | `UserProfile`  | React 컴포넌트용         |
| `camelCase`      | `userProfile`  | 유틸리티 함수용          |

### fromWithExtension 옵션 예시

**파일명**: `icon-logo.svg`

| fromWithExtension | 결과                                                     |
| ----------------- | -------------------------------------------------------- |
| `false`           | `export { default as IconLogo } from './icon-logo';`     |
| `true`            | `export { default as IconLogo } from './icon-logo.svg';` |

### excludes 옵션 예시

**패턴**: `*.d.ts, *.test.ts, *.png`

| 패턴        | 설명                      |
| ----------- | ------------------------- |
| `*.d.ts`    | TypeScript 선언 파일 제외 |
| `*.test.ts` | 테스트 파일 제외          |
| `*.png`     | PNG 이미지 파일 제외      |

### 로깅 설정

`log` 옵션으로 콘솔 출력을 제어할 수 있습니다:

```json
{
  "log": true,    // 일반 로그 (console.log, console.error, console.warn)
  "targets": [...]
}
```

**로깅 레벨**:

- **`log: true`**: 일반적인 작업 진행 상황, 에러, 경고 메시지 출력
- **`log: false`**: 모든 일반 로그 비활성화

**사용 예시**:

```bash
# 로그 비활성화
auto-index --paths=src/components --log=false

# 모든 로그 비활성화
auto-index --paths=src/components --log=false
```

## 예시

### 컴포넌트 폴더 구조

```
src/components/
├── Button.tsx
├── Input.tsx
├── Modal.tsx
└── index.ts (자동 생성됨)
```

### 생성되는 index.ts

```typescript
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';
```

### SVG 파일 폴더 구조

```
public/assets/icons/
├── icon-logo.svg
├── icon-menu.svg
└── index.ts (자동 생성됨)
```

### 생성되는 index.ts (fromWithExtension: true)

```typescript
export { default as IconLogo } from './icon-logo.svg';
export { default as IconMenu } from './icon-menu.svg';
```

## 설정

### 설정 파일 생성

프로젝트 루트에 설정 파일을 생성합니다:

```bash
# JSON 설정 파일 생성
cp .autoindexrc.example .autoindexrc

# 또는 JavaScript 설정 파일 생성
cp autoindex.config.js.example autoindex.config.js
```

### package.json에 스크립트 추가

```json
{
  "scripts": {
    "generate:index": "auto-index --paths=src/components",
    "dev": "auto-index --watch"
  }
}
```

### 개발 중 자동 감지

```json
{
  "scripts": {
    "dev:watch": "auto-index --watch"
  }
}
```

## 동작 모드

### 1. CLI 전용 모드 (`cli-only`)

- `--paths` 옵션이 제공되고 설정 파일이 없는 경우
- CLI 옵션만으로 동작

### 2. 설정 기반 모드 (`config-based`)

- `--paths` 옵션이 없고 설정 파일이 있는 경우
- 설정 파일 설정만으로 동작

### 3. 하이브리드 모드 (`hybrid`)

- `--paths` 옵션이 제공되고 설정 파일도 있는 경우
- CLI 옵션이 설정 파일 설정을 오버라이드

## 주의사항

- `--paths` 옵션은 CLI 사용 시 필수입니다
- `outputFile`로 지정된 파일은 자동으로 제외되어 무한 루프를 방지합니다
- `excludes` 패턴은 glob 패턴을 지원합니다 (`*.d.ts`, `*test*` 등)
- 설정 파일을 사용할 때는 `paths` 필드가 필요합니다
