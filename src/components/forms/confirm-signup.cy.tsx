import ConfirmSignupForm from "./confirm-signup.form";

describe('ConfirmSignupForm', () => {
  beforeEach(() => {
    sessionStorage.setItem("username", "test@example.com");
    sessionStorage.setItem("session", "test-session");
    sessionStorage.setItem("password", "Password123!");
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should render', () => {
    cy.mount(<ConfirmSignupForm />);
    cy.get('input[name="code"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should confirm signup successfully', () => {
    cy.intercept('POST', '**/auth/confirm-signup', {
      statusCode: 200,
      body: {
        data: {
          Session: 'session',
          AuthenticationResult: {
            AccessToken: 'accessToken',
            RefreshToken: 'refreshToken',
            IdToken: 'idToken',
          },
        },
      },
    });
    cy.mount(<ConfirmSignupForm />);
    cy.get('input[name="code"]').type('123456');
    cy.get('button[type="submit"]').click();
    // Should navigate on success, but we can't test navigation in component tests
  });

  it('should show error when code is invalid', () => {
    cy.intercept('POST', '**/auth/confirm-signup', {
      statusCode: 400,
      body: {
        message: 'Invalid code',
      },
    });
    cy.mount(<ConfirmSignupForm />);
    cy.get('input[name="code"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid code').should('exist');
  });

  it('should require code to be 6 digits', () => {
    cy.mount(<ConfirmSignupForm />);
    cy.get('input[name="code"]').type('12345');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-code"]').should('contain.text', 'Confirmation code must be 6 digits');
  });

  it('should require code to contain only numbers', () => {
    cy.mount(<ConfirmSignupForm />);
    cy.get('input[name="code"]').type('12345a');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-code"]').should('contain.text', 'Confirmation code must contain only numbers');
  });

  it('should show loading state when submitting', () => {
    cy.intercept('POST', '**/auth/confirm-signup', {
      delay: 1000,
      statusCode: 200,
      body: {
        data: {
          Session: 'session',
          AuthenticationResult: {
            AccessToken: 'accessToken',
            RefreshToken: 'refreshToken',
            IdToken: 'idToken',
          },
        },
      },
    });
    cy.mount(<ConfirmSignupForm />);
    cy.get('input[name="code"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('be.disabled');
    cy.contains('Verifying...').should('exist');
  });

  it('should require code field', () => {
    cy.mount(<ConfirmSignupForm />);
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-code"]').should('exist');
  });
});
