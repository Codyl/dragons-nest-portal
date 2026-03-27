import ConfirmSignupForm from './confirm-signup.form';

describe('ConfirmSignupForm', () => {
  beforeEach(() => {
    sessionStorage.setItem('username', 'test@example.com');
    sessionStorage.setItem('session', 'test-session');
    sessionStorage.setItem('password', 'Password123!');
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should render', () => {
    cy.mount(<ConfirmSignupForm />);
    cy.get('[data-testid="six-digit-code-code"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should confirm signup successfully', () => {
    cy.intercept('POST', '**/auth/confirm-signup', {
      statusCode: 200,
      body: {
        data: {
          Session: 'session',
          AuthenticationResult: {},
        },
      },
    });
    cy.mount(<ConfirmSignupForm />);
    cy.get('[data-testid="digit-input-0"]').type('123456');
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
    cy.get('[data-testid="digit-input-0"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid code').should('exist');
  });

  it('should require code to be 6 digits', () => {
    cy.mount(<ConfirmSignupForm />);
    cy.get('[data-testid="digit-input-0"]').type('12345');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-code"]').should(
      'contain.text',
      'Verification code must be 6 digits',
    );
  });

  it('should strip non-digits and require 6 digits', () => {
    cy.mount(<ConfirmSignupForm />);
    cy.get('[data-testid="digit-input-0"]').type('12345a');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-code"]').should(
      'contain.text',
      'Verification code must be 6 digits',
    );
  });

  it('should show loading state when submitting', () => {
    cy.intercept('POST', '**/auth/confirm-signup', {
      delay: 1000,
      statusCode: 200,
      body: {
        data: {
          Session: 'session',
          AuthenticationResult: {},
        },
      },
    });
    cy.mount(<ConfirmSignupForm />);
    cy.get('[data-testid="digit-input-0"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('[data-testid="button-loading-indicator"]').should('exist');
  });

  it('should require code field', () => {
    cy.mount(<ConfirmSignupForm />);
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-code"]').should('exist');
  });
});
