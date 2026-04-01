import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';

import { PrivateAppSidebar } from './private-app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

/**
 * Story reference: `src/components/ui/button.stories.tsx` (Meta layout, tags, decorators).
 */
const meta = {
  title: 'Layout/PrivateAppSidebar',
  component: PrivateAppSidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const initialPath =
        (context.parameters.initialPath as string | undefined) ?? '/';
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      queryClient.setQueryData(['user', 'me'], {
        message: 'OK',
        data: {
          email: 'alex@example.com',
          given_name: 'Alex',
          family_name: 'User',
        },
      });
      const rootRoute = createRootRoute({
        component: () => (
          <QueryClientProvider client={queryClient}>
            <SidebarProvider>
              <div className="flex h-[min(90vh,560px)] w-full max-w-4xl overflow-hidden rounded-lg border bg-background">
                <Story />
              </div>
            </SidebarProvider>
          </QueryClientProvider>
        ),
      });
      const indexRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/',
      });
      const settingsProfileRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/settings/profile',
      });
      const routeTree = rootRoute.addChildren([
        indexRoute,
        settingsProfileRoute,
      ]);
      const router = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: [initialPath] }),
        defaultPendingMinMs: 0,
      });

      return <RouterProvider router={router} />;
    },
  ],
} satisfies Meta<typeof PrivateAppSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    initialPath: '/',
  },
};

export const SettingsProfileActive: Story = {
  parameters: {
    initialPath: '/settings/profile',
  },
};
