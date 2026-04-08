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

export const Default: Story = {};
