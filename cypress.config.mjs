import { defineConfig } from 'cypress';

export default defineConfig({
  component: {
    supportFile: './cypress/support/component.tsx',
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
  // E2E against Storybook: pnpm storybook then pnpm cypress:run:e2e
  // App e2e (.e2e.ts): pnpm dev then pnpm cypress:run:e2e:app (uses cypress.app.config.mjs)
  e2e: {
    supportFile: './cypress/support/e2e.ts',
    baseUrl: 'http://localhost:5173',
    specPattern: '**/*.e2e.{js,jsx,ts,tsx}',
    // testIsolation: false, // required by cypress-storybook so before() visitStorybook works
  },
  env: {
    COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
    COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
    COGNITO_CLIENT_SECRET: process.env.COGNITO_CLIENT_SECRET,
    COGNITO_USER_POOL_REGION: process.env.COGNITO_USER_POOL_REGION,
    COGNITO_USER_POOL_CLIENT_ID: process.env.COGNITO_USER_POOL_CLIENT_ID,
    COGNITO_USER_POOL_CLIENT_SECRET:
      process.env.COGNITO_USER_POOL_CLIENT_SECRET,
  },
});
