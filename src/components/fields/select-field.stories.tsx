import type { Meta, StoryObj } from '@storybook/react-vite';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';

import SelectField from './select-field';

const sampleOptions = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
];

function ControlledDemo({
  initialValue = '',
  label = 'Choose',
}: {
  initialValue?: string;
  label?: string;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="w-72 space-y-2">
      <SelectField
        label={label}
        id="demo-controlled"
        options={sampleOptions}
        value={value}
        onValueChange={setValue}
      />
      <p className="text-muted-foreground text-xs">Value: {value || '(empty)'}</p>
    </div>
  );
}

function FormConnectedDemo() {
  const form = useForm({
    defaultValues: { region: '' },
    onSubmit: async () => {},
  });

  return (
    <form
      className="w-72 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="region"
        validators={{
          onChange: ({ value }) =>
            String(value).trim().length === 0 ? 'Pick a region' : undefined,
        }}
      >
        {(field) => (
          <SelectField
            field={field}
            label="Region"
            id="demo-region"
            options={sampleOptions}
            placeholder="Select one"
            required
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
  title: 'Fields/SelectField',
  component: ControlledDemo,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ControlledDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {};

export const ControlledWithValue: Story = {
  args: { initialValue: 'b' },
};

export const FormConnected: StoryObj<typeof FormConnectedDemo> = {
  render: () => <FormConnectedDemo />,
};

const mockFieldBase = {
  name: 'state',
  handleChange: () => {},
  handleBlur: () => {},
};

export const MockFieldDefault: StoryObj<typeof SelectField> = {
  render: () => (
    <div className="w-72">
      <SelectField
        field={{
          ...mockFieldBase,
          state: {
            value: '',
            meta: {
              isValid: true,
              isTouched: false,
              errors: [],
            },
          },
        }}
        label="State"
        id="story-state"
        options={sampleOptions}
        placeholder="Select state"
      />
    </div>
  ),
};

export const MockFieldInvalid: StoryObj<typeof SelectField> = {
  render: () => (
    <div className="w-72">
      <SelectField
        field={{
          ...mockFieldBase,
          state: {
            value: '',
            meta: {
              isValid: false,
              isTouched: true,
              errors: [{ message: 'Required' }],
            },
          },
        }}
        label="State"
        id="story-state-invalid"
        options={sampleOptions}
        placeholder="Select state"
        required
      />
    </div>
  ),
};
