import type { Meta, StoryObj } from '@storybook/react-vite';

import InputField from './input-field';
const meta = {
  title: 'Example/InputField',
  component: InputField,
  argTypes: {
    field: {
      control: 'object',
    },
    label: {
      control: 'text',
    },
  },
} satisfies Meta<typeof InputField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    field: {
      name: 'email',
      value: '',
      onChange: () => {},
      onBlur: () => {},
      state: {
        meta: {
          isValid: true,
          isTouched: false,
          placeholder: 'Enter your email',
        },
      },
    },
    label: 'Email',
  },
};

export const Invalid: Story = {
  args: {
    field: {
      name: 'email',
      value: '',
      onChange: () => {},
      onBlur: () => {},
      state: {
        meta: {
          placeholder: 'Enter your email',
          isValid: false,
          isTouched: true,
          errors: [{ message: 'Invalid email' }],
        },
      },
    },
    label: 'Email',
  },
};
