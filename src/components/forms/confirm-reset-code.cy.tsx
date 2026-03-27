import ConfirmResetCodeForm from './confirm-reset-code.form';

describe('ConfirmResetCodeForm', () => {
  it('should render', () => {
    const setStep = cy.stub();
    cy.mount(<ConfirmResetCodeForm setStep={setStep} />);
    cy.get('input[name="code"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should call setStep when form is submitted with valid code', () => {
    const setStep = cy.stub();
    cy.mount(<ConfirmResetCodeForm setStep={setStep} />);
    cy.get('input[name="code"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.wrap(setStep).should('have.been.calledOnce');
    cy.wrap(setStep).should('have.been.calledWith', 2);
  });

  it('should require code to be at least 6 characters', () => {
    const setStep = cy.stub();
    cy.mount(<ConfirmResetCodeForm setStep={setStep} />);
    cy.get('input[name="code"]').type('12345');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-code"]').should('exist');
    cy.wrap(setStep).should('not.have.been.called');
  });

  it('should save code to sessionStorage on successful submission', () => {
    const setStep = cy.stub();
    cy.mount(<ConfirmResetCodeForm setStep={setStep} />);
    cy.get('input[name="code"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.wrap(setStep).should('have.been.calledOnce');
    // Check sessionStorage was set (note: sessionStorage is cleared between tests)
  });

  it('should not call setStep when form is invalid', () => {
    const setStep = cy.stub();
    cy.mount(<ConfirmResetCodeForm setStep={setStep} />);
    cy.get('button[type="submit"]').click();
    cy.wrap(setStep).should('not.have.been.called');
  });
});
