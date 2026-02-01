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
import DeleteAccountForm from "./delete-account.form";
import {
  deleteUserSuccessHandlers,
  deleteUserErrorHandlers,
  deleteUserLoadingHandlers,
  deleteUserNetworkErrorHandlers,
} from "../../../.storybook/msw-handlers";

const fillForm = async (canvas: ReturnType<typeof within>, password: string) => {
  const passwordInput = canvas.getByLabelText("Password");
  await userEvent.type(passwordInput, password);
};

const submitForm = async (canvas: ReturnType<typeof within>) => {
  const submitButton = canvas.getByRole("button", { name: "Delete Account" });
  await userEvent.click(submitButton);
};

const meta = {
  title: "Forms/DeleteAccountForm",
  component: DeleteAccountForm,
  parameters: {
    layout: "centered",
    msw: {
      handlers: deleteUserSuccessHandlers,
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
} satisfies Meta<typeof DeleteAccountForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: { handlers: deleteUserSuccessHandlers },
    docs: {
      description: {
        story:
          "Enter password to confirm account deletion. Requires authentication.",
      },
    },
  },
};

export const Success: Story = {
  parameters: {
    msw: { handlers: deleteUserSuccessHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates a successful account deletion. Submit the form to see the success flow.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, "Password123!");
    await submitForm(canvas);
  },
};

export const Error: Story = {
  parameters: {
    msw: { handlers: deleteUserErrorHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates an error state when the password is invalid. Submit the form to see the error message displayed.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, "WrongPassword!");
    await submitForm(canvas);
  },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: deleteUserLoadingHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates the loading state when the delete request is in progress. Submit the form to see the button disabled with loading for 2 seconds.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, "Password123!");
    await submitForm(canvas);
  },
};

export const NetworkError: Story = {
  parameters: {
    msw: { handlers: deleteUserNetworkErrorHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates a network error state. Submit the form to see how the component handles network failures.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, "Password123!");
    await submitForm(canvas);
  },
};

export const ValidationErrorEmptyPassword: Story = {
  parameters: {
    msw: { handlers: deleteUserSuccessHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates form validation when password is empty. Submit the form to see the validation error.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await submitForm(canvas);
  },
};
