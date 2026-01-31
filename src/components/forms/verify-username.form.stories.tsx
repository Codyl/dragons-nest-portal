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
import VerifyUsernameForm from "./verify-username.form";
import {
  verifyUsernameSuccessHandlers,
  verifyUsernameErrorHandlers,
  verifyUsernameLoadingHandlers,
  verifyUsernameNetworkErrorHandlers,
} from "../../../.storybook/msw-handlers";

const fillForm = async (canvas: ReturnType<typeof within>, username: string) => {
  const input = canvas.getByLabelText("Email or username");
  await userEvent.type(input, username);
};

const submitForm = async (canvas: ReturnType<typeof within>) => {
  const submitButton = canvas.getByRole("button", { name: "Next" });
  await userEvent.click(submitButton);
};

const meta = {
  title: "Forms/VerifyUsernameForm",
  component: VerifyUsernameForm,
  parameters: {
    layout: "centered",
    msw: {
      handlers: verifyUsernameSuccessHandlers,
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
} satisfies Meta<typeof VerifyUsernameForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: { handlers: verifyUsernameSuccessHandlers },
    docs: {
      description: {
        story: "Enter email or username to verify and proceed to login.",
      },
    },
  },
};

export const Success: Story = {
  parameters: {
    msw: { handlers: verifyUsernameSuccessHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates a successful username verification. Submit the form to see the success flow (navigate to login).",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, "user@example.com");
    await submitForm(canvas);
  },
};

export const Error: Story = {
  parameters: {
    msw: { handlers: verifyUsernameErrorHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates an error state when the user is not found. Submit the form to see the error message displayed.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, "nonexistent@example.com");
    await submitForm(canvas);
  },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: verifyUsernameLoadingHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates the loading state when the request is in progress. Submit the form to see the button disabled for 2 seconds.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, "user@example.com");
    await submitForm(canvas);
  },
};

export const NetworkError: Story = {
  parameters: {
    msw: { handlers: verifyUsernameNetworkErrorHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates a network error state. Submit the form to see how the component handles network failures.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, "user@example.com");
    await submitForm(canvas);
  },
};

export const ValidationErrorEmptyUsername: Story = {
  parameters: {
    msw: { handlers: verifyUsernameSuccessHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates form validation when username is empty. Submit the form to see the validation error.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await submitForm(canvas);
  },
};
