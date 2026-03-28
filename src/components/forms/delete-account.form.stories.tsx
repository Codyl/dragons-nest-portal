import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router';
import { userEvent, within } from 'storybook/test';
import { GoogleOAuthProvider } from '@react-oauth/google';
import DeleteAccountForm from './delete-account.form';
import {
  deleteUserSuccessHandlers,
  deleteUserErrorHandlers,
  deleteUserLoadingHandlers,
  deleteUserNetworkErrorHandlers,
} from '../../../.storybook/msw-handlers';

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ?? 'stub.apps.googleusercontent.com';

type UserMePayload = {
  message: string;
  data: {
    email?: string;
    hasPassword?: boolean;
    softwareTokenMfaEnabled?: boolean;
    loginMethods?: string[];
    hasPasskey?: boolean;
    passkeyCount?: number;
  };
};

const defaultUserMe: UserMePayload = {
  message: 'ok',
  data: {
    email: 'user@example.com',
    hasPassword: true,
    softwareTokenMfaEnabled: false,
    loginMethods: [],
    hasPasskey: false,
    passkeyCount: 0,
  },
};

const fillPasswordForm = async (
  canvas: ReturnType<typeof within>,
  password: string,
  opts?: { mfaCode?: string },
) => {
  const passwordInput = canvas.getByLabelText('Password');
  await userEvent.type(passwordInput, password);
  if (opts?.mfaCode) {
    const mfaInput = canvas.getByLabelText('Authenticator code');
    await userEvent.type(mfaInput, opts.mfaCode);
  }
};

const submitForm = async (canvas: ReturnType<typeof within>) => {
  const submitButton = canvas.getByRole('button', { name: 'Delete Account' });
  await userEvent.click(submitButton);
};

const meta = {
  title: 'Forms/DeleteAccountForm',
  component: DeleteAccountForm,
  parameters: {
    layout: 'centered',
    userMe: defaultUserMe,
    msw: {
      handlers: deleteUserSuccessHandlers,
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      const userMe = (context.parameters.userMe ??
        defaultUserMe) as UserMePayload;
      queryClient.setQueryData(['user', 'me'], userMe);
      const rootRoute = createRootRoute({
        component: () => <Story />,
      });
      const routeTree = rootRoute.addChildren([
        createRoute({ getParentRoute: () => rootRoute, path: '/' }),
      ]);
      const router = createRouter({
        routeTree,
        history: createMemoryHistory(),
        defaultPendingMinMs: 0,
      });
      return (
        <QueryClientProvider client={queryClient}>
          <GoogleOAuthProvider clientId={googleClientId}>
            <RouterProvider router={router} />
          </GoogleOAuthProvider>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof DeleteAccountForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Reference: `Success` / `PasswordWithTotp` — MSW delete profile + react-query + router (same shell as other form stories). */
export const Default: Story = {
  parameters: {
    msw: { handlers: deleteUserSuccessHandlers },
    docs: {
      description: {
        story:
          'Password confirmation only when the account has a password and no TOTP MFA. Google-only accounts use Google sign-in instead.',
      },
    },
  },
};

export const PasswordWithTotp: Story = {
  parameters: {
    userMe: {
      message: 'ok',
      data: {
        ...defaultUserMe.data,
        softwareTokenMfaEnabled: true,
      },
    },
    msw: { handlers: deleteUserSuccessHandlers },
    docs: {
      description: {
        story:
          'Password plus authenticator code when software-token MFA is enabled.',
      },
    },
  },
};

export const GoogleOnly: Story = {
  parameters: {
    userMe: {
      message: 'ok',
      data: {
        email: 'user@example.com',
        hasPassword: false,
        loginMethods: ['GOOGLE'],
        hasPasskey: false,
        passkeyCount: 0,
      },
    },
    msw: { handlers: deleteUserSuccessHandlers },
    docs: {
      description: {
        story:
          'Google-only accounts confirm deletion with Google sign-in (requires VITE_GOOGLE_CLIENT_ID in local Storybook).',
      },
    },
  },
};

export const Success: Story = {
  parameters: {
    userMe: {
      message: 'ok',
      data: {
        ...defaultUserMe.data,
        softwareTokenMfaEnabled: true,
      },
    },
    msw: { handlers: deleteUserSuccessHandlers },
    docs: {
      description: {
        story:
          'Successful deletion with password and TOTP when MFA is enabled.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillPasswordForm(canvas, 'Password123!', { mfaCode: '123456' });
    await submitForm(canvas);
  },
};

export const SuccessPasswordOnly: Story = {
  parameters: {
    msw: { handlers: deleteUserSuccessHandlers },
    docs: {
      description: {
        story:
          'Deletion when the account has a password and no TOTP MFA (no authenticator field).',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillPasswordForm(canvas, 'Password123!');
    await submitForm(canvas);
  },
};

export const Error: Story = {
  parameters: {
    msw: { handlers: deleteUserErrorHandlers },
    docs: {
      description: {
        story:
          'Error state when the password is invalid. Submit the form to see the error message displayed.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillPasswordForm(canvas, 'WrongPassword!');
    await submitForm(canvas);
  },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: deleteUserLoadingHandlers },
    docs: {
      description: {
        story:
          'Loading state while the delete request is in progress.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillPasswordForm(canvas, 'Password123!');
    await submitForm(canvas);
  },
};

export const NetworkError: Story = {
  parameters: {
    msw: { handlers: deleteUserNetworkErrorHandlers },
    docs: {
      description: {
        story:
          'Network error while deleting. Submit the form to see how failures are surfaced.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillPasswordForm(canvas, 'Password123!');
    await submitForm(canvas);
  },
};

export const ValidationErrorEmptyPassword: Story = {
  parameters: {
    msw: { handlers: deleteUserSuccessHandlers },
    docs: {
      description: {
        story:
          'Validation when password is too short or empty. Submit to see the validation error.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await submitForm(canvas);
  },
};

export const ValidationErrorMissingTotp: Story = {
  parameters: {
    userMe: {
      message: 'ok',
      data: {
        ...defaultUserMe.data,
        softwareTokenMfaEnabled: true,
      },
    },
    msw: { handlers: deleteUserSuccessHandlers },
    docs: {
      description: {
        story:
          'When TOTP MFA is enabled, submit requires a 6-digit authenticator code.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillPasswordForm(canvas, 'Password123!');
    await submitForm(canvas);
  },
};
