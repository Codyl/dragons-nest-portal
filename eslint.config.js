import pluginRouter from '@tanstack/eslint-plugin-router'
import cypressPlugin from 'eslint-plugin-cypress'
import react from 'eslint-plugin-react'
import tseslint from 'typescript-eslint'

export default [
  {
    ...pluginRouter.configs['flat/recommended'],
    files: ['src/**/*.{ts,tsx}'],
  },
  {
    files: ['src/**/*.cy.tsx', 'cypress/**/*.cy.tsx'],
    plugins: {
      cypress: cypressPlugin,
      '@typescript-eslint': tseslint,
      react: react,
    },
    extends: [
      cypressPlugin.configs.recommended,
    ],
    rules: {
      ...react.configs.recommended.rules,
    }
  },
]