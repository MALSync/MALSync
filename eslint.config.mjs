import globals from 'globals';
import { useConfig } from './config/eslint/eslint.mjs';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      'dist/',
      'node_modules/',
      'test/dist',
      '*.min.js',
      'docs/',
      'package/',
      'eslint/',
      'test/', // TODO
      'webpackConfig/', // TODO
    ],
  },
  await useConfig({
    preset: ['vue-typescript'],
    config: {
      files: ['src/**/*.vue'],
      languageOptions: {
        parserOptions: {
          project: 'tsconfig.json',
        },
        globals: {
          api: 'readonly',
          con: 'readonly',
          j: 'readonly',
          utils: 'readonly',
          __MAL_SYNC_KEYS__: 'readonly',
        },
      },
    },
  }),
  {
    files: ['src/_minimal/**/*'],
    languageOptions: {
      globals: {
        ...globals.jquery,
        ...globals.webextensions,
      },
    },
    rules: {
      '@typescript-eslint/no-throw-literal': 'warn',
      'import/no-cycle': [
        'error',
        {
          allowUnsafeDynamicCyclicDependency: true,
        },
      ],
    },
  },
  await useConfig({
    preset: ['typescript'],
    config: {
      files: ['src/background/**/*.ts'],
      languageOptions: {
        parserOptions: {
          project: 'tsconfig.json',
        },
        globals: {
          ...globals.webextensions,
          ...globals.serviceworker,
          api: 'readonly',
          con: 'readonly',
          utils: 'readonly',
        },
      },
      rules: {
        // Following overrides must be removed in order to have a safe code
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        '@typescript-eslint/no-unsafe-return': 'warn',
        '@typescript-eslint/no-use-before-define': 'warn',
        '@typescript-eslint/require-await': 'warn',
        '@typescript-eslint/no-misused-promises': 'warn',
        '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
        '@typescript-eslint/no-require-imports': 'warn',
        'no-unused-vars': 'warn',
        '@typescript-eslint/naming-convention': 'warn',
        '@typescript-eslint/no-throw-literal': 'warn',
        '@typescript-eslint/only-throw-error': 'warn',
      },
    },
  }),
  await useConfig({
    preset: ['typescript-dom'],
    config: {
      files: ['src/**/*.ts'],
      ignores: ['src/background/**/*.ts'],
      languageOptions: {
        parserOptions: {
          project: ['tsconfig.json'],
        },
        globals: {
          api: 'readonly',
          con: 'readonly',
          j: 'readonly',
          utils: 'readonly',
        },
      },
      rules: {
        // Following overrides must be removed in order to have a safe code
        'no-unexpected-multiline': 'warn',
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        '@typescript-eslint/no-unsafe-return': 'warn',
        '@typescript-eslint/no-use-before-define': 'warn',
        '@typescript-eslint/require-await': 'warn',
        '@typescript-eslint/no-misused-promises': 'warn',
        '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
        '@typescript-eslint/no-require-imports': 'warn',
        'no-unused-vars': 'warn',
        '@typescript-eslint/no-for-in-array': 'warn',
        '@typescript-eslint/restrict-template-expressions': 'warn',
        '@typescript-eslint/unbound-method': 'warn',
        '@typescript-eslint/restrict-plus-operands': 'warn',
        '@typescript-eslint/no-redundant-type-constituents': 'warn',
        '@typescript-eslint/no-shadow': 'warn',
        '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
        '@typescript-eslint/naming-convention': 'warn',
        '@typescript-eslint/no-throw-literal': 'warn',
        '@typescript-eslint/only-throw-error': 'warn',
        '@typescript-eslint/no-unsafe-function-type': 'warn',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-empty-object-type': 'warn',
        '@typescript-eslint/prefer-promise-reject-errors': 'warn',
      },
    },
  }),
  await useConfig({
    preset: ['node', 'config'],
    config: {
      files: [
        '*.{js,mjs,cjs}',
        'config/**/*.{js,mjs,cjs}',
        'webpackConfig/**/*.{js,mjs,cjs}',
        'package/**/*.{js,mjs,cjs}',
      ],
      languageOptions: {
        ecmaVersion: 2024,
      },
      rules: {
        'es-x/no-top-level-await': 'off',
      },
    },
  }),
];
