import EmailMFAForm from "./email-mfa.form";

describe('EmailMFAForm', () => {
  it('should render', () => {
    cy.mount(<EmailMFAForm />);
    cy.get('input[name="emailCode"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
    cy.contains('Email MFA is not yet implemented').should('exist');
  });

  it('should show alert when form is submitted (not yet implemented)', () => {
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alert');
    });
    cy.mount(<EmailMFAForm />);
    cy.get('input[name="emailCode"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.get('@alert').should('have.been.called');
  });

  it('should require code to be 6 digits', () => {
    cy.mount(<EmailMFAForm />);
    cy.get('input[name="emailCode"]').type('12345');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-emailCode"]').should('contain.text', 'Email code must be 6 digits');
  });

  it('should require code to contain only numbers', () => {
    cy.mount(<EmailMFAForm />);
    cy.get('input[name="emailCode"]').type('12345a');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-emailCode"]').should('contain.text', 'Email code must contain only numbers');
  });

  it('should have submit button disabled', () => {
    cy.mount(<EmailMFAForm />);
    cy.get('button[type="submit"]').should('be.disabled');
    cy.contains('Verify (Coming soon)').should('exist');
  });
});
