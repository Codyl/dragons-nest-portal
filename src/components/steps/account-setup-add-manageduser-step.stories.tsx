import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import AccountSetupAddManagedUsersStep from './account-setup-add-manageduser-step';
import { AccountSetupFormStoryWrapper } from './account-setup-form-story-wrapper';

const meta = {
  title: 'Steps/AccountSetupAddManagedUsersStep',
  component: AccountSetupAddManagedUsersStep,
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
} satisfies Meta<typeof AccountSetupAddManagedUsersStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
