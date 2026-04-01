import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';

import { SettingsShellSidebar } from './settings-shell-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

/**
 * Story reference: `src/components/ui/button.stories.tsx` (Meta layout, tags, decorators).
 */
const meta = {
  title: 'Layout/SettingsShellSidebar',
  component: SettingsShellSidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const initialPath =
        (context.parameters.initialPath as string | undefined) ??
        '/settings/profile';
      const rootRoute = createRootRoute({
        component: () => (
          <SidebarProvider>
            <div className="flex h-[min(90vh,560px)] w-full max-w-4xl overflow-hidden rounded-lg border bg-background">
              <Story />
            </div>
          </SidebarProvider>
        ),
      });
      const homeRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/',
      });
      const settingsProfileRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/settings/profile',
      });
      const settingsSecurityRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/settings/security',
      });
      const routeTree = rootRoute.addChildren([
        homeRoute,
        settingsProfileRoute,
        settingsSecurityRoute,
      ]);
      const router = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: [initialPath] }),
        defaultPendingMinMs: 0,
      });

      return <RouterProvider router={router} />;
    },
  ],
} satisfies Meta<typeof SettingsShellSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProfileSection: Story = {
  parameters: {
    initialPath: '/settings/profile',
  },
};

export const SecuritySection: Story = {
  parameters: {
    initialPath: '/settings/security',
  },
};
