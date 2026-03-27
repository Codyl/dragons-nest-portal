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
import ResetPasswordForm from './reset-password.form';
import {
  confirmForgotPasswordSuccessHandlers,
  confirmForgotPasswordErrorHandlers,
  confirmForgotPasswordLoadingHandlers,
  confirmForgotPasswordNetworkErrorHandlers,
} from '../../../.storybook/msw-handlers';

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
  const submitButton = canvas.getByRole('button', { name: 'Reset password' });
  await userEvent.click(submitButton);
};

const meta = {
  title: 'Forms/ResetPasswordForm',
  component: ResetPasswordForm,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: confirmForgotPasswordSuccessHandlers,
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
      ]);
      const router = createRouter({
        routeTree,
        history: createMemoryHistory(),
        defaultPendingMinMs: 0,
      });
      return (
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      );
    },
    (Story) => {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('username', 'test@example.com');
        sessionStorage.setItem('code', '123456');
      }
      return <Story />;
    },
  ],
} satisfies Meta<typeof ResetPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: { handlers: confirmForgotPasswordSuccessHandlers },
    docs: {
      description: {
        story:
          'Enter new password and confirm to reset after receiving the code.',
      },
    },
  },
};

export const Success: Story = {
  parameters: {
    msw: { handlers: confirmForgotPasswordSuccessHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates a successful password reset. Submit the form to see the success flow.',
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
    msw: { handlers: confirmForgotPasswordErrorHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates an error state when the code is invalid. Submit the form to see the error message displayed.',
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
    msw: { handlers: confirmForgotPasswordLoadingHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates the loading state when the request is in progress. Submit the form to see the button disabled with loading for 2 seconds.',
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
    msw: { handlers: confirmForgotPasswordNetworkErrorHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates a network error state. Submit the form to see how the component handles network failures.',
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
    msw: { handlers: confirmForgotPasswordSuccessHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates form validation when passwords don't match. Submit the form to see the validation error.",
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
    msw: { handlers: confirmForgotPasswordSuccessHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates form validation when the password is too short. Submit the form to see the validation error.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, 'Short1!', 'Short1!');
    await submitForm(canvas);
  },
};
