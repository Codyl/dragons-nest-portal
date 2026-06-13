import { useState } from 'react';
import SixDigitCodeField from './six-digit-code-field';

describe('SixDigitCodeField', () => {
  const createField = (
    overrides: {
      value?: string;
      isValid?: boolean;
      isTouched?: boolean;
      errors?: Array<{ message?: string }>;
    } = {},
  ) => {
    const defaults = {
      value: '',
      isValid: true,
      isTouched: false,
      errors: undefined as Array<{ message?: string }> | undefined,
    };
    const opts = { ...defaults, ...overrides };
    return {
      name: 'code',
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

  function StatefulWrapper({
    initialValue = '',
    onChanges,
    onSubmit,
  }: {
    initialValue?: string;
    onChanges?: (value: string) => void;
    onSubmit?: () => void;
  }) {
    const [value, setValue] = useState(initialValue);
    const field = {
      name: 'code',
      state: {
        value,
        meta: { isValid: true, isTouched: false, errors: undefined },
      },
      handleChange: (v: string) => {
        setValue(v);
        onChanges?.(v);
      },
      handleBlur: () => {},
    };
    return <SixDigitCodeField field={field} label="Code" onSubmit={onSubmit} />;
  }

  it('should render six digit inputs and label', () => {
    const field = createField();
    cy.mount(<SixDigitCodeField field={field} label="Verification code" />);
    cy.get('[data-testid=label-code]').should(
      'contain.text',
      'Verification code',
    );
    cy.get('[data-testid=six-digit-code-code]').should('exist');
    for (let i = 0; i < 6; i++) {
      cy.get(`[data-testid=digit-input-${i}]`).should('exist');
    }
  });

  it('should accept digit input and advance focus', () => {
    const handleChange = cy.stub().as('handleChange');
    cy.mount(<StatefulWrapper onChanges={handleChange} />);
    cy.get('[data-testid=digit-input-0]').type('1');
    cy.get('@handleChange').should('have.been.calledWith', '1');
    cy.focused().should('have.attr', 'data-testid', 'digit-input-1');
    cy.get('[data-testid=digit-input-1]').type('2');
    cy.get('@handleChange').should('have.been.calledWith', '12');
    cy.get('[data-testid=digit-input-2]').type('3');
    cy.get('[data-testid=digit-input-3]').type('4');
    cy.get('[data-testid=digit-input-4]').type('5');
    cy.get('[data-testid=digit-input-5]').type('6');
    cy.get('@handleChange').should('have.been.calledWith', '123456');
  });

  it('should accept paste of full code', () => {
    const handleChange = cy.stub().as('handleChange');
    cy.mount(<StatefulWrapper onChanges={handleChange} />);
    cy.get('[data-testid=digit-input-0]').trigger('paste', {
      clipboardData: {
        getData: () => '123456',
      },
    });
    cy.get('@handleChange').should('have.been.calledWith', '123456');
    cy.focused().should('have.attr', 'data-testid', 'digit-input-5');
  });

  it('should show error when invalid and touched', () => {
    const field = createField({
      value: '12345',
      isValid: false,
      isTouched: true,
      errors: [{ message: 'Code must be 6 digits' }],
    });
    cy.mount(<SixDigitCodeField field={field} label="Code" />);
    cy.get('[data-testid=error-message-code]').should(
      'contain.text',
      'Code must be 6 digits',
    );
  });

  it('should not show error when valid', () => {
    const field = createField({ value: '123456', isValid: true });
    cy.mount(<SixDigitCodeField field={field} label="Code" />);
    cy.get('[data-testid=error-message-code]').should('not.exist');
  });

  it('should render required asterisk when required', () => {
    const field = createField();
    cy.mount(<SixDigitCodeField field={field} label="Code" required />);
    cy.get('[data-testid=label-code]')
      .find('.text-destructive')
      .should('exist');
  });

  it('should reject paste when not exactly 6 digits', () => {
    const handleChange = cy.stub().as('handleChange');
    cy.mount(<StatefulWrapper onChanges={handleChange} />);
    cy.get('[data-testid=digit-input-0]').trigger('paste', {
      clipboardData: {
        getData: () => '12345',
      },
    });
    cy.get('@handleChange').should('not.have.been.called');
  });

  it('should strip non-digits and accept exact-length paste', () => {
    const handleChange = cy.stub().as('handleChange');
    cy.mount(<StatefulWrapper onChanges={handleChange} />);
    cy.get('[data-testid=digit-input-0]').trigger('paste', {
      clipboardData: {
        getData: () => '12a34b56',
      },
    });
    cy.get('@handleChange').should('have.been.calledWith', '123456');
  });

  it('should ignore non-digit single-character input', () => {
    const handleChange = cy.stub().as('handleChange');
    cy.mount(<StatefulWrapper onChanges={handleChange} />);
    cy.get('[data-testid=digit-input-0]').type('a');
    cy.get('@handleChange').should('not.have.been.called');
    cy.get('[data-testid=digit-input-0]').should('have.value', '');
  });

  it('should submit when all six digits are entered', () => {
    const onSubmit = cy.stub().as('onSubmit');
    cy.mount(<StatefulWrapper onSubmit={onSubmit} />);
    cy.get('[data-testid=digit-input-0]').type('1');
    cy.get('[data-testid=digit-input-1]').type('2');
    cy.get('[data-testid=digit-input-2]').type('3');
    cy.get('[data-testid=digit-input-3]').type('4');
    cy.get('[data-testid=digit-input-4]').type('5');
    cy.get('[data-testid=digit-input-5]').type('6');
    cy.get('@onSubmit').should('have.been.calledOnce');
  });

  it('should have hidden input with name for form submission', () => {
    const field = createField({ value: '123456' });
    cy.mount(<SixDigitCodeField field={field} label="Code" />);
    cy.get('input[name="code"][type="hidden"]').should('have.value', '123456');
  });
});
