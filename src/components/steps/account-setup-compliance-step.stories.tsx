import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { userEvent, within } from 'storybook/test';
import AccountSetupComplianceStep from './account-setup-compliance-step';
import { AccountSetupFormStoryWrapper } from './account-setup-form-story-wrapper';

const meta = {
  title: 'Steps/AccountSetupComplianceStep',
  component: AccountSetupComplianceStep,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Isolated step with mocked `onNext`. For Storybook-only previews and the `Validation` play. Cypress tests that advance to the next onboarding screen use `Forms/AccountSetupForm` → `ComplianceStep` (multi-step wrapper).',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => (
      <AccountSetupFormStoryWrapper
        stepIndex={0}
        totalSteps={3}
        signupRole={
          context.parameters.signupRole === 'adult' ? 'adult' : 'manageduser'
        }
      >
        <Story />
      </AccountSetupFormStoryWrapper>
    ),
  ],
  args: {
    onNext: fn(),
  },
} satisfies Meta<typeof AccountSetupComplianceStep>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Primary story; same name as legacy composeStories export for Cypress. */
export const ComplianceStep: Story = {};

/** Adult onboarding: no avatar picker on compliance (default first avatar at submit). */
export const AdultComplianceNoAvatar: Story = {
  parameters: { signupRole: 'adult' },
};

export const Validation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await canvas.findByTestId('error-message-name');
  },
};
