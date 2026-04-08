import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { userEvent, within } from 'storybook/test';
import AccountSetupForm from './account-setup.form';
import AccountSetupComplianceStep from '@/components/steps/account-setup-compliance-step';
import AccountSetupInterestsStep from '@/components/steps/account-setup-interests-step';
import AccountSetupAddStudentsStep from '@/components/steps/account-setup-add-students-step';
import AccountSetupTeachableStep from '@/components/steps/account-setup-teachable-step';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function AccountSetupStudentFlow({
  initialStep = 0,
}: {
  initialStep?: number;
}) {
  const [step, setStep] = useState(initialStep);
  const totalSteps = 2;
  return (
    <AccountSetupForm
      stepIndex={step}
      totalSteps={totalSteps}
    >
      {step === 0 && <AccountSetupComplianceStep onNext={() => setStep(1)} />}
      {step === 1 && (
        <AccountSetupInterestsStep
          isLastStep
          onBack={() => setStep(0)}
          onNext={() => undefined}
        />
      )}
    </AccountSetupForm>
  );
}

const formFlowMeta = {
  title: 'Forms/AccountSetupForm',
  component: AccountSetupStudentFlow,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    initialStep: 0,
  },
  decorators: [
    (Story, context) => {
      if (typeof window !== 'undefined') {
        const role =
          context.parameters.signupRole === 'adult' ? 'adult' : 'student';
        sessionStorage.setItem('signupRole', role);
      }
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
} satisfies Meta<typeof AccountSetupStudentFlow>;

export default formFlowMeta;
type Story = StoryObj<typeof formFlowMeta>;

/** Wired to `AccountSetupStudentFlow` step state; use for Cypress / multi-step flows. */
export const ComplianceStep: Story = {
  args: { initialStep: 0 },
};

/** Student onboarding interests step only (same flow as step 2 after compliance). */
export const InterestsStep: Story = {
  args: { initialStep: 1 },
};

/** Multi-step integration: compliance → interests (see individual step stories under `Steps/`). */
export const ComplianceToInterests: Story = {
  args: { initialStep: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByTestId('input-name'), 'Alex');
    await userEvent.type(canvas.getByTestId('input-age'), '11');
    await userEvent.selectOptions(canvas.getByTestId('input-state'), 'ca');
    await userEvent.type(canvas.getByTestId('input-zip'), '90210');
    await userEvent.type(canvas.getByTestId('input-phone'), '5551234567');
    await userEvent.click(canvas.getByTestId('avatar-owl'));
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await canvas.findByRole('heading', { name: 'What interests you?' });
  },
};

export const ComplianceValidation: Story = {
  args: { initialStep: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await canvas.findByTestId('error-message-name');
  },
};
