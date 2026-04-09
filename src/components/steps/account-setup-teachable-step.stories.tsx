import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import AccountSetupTeachableStep from './account-setup-teachable-step';
import { AccountSetupFormStoryWrapper } from './account-setup-form-story-wrapper';

const meta = {
  title: 'Steps/AccountSetupTeachableStep',
  component: AccountSetupTeachableStep,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <AccountSetupFormStoryWrapper
        stepIndex={2}
        totalSteps={3}
        signupRole="adult"
      >
        <Story />
      </AccountSetupFormStoryWrapper>
    ),
  ],
  args: {
    onBack: fn(),
  },
} satisfies Meta<typeof AccountSetupTeachableStep>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Cypress: `src/components/steps/account-setup-teachable-step.cy.tsx`.
 * Reference (form / subjects intercept): `src/components/forms/account-setup.cy.tsx`.
 * Row UI Storybook: `src/components/steps/course-form-row.stories.tsx`.
 */
export const Default: Story = {};
