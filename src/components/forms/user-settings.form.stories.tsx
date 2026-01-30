import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  createMemoryHistory,
} from "@tanstack/react-router";
import UserSettingsForm from "./user-settings.form";
import { handlers } from "../../../.storybook/msw-handlers";

const meta = {
  title: "Forms/UserSettingsForm",
  component: UserSettingsForm,
  parameters: {
    layout: "centered",
    msw: { handlers },
  },
  tags: ["autodocs"],
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
        createRoute({ getParentRoute: () => rootRoute, path: "/" }),
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
    (Story) => {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("AccessToken", "test-token");
      }
      return <Story />;
    },
  ],
} satisfies Meta<typeof UserSettingsForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "User profile settings form. Fetches user data and allows updating email, name, and phone.",
      },
    },
  },
};
