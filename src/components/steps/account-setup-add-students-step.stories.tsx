import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import AccountSetupAddStudentsStep from './account-setup-add-students-step';
import { AccountSetupFormStoryWrapper } from './account-setup-form-story-wrapper';

const meta = {
  title: 'Steps/AccountSetupAddStudentsStep',
  component: AccountSetupAddStudentsStep,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <AccountSetupFormStoryWrapper
        stepIndex={1}
        totalSteps={3}
        signupRole="adult"
      >
        <Story />
      </AccountSetupFormStoryWrapper>
    ),
  ],
  args: {
    onNext: fn(),
    onBack: fn(),
  },
} satisfies Meta<typeof AccountSetupAddStudentsStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
