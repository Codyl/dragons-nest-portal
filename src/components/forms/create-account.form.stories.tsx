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
import CreateAccountForm from "./create-account.form";
import {
  initiateSignupSuccessHandlers,
  initiateSignupErrorHandlers,
  initiateSignupLoadingHandlers,
  initiateSignupNetworkErrorHandlers,
} from "../../../.storybook/msw-handlers";

const fillForm = async (
  canvas: ReturnType<typeof within>,
  email: string,
  password: string,
  confirmPassword: string
) => {
  const emailInput = canvas.getByLabelText("Email");
  const passwordInput = canvas.getByLabelText("Password");
  const confirmInput = canvas.getByLabelText("Confirm Password");
  await userEvent.type(emailInput, email);
  await userEvent.type(passwordInput, password);
  await userEvent.type(confirmInput, confirmPassword);
};

const submitForm = async (canvas: ReturnType<typeof within>) => {
  const submitButton = canvas.getByRole("button", { name: "Create Account" });
  await userEvent.click(submitButton);
};

const meta = {
  title: "Forms/CreateAccountForm",
  component: CreateAccountForm,
  parameters: {
    layout: "centered",
    msw: {
      handlers: initiateSignupSuccessHandlers,
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
} satisfies Meta<typeof CreateAccountForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: { handlers: initiateSignupSuccessHandlers },
    docs: {
      description: {
        story:
          "Create a new account with email and password. Submit to initiate signup.",
      },
    },
  },
};

export const Success: Story = {
  parameters: {
    msw: { handlers: initiateSignupSuccessHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates a successful account creation. Submit the form to see the success flow (navigate to confirm-signup).",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, "user@example.com", "Password123!", "Password123!");
    await submitForm(canvas);
  },
};

export const Error: Story = {
  parameters: {
    msw: { handlers: initiateSignupErrorHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates an error state when the email already exists. Submit the form to see the error message displayed.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, "user@example.com", "Password123!", "Password123!");
    await submitForm(canvas);
  },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: initiateSignupLoadingHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates the loading state when the request is in progress. Submit the form to see 'Creating account...' for 2 seconds.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, "user@example.com", "Password123!", "Password123!");
    await submitForm(canvas);
  },
};

export const NetworkError: Story = {
  parameters: {
    msw: { handlers: initiateSignupNetworkErrorHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates a network error state. Submit the form to see how the component handles network failures.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, "user@example.com", "Password123!", "Password123!");
    await submitForm(canvas);
  },
};

export const PasswordsDoNotMatch: Story = {
  parameters: {
    msw: { handlers: initiateSignupSuccessHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates form validation when passwords don't match. Submit the form to see the validation error.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, "user@example.com", "Password123!", "Password124!");
    await submitForm(canvas);
  },
};

export const PasswordTooShort: Story = {
  parameters: {
    msw: { handlers: initiateSignupSuccessHandlers },
    docs: {
      description: {
        story:
          "This story demonstrates form validation when the password is too short. Submit the form to see the validation error.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, "user@example.com", "Short1!", "Short1!");
    await submitForm(canvas);
  },
};
