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
import LoginForm from './login.form';
import {
  loginSuccessHandlers,
  loginErrorHandlers,
  loginLoadingHandlers,
  loginNetworkErrorHandlers,
} from '../../../.storybook/msw-handlers';

const fillForm = async (
  canvas: ReturnType<typeof within>,
  password: string,
) => {
  const passwordInput = canvas.getByLabelText('Password');
  await userEvent.type(passwordInput, password);
};

const submitForm = async (canvas: ReturnType<typeof within>) => {
  const submitButton = canvas.getByRole('button', { name: 'Sign In' });
  await userEvent.click(submitButton);
};

const meta = {
  title: 'Forms/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: loginSuccessHandlers,
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
        sessionStorage.setItem('session', 'test-session');
      }
      return <Story />;
    },
  ],
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: { handlers: loginSuccessHandlers },
    docs: {
      description: {
        story:
          'The login form with username pre-filled from session. Enter password and submit to sign in.',
      },
    },
  },
};

export const Success: Story = {
  parameters: {
    msw: { handlers: loginSuccessHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates a successful login. Submit the form to see the success flow.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, 'Password123!');
    await submitForm(canvas);
  },
};

export const Error: Story = {
  parameters: {
    msw: { handlers: loginErrorHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates an error state when credentials are invalid. Submit the form to see the error message displayed.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, 'WrongPassword!');
    await submitForm(canvas);
  },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: loginLoadingHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates the loading state when the login request is in progress. Submit the form to see 'Signing in...' for 2 seconds.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, 'Password123!');
    await submitForm(canvas);
  },
};

export const NetworkError: Story = {
  parameters: {
    msw: { handlers: loginNetworkErrorHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates a network error state. Submit the form to see how the component handles network failures.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, 'Password123!');
    await submitForm(canvas);
  },
};
export const ValidationErrorPasswordTooShort: Story = {
  parameters: {
    msw: { handlers: loginSuccessHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates form validation when the password is too short (less than 6 characters). Submit the form to see the validation error.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, '12345');
    await submitForm(canvas);
  },
};
