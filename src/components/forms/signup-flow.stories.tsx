import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  createMemoryHistory,
  Outlet,
} from '@tanstack/react-router';
import SignupFlow from './signup-flow';

const meta = {
  title: 'Forms/SignupFlow',
  component: SignupFlow,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Signup wizard: age gate then email/password (student vs adult by age; under 13 uses guardian adult account). Onboarding continues after sign-in.',
      },
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
        component: () => <Outlet />,
      });
      const indexRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/',
        component: () => <Story />,
      });
      const confirmRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/confirm-signup',
        component: () => (
          <div data-testid="story-confirm-placeholder">
            Confirm signup (story)
          </div>
        ),
      });
      const routeTree = rootRoute.addChildren([indexRoute, confirmRoute]);
      const router = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: ['/'] }),
        defaultPendingMinMs: 0,
      });
      return (
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof SignupFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
