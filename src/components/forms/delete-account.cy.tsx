import DeleteAccountForm from "./delete-account.form";

describe('DeleteAccountForm', () => {
  it('should render', () => {
    cy.mount(<DeleteAccountForm />);
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
    cy.contains('Are you sure you want to delete your account?').should('exist');
  });

  it('should delete account successfully', () => {
    cy.intercept('DELETE', '**/profile', {
      statusCode: 200,
      body: {
        message: 'Account deleted successfully',
      },
    });
    cy.mount(<DeleteAccountForm />);
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    // Should handle success
  });

  it('should show error when password is incorrect', () => {
    cy.intercept('DELETE', '**/profile', {
      statusCode: 400,
      body: {
        message: 'Invalid password',
      },
    });
    cy.mount(<DeleteAccountForm />);
    cy.get('input[name="password"]').type('WrongPassword123!');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid password').should('exist');
  });

  it('should require password field', () => {
    cy.mount(<DeleteAccountForm />);
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-password"]').should('contain.text', 'Password is required');
  });

  it('should show loading state when submitting', () => {
    cy.intercept('DELETE', '**/profile', {
      delay: 1000,
      statusCode: 200,
      body: {
        message: 'Account deleted successfully',
      },
    });
    cy.mount(<DeleteAccountForm />);
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('be.disabled');
  });
});
