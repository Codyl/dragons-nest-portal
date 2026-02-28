import pluginRouter from '@tanstack/eslint-plugin-router';
import cypressPlugin from 'eslint-plugin-cypress';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ...pluginRouter.configs['flat/recommended'],
    files: ['src/**/*.{ts,tsx}'],
  },
  {
    files: ['src/**/*.cy.tsx', 'cypress/**/*.cy.tsx'],
    plugins: {
      cypress: cypressPlugin,
      '@typescript-eslint': tseslint.plugin,
      react: react,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...cypressPlugin.configs.recommended.rules,
      ...react.configs.recommended.rules,

      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: ['function', 'class', 'if'],
          next: '*',
        },
      ],
    },
  },
];
