import SMSMFAForm from "./sms-mfa.form";

describe('SMSMFAForm', () => {
  it('should render', () => {
    cy.mount(<SMSMFAForm />);
    cy.get('input[name="smsCode"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
    cy.contains('SMS MFA is not yet implemented').should('exist');
  });

  it('should show alert when form is submitted (not yet implemented)', () => {
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alert');
    });
    cy.mount(<SMSMFAForm />);
    cy.get('input[name="smsCode"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.get('@alert').should('have.been.called');
  });

  it('should require code to be 6 digits', () => {
    cy.mount(<SMSMFAForm />);
    cy.get('input[name="smsCode"]').type('12345');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-smsCode"]').should('contain.text', 'SMS code must be 6 digits');
  });

  it('should require code to contain only numbers', () => {
    cy.mount(<SMSMFAForm />);
    cy.get('input[name="smsCode"]').type('12345a');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-smsCode"]').should('contain.text', 'SMS code must contain only numbers');
  });

  it('should have submit button disabled', () => {
    cy.mount(<SMSMFAForm />);
    cy.get('button[type="submit"]').should('be.disabled');
    cy.contains('Verify (Coming soon)').should('exist');
  });
});
