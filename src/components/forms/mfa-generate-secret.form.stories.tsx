import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  createMemoryHistory,
} from "@tanstack/react-router";
import MFAGenerateSecretForm from "./mfa-generate-secret.form";
import { handlers } from "../../../.storybook/msw-handlers";

const meta = {
  title: "Forms/MFAGenerateSecretForm",
  component: MFAGenerateSecretForm,
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
        sessionStorage.setItem("session", "test-session");
        sessionStorage.setItem("username", "test@example.com");
        sessionStorage.setItem("password", "Password123!");
      }
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("AccessToken", "test-token");
      }
      return <Story />;
    },
  ],
} satisfies Meta<typeof MFAGenerateSecretForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Scan QR code and enter code from authenticator app to complete MFA setup.",
      },
    },
  },
};
