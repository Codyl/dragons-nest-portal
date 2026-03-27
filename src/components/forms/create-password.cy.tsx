import CreatePasswordForm from './create-password.form';

/** Reference: `reset-password.cy.tsx` (confirm-forgot-password API). */

describe('CreatePasswordForm', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should render', () => {
    cy.mount(<CreatePasswordForm />);
    cy.get('input[name="newPassword"]').should('exist');
    cy.get('input[name="confirmPassword"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should submit successfully', () => {
    cy.intercept('POST', '**/profile/create-password', {
      statusCode: 200,
      body: { message: 'ok', data: {} },
    });
    cy.mount(<CreatePasswordForm />);
    cy.get('input[name="newPassword"]').type('NewPassword123!');
    cy.get('input[name="confirmPassword"]').type('NewPassword123!');
    cy.get('button[type="submit"]').click();
  });

  it('should show error when API fails', () => {
    cy.intercept('POST', '**/profile/create-password', {
      statusCode: 400,
      body: { message: 'Could not create password' },
    });
    cy.mount(<CreatePasswordForm />);
    cy.get('input[name="newPassword"]').type('NewPassword123!');
    cy.get('input[name="confirmPassword"]').type('NewPassword123!');
    cy.get('button[type="submit"]').click();
    cy.contains('Could not create password').should('exist');
  });

  it('should show error when passwords do not match', () => {
    cy.mount(<CreatePasswordForm />);
    cy.get('input[name="newPassword"]').type('NewPassword123!');
    cy.get('input[name="confirmPassword"]').type('DifferentPassword123!');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-confirmPassword"]').should(
      'contain.text',
      'Passwords do not match',
    );
  });

  it('should show error when password is too short', () => {
    cy.mount(<CreatePasswordForm />);
    cy.get('input[name="newPassword"]').type('Short1!');
    cy.get('input[name="confirmPassword"]').type('Short1!');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-newPassword"]').should(
      'contain.text',
      'Password must be at least 8 characters long',
    );
  });

  it('should show loading state when submitting', () => {
    cy.intercept('POST', '**/profile/create-password', {
      delay: 1000,
      statusCode: 200,
      body: { message: 'ok', data: {} },
    });
    cy.mount(<CreatePasswordForm />);
    cy.get('input[name="newPassword"]').type('NewPassword123!');
    cy.get('input[name="confirmPassword"]').type('NewPassword123!');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('be.disabled');
  });
});
