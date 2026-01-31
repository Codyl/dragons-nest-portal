import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  createMemoryHistory,
} from "@tanstack/react-router";
import { fn, userEvent, within } from "storybook/test";
import ConfirmResetCodeForm from "./confirm-reset-code.form";
import { handlers } from "../../../.storybook/msw-handlers";

const fillForm = async (canvas: ReturnType<typeof within>, code: string) => {
  const codeInput = canvas.getByLabelText('Code');
  await userEvent.type(codeInput, code);
};

const submitForm = async (canvas: ReturnType<typeof within>) => {
  const submitButton = canvas.getByRole('button', { name: 'Confirm' });
  await userEvent.click(submitButton);
};

const meta = {
  title: "Forms/ConfirmResetCodeForm",
  component: ConfirmResetCodeForm,
  parameters: {
    layout: "centered",
    msw: { handlers }, // Form does not call API; handlers for consistency
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
  args: {
    setStep: fn(),
  },
} satisfies Meta<typeof ConfirmResetCodeForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Enter the reset code received via email. Calls setStep(2) on successful submit.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, '123456');
    await submitForm(canvas);
  },
};

export const InvalidCode: Story = {
  parameters: {
    msw: { handlers },
    docs: {
      description: {
        story: "This story demonstrates an error state when the code is invalid. Submit the form to see the error message displayed below the form fields.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, '12345');
    await submitForm(canvas);
  },
};

export const EmptyCode: Story = {
  parameters: {
    msw: { handlers },
    docs: {
      description: {
        story: "This story demonstrates an error state when the code is empty. Submit the form to see the error message displayed below the form fields.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await submitForm(canvas);
  },
};

export const Success: Story = {
  parameters: {
    msw: { handlers },
    docs: {
      description: {
        story: "This story demonstrates a successful state when the code is valid. Submit the form to see the success callback triggered. The form will call `setStep(2)` when the mutation succeeds.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, '123456');
    await submitForm(canvas);
  },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers },
    docs: {
      description: {
        story: "Form does not call an API; submit triggers setStep(2). Play fills and submits.",
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
    msw: { handlers },
    docs: {
      description: {
        story: "Form does not call an API; submit triggers setStep(2). Play fills and submits.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas, "123456");
    await submitForm(canvas);
  },
};