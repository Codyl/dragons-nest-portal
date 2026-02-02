import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  createMemoryHistory,
} from "@tanstack/react-router";
import LoginMethodSettingsSection from "./login-method-settings.section";
import { handlers } from "../../../.storybook/msw-handlers";

const meta = {
  title: "Sections/LoginMethodSettingsSection",
  component: LoginMethodSettingsSection,
  parameters: {
    layout: "centered",
    msw: {
      handlers,
    },
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
  ],
} satisfies Meta<typeof LoginMethodSettingsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Login methods section with Email & Password, Google, and Passkey. Register Passkey triggers WebAuthn registration when clicked (requires a supported browser and authenticator).",
      },
    },
  },
};
