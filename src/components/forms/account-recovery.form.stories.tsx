import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router';
import AccountRecoveryForm from './account-recovery.form';

const meta = {
  title: 'Forms/AccountRecoveryForm',
  component: AccountRecoveryForm,
  parameters: {
    layout: 'centered',
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
} satisfies Meta<typeof AccountRecoveryForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Users can enter username/email, temporary recovery code, and a new password to recover their account.',
      },
    },
  },
};

export const WithPreFilledEmail: Story = {
  args: {
    preFilledEmail: 'user@example.com',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Form with username/email pre-filled from existing session context.',
      },
    },
  },
};
