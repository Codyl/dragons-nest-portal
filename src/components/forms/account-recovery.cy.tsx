import AccountRecoveryForm from './account-recovery.form';

describe('AccountRecoveryForm', () => {
  it('should render', () => {
    cy.mount(<AccountRecoveryForm />);
    cy.contains('one-time magic link').should('exist');
  });

  it('should include fallback messaging when no contact method exists', () => {
    cy.mount(<AccountRecoveryForm />);
    cy.contains('recovery path is unavailable').should('exist');
  });

  it('should show back to sign in link', () => {
    cy.mount(<AccountRecoveryForm />);
    cy.contains('Back to sign in')
      .should('have.attr', 'href')
      .and('eq', '/login');
  });

  it('should show create account link for edge-case fallback', () => {
    cy.mount(<AccountRecoveryForm />);
    cy.contains('Create a new account')
      .should('have.attr', 'href')
      .and('eq', '/signup');
  });
});
