import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  createMemoryHistory,
} from "@tanstack/react-router";
import { userEvent, within } from "storybook/test";
import MFAGenerateSecretForm from "./mfa-generate-secret.form";
import {
  mfaGenerateSecretSuccessHandlers,
  mfaGenerateSecretLoadingHandlers,
  mfaConnectSuccessHandlers,
  mfaConnectErrorHandlers,
  mfaConnectLoadingHandlers,
  mfaConnectNetworkErrorHandlers,
} from "../../../.storybook/msw-handlers";

const fillForm = async (canvas: ReturnType<typeof within>, code: string) => {
  const input = canvas.getByLabelText("Code");
  await userEvent.type(input, code);
};

const submitForm = async (canvas: ReturnType<typeof within>) => {
  const submitButton = canvas.getByRole("button", { name: "Continue" });
  await userEvent.click(submitButton);
};

const meta = {
  title: "Forms/MFAGenerateSecretForm",
  component: MFAGenerateSecretForm,
  parameters: {
    layout: "centered",
    msw: {
      handlers: mfaGenerateSecretSuccessHandlers,
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
    (Story) => {
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("session", "test-session");
        sessionStorage.setItem("username", "test@example.com");
        sessionStorage.setItem("password", "Password123!");
      }
      return <Story />;
    },
  ],
} satisfies Meta<typeof MFAGenerateSecretForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: { handlers: mfaGenerateSecretSuccessHandlers },
    docs: {
      description: {
        story:
          "Scan QR code and enter code from authenticator app to complete MFA setup.",
      },
    },
  },
};

export const Success: Story = {
  parameters: {
    msw: { handlers: mfaConnectSuccessHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates a successful MFA setup. Submit the form to see the success flow (navigate to verify-code).",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, "123456");
    await submitForm(canvas);
  },
};

export const Error: Story = {
  parameters: {
    msw: { handlers: mfaConnectErrorHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates an error state when the code is invalid. Submit the form to see the error message displayed.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, "123456");
    await submitForm(canvas);
  },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: mfaConnectLoadingHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates the loading state when the connect request is in progress. Submit the form to see the button disabled with loading for 2 seconds.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, "123456");
    await submitForm(canvas);
  },
};

export const NetworkError: Story = {
  parameters: {
    msw: { handlers: mfaConnectNetworkErrorHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates a network error state. Submit the form to see how the component handles network failures.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, "123456");
    await submitForm(canvas);
  },
};

export const GenerateSecretLoading: Story = {
  parameters: {
    msw: { handlers: mfaGenerateSecretLoadingHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates the loading state when the initial generate-secret request is slow. The form loads with a delayed QR code.",
      },
    },
  },
};

export const ValidationErrorEmptyCode: Story = {
  parameters: {
    msw: { handlers: mfaConnectSuccessHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates form validation when the code is empty. Submit the form to see the validation error.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await submitForm(canvas);
  },
};
