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
import ConfirmSignupForm from './confirm-signup.form';
import {
  confirmSignupSuccessHandlers,
  confirmSignupErrorHandlers,
  confirmSignupLoadingHandlers,
  confirmSignupNetworkErrorHandlers,
} from '../../../.storybook/msw-handlers';

const fillForm = async (canvas: ReturnType<typeof within>, code: string) => {
  const codeInput = canvas.getByLabelText('Verification code');
  await userEvent.type(codeInput, code);
};

const submitForm = async (canvas: ReturnType<typeof within>) => {
  const submitButton = canvas.getByRole('button', { name: 'Verify Email' });
  await userEvent.click(submitButton);
};

const meta = {
  title: 'Forms/ConfirmSignupForm',
  component: ConfirmSignupForm,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: confirmSignupSuccessHandlers,
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
        sessionStorage.setItem('password', 'Password123!');
      }
      return <Story />;
    },
  ],
} satisfies Meta<typeof ConfirmSignupForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: { handlers: confirmSignupSuccessHandlers },
    docs: {
      description: {
        story:
          'Enter the 6-digit verification code sent to your email to confirm signup.',
      },
    },
  },
};

export const Success: Story = {
  parameters: {
    msw: { handlers: confirmSignupSuccessHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates a successful signup confirmation. Submit the form to see the success flow.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, '123456');
    await submitForm(canvas);
  },
};

export const Error: Story = {
  parameters: {
    msw: { handlers: confirmSignupErrorHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates an error state when the verification code is invalid. Submit the form to see the error message displayed.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, '123456');
    await submitForm(canvas);
  },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: confirmSignupLoadingHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates the loading state when the confirmation request is in progress. Submit the form to see the button show 'Verifying...' for 2 seconds.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, '123456');
    await submitForm(canvas);
  },
};

export const NetworkError: Story = {
  parameters: {
    msw: { handlers: confirmSignupNetworkErrorHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates a network error state. Submit the form to see how the component handles network failures.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, '123456');
    await submitForm(canvas);
  },
};

export const ValidationErrorCodeTooShort: Story = {
  parameters: {
    msw: { handlers: confirmSignupSuccessHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates form validation when the code is too short (less than 6 digits). Submit the form to see the validation error.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, '12345');
    await submitForm(canvas);
  },
};

export const ValidationErrorEmptyCode: Story = {
  parameters: {
    msw: { handlers: confirmSignupSuccessHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates form validation when the code is empty. Submit the form to see the validation error.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await submitForm(canvas);
  },
};
