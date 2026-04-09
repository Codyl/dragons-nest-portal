import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import AccountSetupAvailabilityStep from './account-setup-availability-step';
import { AccountSetupFormStoryWrapper } from './account-setup-form-story-wrapper';

const meta = {
  title: 'Steps/AccountSetupAvailabilityStep',
  component: AccountSetupAvailabilityStep,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const isTeen = context.parameters.variant !== 'parent';
      return (
        <AccountSetupFormStoryWrapper
          stepIndex={isTeen ? 2 : 2}
          totalSteps={isTeen ? 3 : 4}
          signupRole={isTeen ? 'student' : 'adult'}
        >
          <Story />
        </AccountSetupFormStoryWrapper>
      );
    },
  ],
  args: {
    onBack: fn(),
    onNext: fn(),
    isLastStep: false,
  },
} satisfies Meta<typeof AccountSetupAvailabilityStep>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Cypress: `src/components/steps/account-setup-availability-step.cy.tsx`.
 * Reference (form context / MSW): `src/components/forms/account-setup.cy.tsx`.
 */
export const TeenFinish: Story = {
  parameters: { variant: 'teen' },
  args: {
    variant: 'teen',
    isLastStep: true,
  },
};

export const ParentNext: Story = {
  parameters: { variant: 'parent' },
  args: {
    variant: 'parent',
    isLastStep: false,
  },
};
