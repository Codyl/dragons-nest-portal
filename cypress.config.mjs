import { defineConfig } from 'cypress';
import path from 'path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  component: {
    supportFile: './cypress/support/component.tsx',
    devServer: {
      framework: 'react',
      bundler: 'vite',
      // Force backend auth path in component tests so we can intercept auth/initiate-login
      // instead of hitting Amplify/Cognito (avoids "Auth UserPool not configured").
      // Include project plugins (incl. tailwind) so component tests match app build and styling.
      viteConfig: {
        plugins: [
          tanstackRouter({
            target: 'react',
            autoCodeSplitting: true,
            routeFileIgnorePattern: '.((e2e)|(cy)).ts',
          }),
          react(),
          tailwindcss(),
        ],
        resolve: {
          alias: {
            '@': path.resolve(dirname, './src'),
          },
        },
        define: {
          'import.meta.env.VITE_COGNITO_USER_POOL_ID': JSON.stringify(''),
          'import.meta.env.VITE_COGNITO_CLIENT_ID': JSON.stringify(''),
        },
      },
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
});
