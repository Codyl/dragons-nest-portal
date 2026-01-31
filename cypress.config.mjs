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
    baseUrl: 'http://localhost:6006',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    testIsolation: false, // required by cypress-storybook so before() visitStorybook works
  },
});
