import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { useState } from 'react';
import { userEvent, within } from 'storybook/test';
import AccountSetupForm from './account-setup.form';
import AccountSetupGoalsStep from '@/components/steps/account-setup-goals-step';
import AccountSetupInterestsStep from '@/components/steps/account-setup-interests-step';
import AccountSetupProfileStep from '@/components/steps/account-setup-profile-step';

function AccountSetupFlow({ initialStep = 0 }: { initialStep?: number }) {
  const [step, setStep] = useState(initialStep);

  return (
    <AccountSetupForm stepIndex={step}>
      {step === 0 && <AccountSetupProfileStep onNext={() => setStep(1)} />}
      {step === 1 && (
        <AccountSetupInterestsStep
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && <AccountSetupGoalsStep onBack={() => setStep(1)} />}
    </AccountSetupForm>
  );
}

const meta = {
  title: 'Forms/AccountSetupForm',
  component: AccountSetupFlow,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    initialStep: 0,
  },
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
      const indexRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/',
      });
      const welcomeRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/welcome',
      });
      const routeTree = rootRoute.addChildren([indexRoute, welcomeRoute]);
      const router = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: ['/'] }),
        defaultPendingMinMs: 0,
      });

      return (
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof AccountSetupFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProfileStep: Story = {
  args: { initialStep: 0 },
  parameters: {
    docs: {
      description: {
        story:
          "Profile step: name, age, and avatar selection matching the Dragon's Nest onboarding mockup.",
      },
    },
  },
};

export const InterestsStep: Story = {
  args: { initialStep: 1 },
  parameters: {
    docs: {
      description: {
        story:
          'Interests step: multi-select topic grid. Prefills step index only; complete the profile step in isolation for a realistic flow.',
      },
    },
  },
};

export const GoalsStep: Story = {
  args: { initialStep: 2 },
  parameters: {
    docs: {
      description: {
        story:
          'Goals step: optional goals and learning-style multi-select; primary Continue submits the full form.',
      },
    },
  },
};

export const ProfileValidation: Story = {
  args: { initialStep: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await canvas.findByTestId('error-message-name');
  },
};

export const ProfileToInterests: Story = {
  args: { initialStep: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByTestId('input-name'), 'Alex');
    await userEvent.type(canvas.getByTestId('input-age'), '11');
    await userEvent.click(canvas.getByTestId('avatar-owl'));
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await canvas.findByRole('heading', { name: 'What interests you?' });
  },
};
