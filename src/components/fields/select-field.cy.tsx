/**
 * Component tests for SelectField.
 * Reference: `six-digit-code-field.cy.tsx` (field mock shape, mount/stubs, error visibility).
 */
import { useState } from 'react';

import SelectField from './select-field';

describe('SelectField', () => {
  const options = [
    { value: 'x', label: 'First' },
    { value: 'y', label: 'Second' },
  ];

  const createFormField = (
    overrides: {
      value?: string;
      isValid?: boolean;
      isTouched?: boolean;
      errors?: Array<{ message?: string } | string>;
    } = {},
  ) => {
    const defaults = {
      value: '',
      isValid: true,
      isTouched: false,
      errors: [] as Array<{ message?: string } | string>,
    };
    const opts = { ...defaults, ...overrides };
    return {
      name: 'region',
      state: {
        value: opts.value,
        meta: {
          isValid: opts.isValid,
          isTouched: opts.isTouched,
          errors: opts.errors,
        },
      },
      handleChange: cy.stub().as('handleChange'),
      handleBlur: cy.stub().as('handleBlur'),
    };
  };

  function ControlledWrapper({
    initialValue = '',
    optionsProp = options,
    placeholder = 'Select' as string | null,
  }: {
    initialValue?: string;
    optionsProp?: typeof options;
    placeholder?: string | null;
  }) {
    const [value, setValue] = useState(initialValue);
    return (
      <SelectField
        label="Pick one"
        id="cy-controlled"
        options={optionsProp}
        placeholder={placeholder}
        value={value}
        onValueChange={(v) => setValue(v)}
        data-testid="cy-select"
      />
    );
  }

  it('renders label, select, and options (rendering)', () => {
    cy.mount(
      <SelectField
        label="Pick one"
        id="cy-controlled"
        options={options}
        value=""
        onValueChange={() => {}}
        data-testid="cy-select"
      />,
    );
    cy.get('[data-testid=label-cy-controlled]').should(
      'contain.text',
      'Pick one',
    );
    cy.get('[data-testid=cy-select]').within(() => {
      cy.get('option').should('have.length', 3);
      cy.contains('option', 'First').should('exist');
    });
  });

  it('reflects controlled value and fires onValueChange (props, interaction)', () => {
    const onValueChange = cy.stub().as('onValueChange');
    cy.mount(
      <SelectField
        label="Pick"
        id="v-test"
        options={options}
        value="x"
        onValueChange={onValueChange}
        data-testid="sel"
      />,
    );
    cy.get('[data-testid=sel]').should('have.value', 'x');
    cy.get('[data-testid=sel]').select('y');
    cy.get('@onValueChange').should('have.been.calledWith', 'y');
  });

  it('shows FieldError when form field is invalid and touched (error state)', () => {
    const field = createFormField({
      value: '',
      isValid: false,
      isTouched: true,
      errors: [{ message: 'Required' }],
    });
    cy.mount(
      <SelectField
        field={field}
        label="Region"
        id="f-region"
        options={options}
        placeholder="Select"
      />,
    );
    cy.get('[data-testid=error-message-region]').should(
      'contain.text',
      'Required',
    );
  });

  it('does not show error when form field is valid (error state)', () => {
    const field = createFormField({
      value: 'x',
      isValid: true,
      isTouched: true,
    });
    cy.mount(
      <SelectField
        field={field}
        label="Region"
        id="f-region-ok"
        options={options}
      />,
    );
    cy.get('[data-testid=error-message-region]').should('not.exist');
  });

  it('renders required asterisk when required (props)', () => {
    cy.mount(
      <SelectField
        label="Pick"
        id="req-id"
        options={options}
        value=""
        onValueChange={() => {}}
        required
      />,
    );
    cy.get('[data-testid=label-req-id]')
      .find('.text-destructive')
      .should('exist');
  });

  it('omits placeholder option when placeholder is null (edge case)', () => {
    cy.mount(<ControlledWrapper placeholder={null} initialValue="x" />);
    cy.get('[data-testid=cy-select]').within(() => {
      cy.get('option').should('have.length', 2);
    });
  });

  it('disables select when disabled (user interaction / props)', () => {
    cy.mount(
      <SelectField
        label="Pick"
        id="dis-id"
        options={options}
        value=""
        onValueChange={() => {}}
        disabled
        data-testid="dis-sel"
      />,
    );
    cy.get('[data-testid=dis-sel]').should('be.disabled');
  });
});
