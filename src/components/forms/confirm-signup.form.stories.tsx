import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  createMemoryHistory,
} from "@tanstack/react-router";
import ConfirmSignupForm from "./confirm-signup.form";
import { handlers } from "../../../.storybook/msw-handlers";

const meta = {
  title: "Forms/ConfirmSignupForm",
  component: ConfirmSignupForm,
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
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("username", "test@example.com");
        sessionStorage.setItem("session", "test-session");
        sessionStorage.setItem("password", "Password123!");
      }
      return <Story />;
    },
  ],
} satisfies Meta<typeof ConfirmSignupForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Enter the 6-digit verification code sent to your email to confirm signup.",
      },
    },
  },
};
