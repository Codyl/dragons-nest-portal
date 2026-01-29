import { defineConfig } from 'cypress';
import { vitePreprocessor } from 'cypress-vite';
import path from 'path';
import { fileURLToPath } from 'url';

export default defineConfig({
  component: {
    supportFile: './cypress/support/component.tsx',
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    // setupNodeEvents(on, config) {
    //   on(
    //     'file:preprocessor',
    //     vitePreprocessor({
    //       configFile: path.resolve(
    //         fileURLToPath(import.meta.url),
    //         './vite.config.cypress.ts',
    //       ),
    //       mode: 'development',
    //     }),
    //   );

    //   return config;
    // },
  },
});
