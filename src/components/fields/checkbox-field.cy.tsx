/**
 * Component tests for CheckboxField.
 * Reference: `select-field.cy.tsx` (field mock shape, mount/stubs, error visibility).
 */
import { useState } from 'react';

import CheckboxField from './checkbox-field';

describe('CheckboxField', () => {
  const createFormField = (
    overrides: {
      value?: boolean;
      isValid?: boolean;
      isTouched?: boolean;
      errors?: Array<{ message?: string } | string>;
    } = {},
  ) => {
    const defaults = {
      value: false,
      isValid: true,
      isTouched: false,
      errors: [] as Array<{ message?: string } | string>,
    };
    const opts = { ...defaults, ...overrides };
    return {
      name: 'agree',
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
    initialChecked = false,
  }: {
    initialChecked?: boolean;
  }) {
    const [checked, setChecked] = useState(initialChecked);
    return (
      <CheckboxField
        id="cy-controlled"
        label="Check me"
        checked={checked}
        onCheckedChange={setChecked}
        data-testid="cy-cb"
      />
    );
  }

  it('renders checkbox and label (rendering)', () => {
    cy.mount(
      <CheckboxField
        id="r1"
        label="Terms"
        checked={false}
        onCheckedChange={() => {}}
        data-testid="cb-render"
      />,
    );
    cy.get('[data-testid=label-r1]').should('contain.text', 'Terms');
    cy.get('[data-testid=cb-render]').should('exist');
  });

  it('reflects checked state and fires onCheckedChange (props, interaction)', () => {
    const onCheckedChange = cy.stub().as('onCheckedChange');
    cy.mount(
      <CheckboxField
        id="r2"
        label="Opt in"
        checked={false}
        onCheckedChange={onCheckedChange}
        data-testid="cb-int"
      />,
    );
    cy.get('[data-testid=cb-int]').should('not.be.checked');
    cy.get('[data-testid=cb-int]').click();
    cy.get('@onCheckedChange').should('have.been.calledWith', true);
  });

  it('shows FieldError when form field is invalid and touched (error state)', () => {
    const field = createFormField({
      value: false,
      isValid: false,
      isTouched: true,
      errors: [{ message: 'Required' }],
    });
    cy.mount(<CheckboxField field={field} id="f-agree" label="I agree" />);
    cy.get('[data-testid=error-message-agree]').should(
      'contain.text',
      'Required',
    );
  });

  it('does not show error when form field is valid (error state)', () => {
    const field = createFormField({
      value: true,
      isValid: true,
      isTouched: true,
    });
    cy.mount(<CheckboxField field={field} id="f-ok" label="I agree" />);
    cy.get('[data-testid=error-message-agree]').should('not.exist');
  });

  it('calls handleChange and handleBlur on interaction (form field)', () => {
    const field = createFormField({
      value: false,
      isValid: true,
      isTouched: false,
    });
    cy.mount(<CheckboxField field={field} id="f-live" label="Subscribe" />);
    cy.get('[data-testid=checkbox-agree]').click();
    cy.get('@handleChange').should('have.been.calledWith', true);
    cy.get('[data-testid=checkbox-agree]').blur();
    cy.get('@handleBlur').should('have.been.called');
  });

  it('disables checkbox when disabled (props)', () => {
    cy.mount(
      <CheckboxField
        id="dis"
        label="Locked"
        checked={false}
        onCheckedChange={() => {}}
        disabled
        data-testid="cb-dis"
      />,
    );
    cy.get('[data-testid=cb-dis]').should('be.disabled');
  });

  it('controlled wrapper toggles visual state (edge case)', () => {
    cy.mount(<ControlledWrapper />);
    cy.get('[data-testid=cy-cb]').click();
    cy.get('[data-testid=cy-cb]').should('be.checked');
    cy.get('[data-testid=cy-cb]').click();
    cy.get('[data-testid=cy-cb]').should('not.be.checked');
  });
});
