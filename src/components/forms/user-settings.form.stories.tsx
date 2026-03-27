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
import UserSettingsForm from './user-settings.form';
import {
  userSettingsSuccessHandlers,
  userSettingsErrorHandlers,
  userSettingsLoadingHandlers,
  userSettingsNetworkErrorHandlers,
} from '../../../.storybook/msw-handlers';

const fillForm = async (
  canvas: ReturnType<typeof within>,
  updates: { given_name?: string; family_name?: string; email?: string },
) => {
  if (updates.email !== undefined) {
    const emailInput = canvas.getByLabelText('Email');
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, updates.email);
  }
  if (updates.given_name !== undefined) {
    const firstInput = canvas.getByLabelText('First');
    await userEvent.clear(firstInput);
    await userEvent.type(firstInput, updates.given_name);
  }
  if (updates.family_name !== undefined) {
    const lastInput = canvas.getByLabelText('Last');
    await userEvent.clear(lastInput);
    await userEvent.type(lastInput, updates.family_name);
  }
};

const submitForm = async (canvas: ReturnType<typeof within>) => {
  const submitButton = canvas.getByRole('button', { name: 'Update' });
  await userEvent.click(submitButton);
};

const meta = {
  title: 'Forms/UserSettingsForm',
  component: UserSettingsForm,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: userSettingsSuccessHandlers,
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
} satisfies Meta<typeof UserSettingsForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: { handlers: userSettingsSuccessHandlers },
    docs: {
      description: {
        story:
          'User profile settings form. Fetches user data and allows updating email, name, and phone.',
      },
    },
  },
};

export const Success: Story = {
  parameters: {
    msw: { handlers: userSettingsSuccessHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates a successful settings update. Change a field and submit to see the success flow.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, {
      email: 'example@email.com',
      given_name: 'Jane',
      family_name: 'Smith',
    });
    await submitForm(canvas);
  },
};

export const Error: Story = {
  parameters: {
    msw: { handlers: userSettingsErrorHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates an error state when the update fails. Submit the form to see the error message displayed.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, { family_name: 'test' });
    await submitForm(canvas);
  },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: userSettingsLoadingHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates the loading state when the update request is in progress. Submit the form to see the button disabled with loading for 2 seconds.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, { email: 'example@email.com', given_name: 'Jane' });
    await submitForm(canvas);
  },
};

export const NetworkError: Story = {
  parameters: {
    msw: { handlers: userSettingsNetworkErrorHandlers },
    docs: {
      description: {
        story:
          'This story demonstrates a network error state. Submit the form to see how the component handles network failures.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, { email: 'example@email.com', given_name: 'Jane' });
    await submitForm(canvas);
  },
};
