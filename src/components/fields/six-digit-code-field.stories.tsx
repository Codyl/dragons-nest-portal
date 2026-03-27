import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import SixDigitCodeField from './six-digit-code-field';

const meta = {
  title: 'Fields/SixDigitCodeField',
  component: SixDigitCodeField,
  argTypes: {
    label: { control: 'text' },
    required: { control: 'boolean' },
  },
} satisfies Meta<typeof SixDigitCodeField>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveWrapper({
  initialValue = '',
  isValid = true,
  isTouched = false,
  errors,
  label,
  required,
  withOnSubmit = false,
}: {
  initialValue?: string;
  isValid?: boolean;
  isTouched?: boolean;
  errors?: Array<{ message?: string }>;
  label: string;
  required?: boolean;
  withOnSubmit?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const [submitCount, setSubmitCount] = useState(0);
  const field = {
    name: 'code',
    state: {
      value,
      meta: {
        isValid,
        isTouched,
        errors,
      },
    },
    handleChange: (v: string) => setValue(v),
    handleBlur: () => {},
  };
  return (
    <div className="space-y-2">
      <SixDigitCodeField
        field={field}
        label={label}
        required={required}
        onSubmit={
          withOnSubmit ? () => setSubmitCount((count) => count + 1) : undefined
        }
      />
      {withOnSubmit && <p className="text-sm">Submit calls: {submitCount}</p>}
    </div>
  );
}

export const Default: Story = {
  render: () => <InteractiveWrapper label="Verification code" />,
};

export const WithValue: Story = {
  render: () => (
    <InteractiveWrapper
      initialValue="123"
      label="Verification code"
    />
  ),
};

export const Invalid: Story = {
  render: () => (
    <InteractiveWrapper
      initialValue="12345"
      isValid={false}
      isTouched={true}
      errors={[{ message: 'Code must be 6 digits' }]}
      label="Verification code"
    />
  ),
};

export const Required: Story = {
  render: () => (
    <InteractiveWrapper
      label="Verification code"
      required
    />
  ),
};

export const AutoSubmitOnComplete: Story = {
  render: () => (
    <InteractiveWrapper
      label="Verification code"
      withOnSubmit
    />
  ),
};
