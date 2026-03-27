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
import CreatePasswordForm from './create-password.form';
import {
  createPasswordSuccessHandlers,
  createPasswordErrorHandlers,
  createPasswordLoadingHandlers,
  createPasswordNetworkErrorHandlers,
} from '../../../.storybook/msw-handlers';

/** Reference story patterns: `reset-password.form.stories.tsx` (forgot/reset flow). */

const fillForm = async (
  canvas: ReturnType<typeof within>,
  newPassword: string,
  confirmPassword: string,
) => {
  const newPasswordInput = canvas.getByLabelText('New password');
  const confirmInput = canvas.getByLabelText('Confirm new password');
  await userEvent.type(newPasswordInput, newPassword);
  await userEvent.type(confirmInput, confirmPassword);
};

const submitForm = async (canvas: ReturnType<typeof within>) => {
  const submitButton = canvas.getByRole('button', { name: 'Create password' });
  await userEvent.click(submitButton);
};

const meta = {
  title: 'Forms/CreatePasswordForm',
  component: CreatePasswordForm,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: createPasswordSuccessHandlers,
    },
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
      const rootRoute = createRootRoute({
        component: () => <Story />,
      });
      const routeTree = rootRoute.addChildren([
        createRoute({ getParentRoute: () => rootRoute, path: '/' }),
        createRoute({
          getParentRoute: () => rootRoute,
          path: '/security-settings',
        }),
      ]);
      const router = createRouter({
        routeTree,
        history: createMemoryHistory({
          initialEntries: ['/'],
        }),
        defaultPendingMinMs: 0,
      });
      return (
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof CreatePasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: { handlers: createPasswordSuccessHandlers },
    docs: {
      description: {
        story:
          'Logged-in OAuth users set an initial password (no old password).',
      },
    },
  },
};

export const Success: Story = {
  parameters: {
    msw: { handlers: createPasswordSuccessHandlers },
    docs: {
      description: {
        story:
          'Successful submit navigates to security settings (see play interaction).',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, 'NewPassword123!', 'NewPassword123!');
    await submitForm(canvas);
  },
};

export const Error: Story = {
  parameters: {
    msw: { handlers: createPasswordErrorHandlers },
    docs: {
      description: {
        story: 'API error message is shown below the form.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, 'NewPassword123!', 'NewPassword123!');
    await submitForm(canvas);
  },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: createPasswordLoadingHandlers },
    docs: {
      description: {
        story: 'Submit button shows loading while the request is in flight.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, 'NewPassword123!', 'NewPassword123!');
    await submitForm(canvas);
  },
};

export const NetworkError: Story = {
  parameters: {
    msw: { handlers: createPasswordNetworkErrorHandlers },
    docs: {
      description: {
        story: 'Network failure surfaces as a mutation error.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, 'NewPassword123!', 'NewPassword123!');
    await submitForm(canvas);
  },
};

export const PasswordsDoNotMatch: Story = {
  parameters: {
    msw: { handlers: createPasswordSuccessHandlers },
    docs: {
      description: {
        story: 'Client-side validation when passwords do not match.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, 'NewPassword123!', 'OtherPassword123!');
    await submitForm(canvas);
  },
};

export const PasswordTooShort: Story = {
  parameters: {
    msw: { handlers: createPasswordSuccessHandlers },
    docs: {
      description: {
        story: 'Password must meet the same rules as change/reset password.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, 'Short1!', 'Short1!');
    await submitForm(canvas);
  },
};
