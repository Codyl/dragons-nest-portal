import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router';
import { fn, userEvent, within } from 'storybook/test';
import ChangePasswordForm from './change-password.form';
import {
  successHandlers,
  errorHandlers,
  loadingHandlers,
  networkErrorHandlers,
} from '../../../.storybook/msw-handlers';

const fillForm = async (
  canvas: ReturnType<typeof within>,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
) => {
  const currentPasswordInput = canvas.getByLabelText('Current password');
  const newPasswordInput = canvas.getByLabelText('New password');
  const confirmPasswordInput = canvas.getByLabelText('Confirm new password');
  await userEvent.type(currentPasswordInput, currentPassword);
  await userEvent.type(newPasswordInput, newPassword);
  await userEvent.type(confirmPasswordInput, confirmPassword);
};

const submitForm = async (canvas: ReturnType<typeof within>) => {
  const submitButton = canvas.getByRole('button', { name: 'Change password' });
  await userEvent.click(submitButton);
};

const meta = {
  title: 'Forms/ChangePasswordForm',
  component: ChangePasswordForm,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: successHandlers, // Default to success handlers
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
    onPasswordChangeSuccess: fn(),
  },
} satisfies Meta<typeof ChangePasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story - renders the form with default values
export const Default: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: successHandlers,
    },
    docs: {
      description: {
        story:
          'The default state of the change password form. The form is pre-filled with example values. Submit the form to see a successful API response.',
      },
    },
  },
};

// Success state - demonstrates successful password change
export const Success: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: successHandlers,
    },
    docs: {
      description: {
        story:
          'This story demonstrates a successful password change. Submit the form to see the success callback triggered. The form will call `onPasswordChangeSuccess` when the mutation succeeds.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(
      canvas,
      'Password123!',
      'NewPassword123!',
      'NewPassword123!',
    );
    await submitForm(canvas);
  },
};

// Error state - demonstrates API error
export const Error: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: errorHandlers,
    },
    docs: {
      description: {
        story:
          'This story demonstrates an error state when the password change fails. Submit the form to see the error message displayed below the form fields.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(
      canvas,
      'Password123!',
      'NewPassword123!',
      'NewPassword123!',
    );
    await submitForm(canvas);
  },
};

// Loading state - demonstrates pending state
export const Loading: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: loadingHandlers,
    },
    docs: {
      description: {
        story:
          'This story demonstrates the loading state when the password change request is in progress. Submit the form to see the submit button disabled with a loading indicator for 2 seconds.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(
      canvas,
      'Password123!',
      'NewPassword123!',
      'NewPassword123!',
    );
    await submitForm(canvas);
  },
};

// Network error state
export const NetworkError: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: networkErrorHandlers,
    },
    docs: {
      description: {
        story:
          'This story demonstrates a network error state. Submit the form to see how the component handles network failures.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(
      canvas,
      'Password123!',
      'NewPassword123!',
      'NewPassword123!',
    );
    await submitForm(canvas);
  },
};

// Validation error - passwords don't match
export const PasswordsDoNotMatch: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: successHandlers, // Still use success handler, validation happens client-side
    },
    docs: {
      description: {
        story:
          "This story demonstrates form validation when passwords don't match. Try changing the 'Confirm new password' field to a different value than 'New password' and submit the form. You'll see a validation error message: 'Passwords do not match'.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(
      canvas,
      'Password123!',
      'NewPassword113!',
      'NewPassword123!',
    );
    await submitForm(canvas);
  },
};

// Validation error - password too short
export const PasswordTooShort: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: successHandlers,
    },
    docs: {
      description: {
        story:
          "This story demonstrates form validation when the password is too short (less than 8 characters). Try changing the 'New password' field to something like 'Short1!' (7 characters) and submit the form. You'll see a validation error message: 'Password must be at least 8 characters long'.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, 'Password123!', '12312312', '12312312');
    await submitForm(canvas);
  },
};

// Validation error - password missing uppercase letter
export const PasswordMissingUppercase: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: successHandlers,
    },
    docs: {
      description: {
        story:
          "This story demonstrates form validation when the password doesn't contain an uppercase letter. Try changing the 'New password' field to something like 'password123!' (all lowercase) and submit the form. You'll see a validation error message.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, 'Password123!', 'password123!', 'password123!');
    await submitForm(canvas);
  },
};

// Validation error - password missing lowercase letter
export const PasswordMissingLowercase: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: successHandlers,
    },
    docs: {
      description: {
        story:
          "This story demonstrates form validation when the password doesn't contain a lowercase letter. Try changing the 'New password' field to something like 'PASSWORD123!' (all uppercase) and submit the form. You'll see a validation error message.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, 'Password123!', 'PASSWORD123!', 'PASSWORD123!');
    await submitForm(canvas);
  },
};

// Validation error - password missing number
export const PasswordMissingNumber: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: successHandlers,
    },
    docs: {
      description: {
        story:
          "This story demonstrates form validation when the password doesn't contain a number. Try changing the 'New password' field to something like 'Password!' (no numbers) and submit the form. You'll see a validation error message.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, 'Password!', 'Password!', 'Password!');
    await submitForm(canvas);
  },
};

// Incomplete form - empty fields
export const IncompleteForm: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: successHandlers,
    },
    docs: {
      description: {
        story:
          "This story demonstrates form validation when fields are empty. Clear all the fields and submit the form. You'll see validation error messages for each required field: 'Current password is required', 'Password must be at least 8 characters long', and 'Please confirm your password'.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await submitForm(canvas);
  },
};
