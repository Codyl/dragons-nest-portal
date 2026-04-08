import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginMethodSettingsSection from './login-method-settings.section';
import {
  handlers,
  loginMethodSectionWithGoogleHandlers,
} from '../../../.storybook/msw-handlers';

const meta = {
  title: 'Sections/LoginMethodSettingsSection',
  component: LoginMethodSettingsSection,
  parameters: {
    layout: 'centered',
    msw: { handlers },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof LoginMethodSettingsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: { handlers },
    docs: {
      description: {
        story:
          'Login methods: email/password and Google. Passkeys live in PasskeySettingsSection.',
      },
    },
  },
};

export const WithGoogleLinked: Story = {
  parameters: {
    msw: { handlers: loginMethodSectionWithGoogleHandlers },
    docs: {
      description: {
        story:
          'Login methods when Google is linked. Shows Remove option for Google.',
      },
    },
  },
};
