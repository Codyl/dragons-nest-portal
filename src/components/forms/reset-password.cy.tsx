import ResetPasswordForm from "./reset-password.form";

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    sessionStorage.setItem("username", "test@example.com");
    sessionStorage.setItem("code", "123456");
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should render', () => {
    cy.mount(<ResetPasswordForm />);
    cy.get('input[name="newPassword"]').should('exist');
    cy.get('input[name="confirmPassword"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should reset password successfully', () => {
    cy.intercept('POST', '**/auth/confirm-forgot-password', {
      statusCode: 200,
      body: {
        data: {
          AuthenticationResult: {
            AccessToken: 'accessToken',
            RefreshToken: 'refreshToken',
            IdToken: 'idToken',
          },
        },
      },
    });
    cy.mount(<ResetPasswordForm />);
    cy.get('input[name="newPassword"]').type('NewPassword123!');
    cy.get('input[name="confirmPassword"]').type('NewPassword123!');
    cy.get('button[type="submit"]').click();
    // Should navigate on success
  });

  it('should show error when reset fails', () => {
    cy.intercept('POST', '**/auth/confirm-forgot-password', {
      statusCode: 400,
      body: {
        message: 'Invalid code',
      },
    });
    cy.mount(<ResetPasswordForm />);
    cy.get('input[name="newPassword"]').type('NewPassword123!');
    cy.get('input[name="confirmPassword"]').type('NewPassword123!');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid code').should('exist');
  });

  it('should show error when passwords do not match', () => {
    cy.mount(<ResetPasswordForm />);
    cy.get('input[name="newPassword"]').type('NewPassword123!');
    cy.get('input[name="confirmPassword"]').type('DifferentPassword123!');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-confirmPassword"]').should('contain.text', 'Passwords do not match');
  });

  it('should show error when password is too short', () => {
    cy.mount(<ResetPasswordForm />);
    cy.get('input[name="newPassword"]').type('Short1!');
    cy.get('input[name="confirmPassword"]').type('Short1!');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-newPassword"]').should('contain.text', 'Password must be at least 8 characters long');
  });

  it('should show error when password is missing uppercase letter', () => {
    cy.mount(<ResetPasswordForm />);
    cy.get('input[name="newPassword"]').type('password123!');
    cy.get('input[name="confirmPassword"]').type('password123!');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-newPassword"]').should('contain.text', 'Password must contain at least one uppercase letter');
  });

  it('should show error when password is missing lowercase letter', () => {
    cy.mount(<ResetPasswordForm />);
    cy.get('input[name="newPassword"]').type('PASSWORD123!');
    cy.get('input[name="confirmPassword"]').type('PASSWORD123!');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-newPassword"]').should('contain.text', 'Password must contain at least one lowercase letter');
  });

  it('should show error when password is missing number', () => {
    cy.mount(<ResetPasswordForm />);
    cy.get('input[name="newPassword"]').type('Password!');
    cy.get('input[name="confirmPassword"]').type('Password!');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-newPassword"]').should('contain.text', 'Password must contain at least one number');
  });

  it('should show loading state when submitting', () => {
    cy.intercept('POST', '**/auth/confirm-forgot-password', {
      delay: 1000,
      statusCode: 200,
      body: {
        data: {
          AuthenticationResult: {
            AccessToken: 'accessToken',
            RefreshToken: 'refreshToken',
            IdToken: 'idToken',
          },
        },
      },
    });
    cy.mount(<ResetPasswordForm />);
    cy.get('input[name="newPassword"]').type('NewPassword123!');
    cy.get('input[name="confirmPassword"]').type('NewPassword123!');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('be.disabled');
  });
});
