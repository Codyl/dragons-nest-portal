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

import AddStudentSheet from './add-student-sheet';

/** Open-state wrapper for Storybook interaction tests and Cypress `composeStories`. */
export function AddStudentSheetHarness({
  defaultOpen = true,
  ...rest
}: Omit<ComponentProps<typeof AddStudentSheet>, 'open' | 'onOpenChange'> & {
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <AddStudentSheet
      {...rest}
      open={open}
      onOpenChange={setOpen}
    />
  );
}

const meta = {
  title: 'Sections/AddStudentSheet',
  component: AddStudentSheetHarness,
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
} satisfies Meta<typeof AddStudentSheetHarness>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultOpen: true },
};
