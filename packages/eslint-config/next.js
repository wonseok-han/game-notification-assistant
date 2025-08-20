import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import pluginNext from '@next/eslint-plugin-next';
import { config as reactInternalConfig } from './react-internal.js';

/**
 * Next.js를 사용하는 라이브러리를 위한 커스텀 ESLint 설정입니다.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const nextJsConfig = [
  // React 내부 설정을 기반으로 확장
  ...reactInternalConfig,
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    plugins: {
      '@next/next': pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off', // React scope 규칙을 명시적으로 off로 설정 (JSX Transform 사용 시 불필요)
    },
  },
];
