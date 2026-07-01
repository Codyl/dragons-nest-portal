import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { useState, type ComponentProps } from 'react';

import AddManagedUserSheet from './add-manageduser-sheet';

/** Open-state wrapper for Storybook interaction tests and Cypress `composeStories`. */
export function AddManagedUserSheetHarness({
  defaultOpen = true,
  ...rest
}: Omit<ComponentProps<typeof AddManagedUserSheet>, 'open' | 'onOpenChange'> & {
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return <AddManagedUserSheet {...rest} open={open} onOpenChange={setOpen} />;
}

const meta = {
  title: 'Sections/AddManagedUserSheet',
  component: AddManagedUserSheetHarness,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
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
} satisfies Meta<typeof AddManagedUserSheetHarness>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultOpen: true },
};
