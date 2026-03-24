import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import SixDigitCodeField from "./six-digit-code-field";

const meta = {
  title: "Fields/SixDigitCodeField",
  component: SixDigitCodeField,
  argTypes: {
    label: { control: "text" },
    required: { control: "boolean" },
  },
} satisfies Meta<typeof SixDigitCodeField>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveWrapper({
  initialValue = "",
  isValid = true,
  isTouched = false,
  errors,
  label,
  required,
}: {
  initialValue?: string;
  isValid?: boolean;
  isTouched?: boolean;
  errors?: Array<{ message?: string }>;
  label: string;
  required?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const field = {
    name: "code",
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
    <SixDigitCodeField
      field={field}
      label={label}
      required={required}
    />
  );
}

export const Default: Story = {
  render: () => (
    <InteractiveWrapper label="Verification code" />
  ),
};

export const WithValue: Story = {
  render: () => (
    <InteractiveWrapper initialValue="123" label="Verification code" />
  ),
};

export const Invalid: Story = {
  render: () => (
    <InteractiveWrapper
      initialValue="12345"
      isValid={false}
      isTouched={true}
      errors={[{ message: "Code must be 6 digits" }]}
      label="Verification code"
    />
  ),
};

export const Required: Story = {
  render: () => (
    <InteractiveWrapper label="Verification code" required />
  ),
};
