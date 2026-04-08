import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router';
import SignupAdultStudentForm from './signup-adult-student.form';
import { initiateSignupSuccessHandlers } from '../../../.storybook/msw-handlers';

const meta = {
  title: 'Forms/SignupAdultStudentForm',
  component: SignupAdultStudentForm,
  parameters: {
    layout: 'centered',
    msw: { handlers: initiateSignupSuccessHandlers },
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
} satisfies Meta<typeof SignupAdultStudentForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Student: Story = {
  args: { accountType: 'student', showGoogleSso: false },
  render: (args) => (
    <div className="bg-card w-full max-w-md rounded-xl border p-6 shadow-xs">
      <SignupAdultStudentForm {...args} />
    </div>
  ),
};

export const Adult: Story = {
  args: { accountType: 'adult', showGoogleSso: false },
  render: (args) => (
    <div className="bg-card w-full max-w-md rounded-xl border p-6 shadow-xs">
      <SignupAdultStudentForm {...args} />
    </div>
  ),
};
