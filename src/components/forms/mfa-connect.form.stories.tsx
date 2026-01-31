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
import MFAConnectForm from "./mfa-connect.form";
import {
  mfaConnectSuccessHandlers,
  mfaConnectErrorHandlers,
  mfaConnectLoadingHandlers,
  mfaConnectNetworkErrorHandlers,
} from "../../../.storybook/msw-handlers";

const fillForm = async (canvas: ReturnType<typeof within>, userCode: string) => {
  const input = canvas.getByLabelText("User Code");
  await userEvent.type(input, userCode);
};

const submitForm = async (canvas: ReturnType<typeof within>) => {
  const submitButton = canvas.getByRole("button", {
    name: "Connect Authenticator",
  });
  await userEvent.click(submitButton);
};

const meta = {
  title: "Forms/MFAConnectForm",
  component: MFAConnectForm,
  parameters: {
    layout: "centered",
    msw: {
      handlers: mfaConnectSuccessHandlers,
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
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("AccessToken", "test-token");
      }
      return <Story />;
    },
  ],
} satisfies Meta<typeof MFAConnectForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: { handlers: mfaConnectSuccessHandlers },
    docs: {
      description: {
        story: "Connect authenticator app by entering the user code.",
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
          "This story demonstrates a successful authenticator connection. Submit the form to see the success response and QR code display.",
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
          "This story demonstrates an error state when the user code is invalid. Submit the form to see the error message displayed.",
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
          "This story demonstrates the loading state when the connect request is in progress. Submit the form to see 'Connecting...' for 2 seconds.",
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

export const ValidationErrorEmptyCode: Story = {
  parameters: {
    msw: { handlers: mfaConnectSuccessHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates form validation when the user code is empty. Submit the form to see the validation error.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await submitForm(canvas);
  },
};
