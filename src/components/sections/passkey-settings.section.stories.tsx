import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PasskeySettingsSection from './passkey-settings.section';
import {
  handlers,
  loginMethodSectionPasskeyRegisteredHandlers,
  passkeySectionTwoPasskeysHandlers,
  replacePasskeysInHandlers,
} from '../../../.storybook/msw-handlers';

const samplePasskeyOne = [
  {
    credentialId: 'cred-story-1',
    displayName: 'iCloud Keychain',
    provider: 'apple_icloud',
    createdAt: '2023-12-31T00:00:00.000Z',
    lastUsedAt: '2023-12-31T00:00:00.000Z',
  },
];

const samplePasskeysTwo = [
  {
    credentialId: 'c1',
    displayName: 'iCloud Keychain',
    provider: 'apple_icloud',
    createdAt: '2023-12-31T00:00:00.000Z',
    lastUsedAt: '2023-12-31T00:00:00.000Z',
  },
  {
    credentialId: 'c2',
    displayName: 'Windows Hello',
    provider: 'windows_hello',
    createdAt: '2023-12-15T00:00:00.000Z',
    lastUsedAt: '2023-12-20T00:00:00.000Z',
  },
];

const meta = {
  title: 'Sections/PasskeySettingsSection',
  component: PasskeySettingsSection,
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
} satisfies Meta<typeof PasskeySettingsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: { handlers },
    docs: {
      description: {
        story:
          'Rich passkey intro (headline, explanation, CTA) with no passkeys yet; aligns with Google passkey UX guidance.',
      },
    },
  },
};

export const OnePasskeySaved: Story = {
  parameters: {
    msw: {
      handlers: replacePasskeysInHandlers(
        loginMethodSectionPasskeyRegisteredHandlers,
        samplePasskeyOne,
      ),
    },
    docs: {
      description: {
        story:
          'List row with display name, created/last-used dates, remove control, and create CTA.',
      },
    },
  },
};

export const TwoPasskeysSaved: Story = {
  parameters: {
    msw: {
      handlers: replacePasskeysInHandlers(
        passkeySectionTwoPasskeysHandlers,
        samplePasskeysTwo,
      ),
    },
    docs: {
      description: {
        story:
          'Multiple passkeys: rows match Trailblazer-style metadata from GET /profile/passkeys.',
      },
    },
  },
};
