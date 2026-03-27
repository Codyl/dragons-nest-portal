import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router';
import NewDeviceModal from './new-device.modal';

const keysToClearForShow = [
  'lastLoginProvider',
  'AddedDeviceKey',
  'isOptedOut',
  'IsOptedOut',
  'NewDeviceModalDismissed',
] as const;

function clearStorageForShow() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('lastLoginProvider');
  }

  if (typeof localStorage !== 'undefined') {
    keysToClearForShow.forEach((key) => {
      if (key !== 'lastLoginProvider') localStorage.removeItem(key);
    });
  }
}

const meta = {
  title: 'Modals/NewDeviceModal',
  component: NewDeviceModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story: () => React.ReactNode) => {
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
} satisfies Meta<typeof NewDeviceModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Modal is shown when user has not opted out, not dismissed, and did not just sign in with Google. */
export const Default: Story = {
  decorators: [
    (Story: () => React.ReactNode) => {
      clearStorageForShow();
      return <Story />;
    },
  ],
};

/** Modal does not show when the user just signed in with Google (lastLoginProvider is cleared after read). */
export const HiddenWhenGoogleSignIn: Story = {
  decorators: [
    (Story: () => React.ReactNode) => {
      clearStorageForShow();
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('lastLoginProvider', 'google');
      }

      return <Story />;
    },
  ],
};
