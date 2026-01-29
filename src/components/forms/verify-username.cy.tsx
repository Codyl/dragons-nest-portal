import VerifyUsernameForm from "./verify-username.form";

describe('VerifyUsernameForm', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('should render', () => {
    cy.mount(<VerifyUsernameForm />);
    cy.get('input[name="username"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should verify username successfully', () => {
    cy.intercept('POST', '**/auth/verify-username', {
      statusCode: 200,
      body: {
        data: {
          Session: 'test-session',
          AvailableChallenges: ['PASSWORD_VERIFIER'],
        },
      },
    });
    cy.mount(<VerifyUsernameForm />);
    cy.get('input[name="username"]').type('test@example.com');
    cy.get('button[type="submit"]').click();
    // Should navigate on success
  });

  it('should show error when username is invalid', () => {
    cy.intercept('POST', '**/auth/verify-username', {
      statusCode: 400,
      body: {
        message: 'User not found',
      },
    });
    cy.mount(<VerifyUsernameForm />);
    cy.get('input[name="username"]').type('invalid@example.com');
    cy.get('button[type="submit"]').click();
    cy.contains('User not found').should('exist');
  });

  it('should require username field', () => {
    cy.mount(<VerifyUsernameForm />);
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-username"]').should('contain.text', 'Email or username is required');
  });

  it('should show loading state when submitting', () => {
    cy.intercept('POST', '**/auth/verify-username', {
      delay: 1000,
      statusCode: 200,
      body: {
        data: {
          Session: 'test-session',
          AvailableChallenges: ['PASSWORD_VERIFIER'],
        },
      },
    });
    cy.mount(<VerifyUsernameForm />);
    cy.get('input[name="username"]').type('test@example.com');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('be.disabled');
  });
});
