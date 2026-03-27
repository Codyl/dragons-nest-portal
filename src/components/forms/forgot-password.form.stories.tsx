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
import ForgotPasswordForm from './forgot-password.form';
import {
  forgotPasswordSuccessHandlers,
  forgotPasswordErrorHandlers,
  forgotPasswordLoadingHandlers,
  forgotPasswordNetworkErrorHandlers,
} from '../../../.storybook/msw-handlers';

const fillForm = async (
  canvas: ReturnType<typeof within>,
  username: string,
) => {
  const input = canvas.getByLabelText('Username or email');
  await userEvent.clear(input);
  await userEvent.type(input, username);
};

const submitForm = async (canvas: ReturnType<typeof within>) => {
  const submitButton = canvas.getByRole('button', { name: 'Send Reset Code' });
  await userEvent.click(submitButton);
};

const meta = {
  title: 'Forms/ForgotPasswordForm',
  component: ForgotPasswordForm,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: forgotPasswordSuccessHandlers,
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
  ],
  args: {
    preFilledEmail: undefined,
  },
} satisfies Meta<typeof ForgotPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: { handlers: forgotPasswordSuccessHandlers },
    docs: {
      description: {
        story: 'Enter username or email to receive a password reset code.',
      },
    },
  },
};

export const WithPreFilledEmail: Story = {
  args: {
    preFilledEmail: 'user@example.com',
  },
  parameters: {
    msw: { handlers: forgotPasswordSuccessHandlers },
    docs: {
      description: {
        story: 'Form with email pre-filled from security settings.',
      },
    },
  },
};

export const Success: Story = {
  parameters: {
    msw: { handlers: forgotPasswordSuccessHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates a successful forgot password request. Submit the form to see the success flow.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, 'user@example.com');
    await submitForm(canvas);
  },
};

export const Error: Story = {
  parameters: {
    msw: { handlers: forgotPasswordErrorHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates an error state when the user is not found. Submit the form to see the error message displayed.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, 'user@example.com');
    await submitForm(canvas);
  },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: forgotPasswordLoadingHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates the loading state when the request is in progress. Submit the form to see the button disabled with loading for 2 seconds.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, 'user@example.com');
    await submitForm(canvas);
  },
};

export const NetworkError: Story = {
  parameters: {
    msw: { handlers: forgotPasswordNetworkErrorHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates a network error state. Submit the form to see how the component handles network failures.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, 'user@example.com');
    await submitForm(canvas);
  },
};

export const ValidationErrorEmptyUsername: Story = {
  parameters: {
    msw: { handlers: forgotPasswordSuccessHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates form validation when username is empty. Submit the form to see the validation error.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, '');
    await submitForm(canvas);
  },
};
