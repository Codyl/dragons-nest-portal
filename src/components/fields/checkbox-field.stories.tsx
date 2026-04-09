import type { Meta, StoryObj } from '@storybook/react-vite';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';

import CheckboxField from './checkbox-field';

function ControlledDemo({ initialChecked = false }: { initialChecked?: boolean }) {
  const [checked, setChecked] = useState(initialChecked);
  return (
    <div className="w-96 space-y-2">
      <CheckboxField
        id="demo-controlled"
        label="I agree to the terms."
        checked={checked}
        onCheckedChange={setChecked}
      />
      <p className="text-muted-foreground text-xs">
        Checked: {checked ? 'yes' : 'no'}
      </p>
    </div>
  );
}

function FormConnectedDemo() {
  const form = useForm({
    defaultValues: { confirmed: false },
    onSubmit: async () => {},
  });

  return (
    <form
      className="w-96 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="confirmed"
        validators={{
          onChange: ({ value }) =>
            !value ? 'You must confirm to continue' : undefined,
        }}
      >
        {(field) => (
          <CheckboxField
            field={field}
            id="demo-confirmed"
            label="I confirm this is correct."
          />
        )}
      </form.Field>
      <button
        type="submit"
        className="text-sm underline"
      >
        Submit
      </button>
    </form>
  );
}

const meta = {
  title: 'Fields/CheckboxField',
  component: ControlledDemo,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ControlledDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {};

export const ControlledChecked: Story = {
  args: { initialChecked: true },
};

export const FormConnected: StoryObj<typeof FormConnectedDemo> = {
  render: () => <FormConnectedDemo />,
};

const mockFieldBase = {
  name: 'agree',
  handleChange: () => {},
  handleBlur: () => {},
};

export const MockFieldDefault: StoryObj<typeof CheckboxField> = {
  render: () => (
    <div className="w-96">
      <CheckboxField
        field={{
          ...mockFieldBase,
          state: {
            value: false,
            meta: {
              isValid: true,
              isTouched: false,
              errors: [],
            },
          },
        }}
        id="story-agree"
        label="Accept notifications."
      />
    </div>
  ),
};

export const MockFieldInvalid: StoryObj<typeof CheckboxField> = {
  render: () => (
    <div className="w-96">
      <CheckboxField
        field={{
          ...mockFieldBase,
          state: {
            value: false,
            meta: {
              isValid: false,
              isTouched: true,
              errors: ['Required'],
            },
          },
        }}
        id="story-agree-invalid"
        label="Accept notifications."
      />
    </div>
  ),
};
