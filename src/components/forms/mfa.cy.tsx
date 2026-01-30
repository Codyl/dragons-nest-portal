import MFAForm from "./mfa.form";

describe('MFAForm', () => {
  beforeEach(() => {
    sessionStorage.setItem("username", "test@example.com");
    sessionStorage.setItem("password", "Password123!");
    sessionStorage.setItem("session", "test-session");
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should render', () => {
    cy.mount(<MFAForm />);
    cy.get('input[name="softwareTokenMfaCode"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should verify MFA code successfully', () => {
    cy.intercept('POST', '**/auth/mfa', {
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
    cy.mount(<MFAForm />);
    cy.get('input[name="softwareTokenMfaCode"]').type('123456');
    cy.get('button[type="submit"]').click();
    // Should navigate on success
  });

  it('should show error when code is invalid', () => {
    cy.intercept('POST', '**/auth/mfa', {
      statusCode: 400,
      body: {
        message: 'Invalid code',
      },
    });
    cy.mount(<MFAForm />);
    cy.get('input[name="softwareTokenMfaCode"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid code').should('exist');
  });

  it('should require code to be 6 digits', () => {
    cy.mount(<MFAForm />);
    cy.get('input[name="softwareTokenMfaCode"]').type('12345');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-softwareTokenMfaCode"]').should('contain.text', 'MFA code must be 6 digits');
  });

  it('should require code to contain only numbers', () => {
    cy.mount(<MFAForm />);
    cy.get('input[name="softwareTokenMfaCode"]').type('12345a');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-softwareTokenMfaCode"]').should('contain.text', 'MFA code must contain only numbers');
  });

  it('should show loading state when submitting', () => {
    cy.intercept('POST', '**/auth/mfa', {
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
    cy.mount(<MFAForm />);
    cy.get('input[name="softwareTokenMfaCode"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('be.disabled');
    cy.contains('Verifying...').should('exist');
  });
});
