import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
  ],
  env: (config) => ({
    ...config,
    VITE_API_URL: '',
    USER_POOL_ID: 'trash',
    USER_POOL_CLIENT_ID: 'trash',
  }),
  framework: '@storybook/react-vite',
  staticDirs: ['../public'],
  async viteFinal(config) {
    return config;
  },
};
export default config;
