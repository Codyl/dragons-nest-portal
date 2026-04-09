import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import AccountSetupInterestsStep from './account-setup-interests-step';
import { AccountSetupFormStoryWrapper } from './account-setup-form-story-wrapper';

const meta = {
  title: 'Steps/AccountSetupInterestsStep',
  component: AccountSetupInterestsStep,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <AccountSetupFormStoryWrapper
        stepIndex={1}
        totalSteps={3}
      >
        <Story />
      </AccountSetupFormStoryWrapper>
    ),
  ],
  args: {
    onNext: fn(),
    onBack: fn(),
    isLastStep: false,
  },
} satisfies Meta<typeof AccountSetupInterestsStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LastStepFinishesOnboarding: Story = {
  args: {
    isLastStep: true,
  },
};
