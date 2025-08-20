# @repo/ui

Utilities Kit의 공유 UI 컴포넌트 라이브러리입니다.

## 📦 설치

```bash
pnpm add @repo/ui
```

## 🚀 사용법

```tsx
import { ActionButton, CodeTextarea, MonacoEditor } from '@repo/ui';

function MyComponent() {
  return (
    <div>
      <ActionButton variant="primary" onClick={() => console.log('clicked')}>
        클릭하세요
      </ActionButton>

      <CodeTextarea value="console.log('Hello World')" language="javascript" />

      <MonacoEditor
        value="// 코드를 작성하세요"
        language="typescript"
        onChange={(value) => console.log(value)}
      />
    </div>
  );
}
```

## 🎨 스타일링

이 패키지는 Tailwind CSS를 사용합니다. 프로젝트에 Tailwind CSS가 설정되어 있는지 확인하세요.

```css
@import '@repo/ui/styles.css';
```

## 🔧 개발

```bash
# 개발 모드 실행
pnpm run dev

# 빌드
pnpm run build

# 타입 체크
pnpm run check-types
```

## 📁 구조

```
src/
├── components/           # UI 컴포넌트들
│   ├── action-button.tsx
│   ├── code-textarea.tsx
│   ├── monaco-editor.tsx
│   ├── snackbar/        # 스낵바 관련 컴포넌트
│   ├── tiptap-editor/   # TipTap 에디터 관련
│   └── tool-card.tsx
├── hooks/               # 커스텀 훅
├── utils/               # 유틸리티 함수
└── styles.css           # 전역 스타일
```

## 🔗 관련 링크

- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [TipTap Editor](https://tiptap.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
