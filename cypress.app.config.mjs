import { defineConfig } from 'cypress';

/**
 * Cypress config for app E2E tests (.e2e.ts).
 * Run against the Vite dev server: pnpm dev (port 5173), then pnpm cypress:run:e2e:app
 */
export default defineConfig({
  e2e: {
    supportFile: './cypress/support/e2e.ts',
    baseUrl: 'http://localhost:5173',
    specPattern: [
      'cypress/e2e/**/*.e2e.{js,jsx,ts,tsx}',
      'src/**/*.e2e.{js,jsx,ts,tsx}',
    ],
    testIsolation: true,
  },
});
