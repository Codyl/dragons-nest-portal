import type { Meta, StoryObj } from '@storybook/react-vite';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import PasswordInputField from './password-input-field';

function PasswordFieldDemo({
  initial = '',
  label = 'Password',
}: {
  initial?: string;
  label?: string;
}) {
  const form = useForm({
    defaultValues: { password: initial },
    validators: {
      onSubmit: z.object({
        password: z.string().min(1, 'Required'),
      }),
    },
    onSubmit: async () => {},
  });

  return (
    <form
      className="w-80 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="password"
        children={(field) => <PasswordInputField field={field} label={label} />}
      />
      <button type="submit" className="text-sm underline">
        Submit (touch validation)
      </button>
    </form>
  );
}

const meta = {
  title: 'Fields/PasswordInputField',
  component: PasswordFieldDemo,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof PasswordFieldDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { initial: 'Secret123!' },
};
