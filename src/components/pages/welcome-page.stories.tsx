import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import WelcomePage from './welcome-page';

const meta = {
  title: 'Pages/WelcomePage',
  component: WelcomePage,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onContinue: fn(),
  },
} satisfies Meta<typeof WelcomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    displayName: 'Alex',
  },
};

export const EmailFallback: Story = {
  args: {
    displayName: 'alex',
  },
};

export const EmptyDisplayName: Story = {
  args: {
    displayName: '   ',
  },
};

export const ContinueDisabled: Story = {
  args: {
    displayName: 'Alex',
    continueDisabled: true,
  },
};
