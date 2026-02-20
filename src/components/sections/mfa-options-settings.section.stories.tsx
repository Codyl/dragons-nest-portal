import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  createMemoryHistory,
} from "@tanstack/react-router";
import MFAOptionsSettingsSection from "./mfa-options-settings.section";
import { handlers, mfaOptionsTOTPEnabledHandlers } from "../../../.storybook/msw-handlers";

const meta = {
  title: "Sections/MFAOptionsSettingsSection",
  component: MFAOptionsSettingsSection,
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
} satisfies Meta<typeof MFAOptionsSettingsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "MFA options settings with Authenticator App. Shows Setup when TOTP is not enabled.",
      },
    },
  },
};

export const TOTPEnabled: Story = {
  parameters: {
    msw: { handlers: mfaOptionsTOTPEnabledHandlers },
    docs: {
      description: {
        story: "Section when Authenticator App MFA is already set up (Remove button visible).",
      },
    },
  },
};
