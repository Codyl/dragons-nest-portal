import type { Meta, StoryObj } from '@storybook/react-vite';
import { PasskeyProviderIcon } from './passkey-provider-icon';

const providers = [
  'apple_icloud',
  'google_password_manager',
  'windows_hello',
  'synced_passkey',
  'this_device',
  'security_key',
  'unknown',
] as const;

const meta = {
  title: 'Passkeys/PasskeyProviderIcon',
  component: PasskeyProviderIcon,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    provider: { control: 'select', options: [...providers] },
  },
} satisfies Meta<typeof PasskeyProviderIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AppleICloud: Story = {
  args: { provider: 'apple_icloud', className: 'text-foreground' },
};

export const GooglePasswordManager: Story = {
  args: { provider: 'google_password_manager', className: 'text-foreground' },
};

export const WindowsHello: Story = {
  args: { provider: 'windows_hello', className: 'text-foreground' },
};

export const Unknown: Story = {
  args: { provider: 'unknown', className: 'text-foreground' },
};
