import EmailOTPForm from "./email-otp.form";

describe('EmailOTPForm', () => {
  beforeEach(() => {
    sessionStorage.setItem("username", "test@example.com");
    sessionStorage.setItem("session", "test-session");
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should render', () => {
    cy.mount(<EmailOTPForm />);
    cy.get('input[name="emailCode"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should verify email OTP successfully', () => {
    cy.intercept('POST', '**/auth/answer-otp', {
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
    cy.mount(<EmailOTPForm />);
    cy.get('input[name="emailCode"]').type('12345678');
    cy.get('button[type="submit"]').click();
    // Should navigate on success
  });

  it('should show error when code is invalid', () => {
    cy.intercept('POST', '**/auth/answer-otp', {
      statusCode: 400,
      body: {
        message: 'Invalid code',
      },
    });
    cy.mount(<EmailOTPForm />);
    cy.get('input[name="emailCode"]').type('12345678');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid code').should('exist');
  });

  it('should require code to be exactly 8 digits', () => {
    cy.mount(<EmailOTPForm />);
    cy.get('input[name="emailCode"]').type('1234567');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-emailCode"]').should('contain.text', 'Email code must be 8 digits');
  });

  it('should require code to contain only numbers', () => {
    cy.mount(<EmailOTPForm />);
    cy.get('input[name="emailCode"]').type('1234567a');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-emailCode"]').should('contain.text', 'Email code must contain only numbers');
  });

  it('should show loading state when submitting', () => {
    cy.intercept('POST', '**/auth/answer-otp', {
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
    cy.mount(<EmailOTPForm />);
    cy.get('input[name="emailCode"]').type('12345678');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('be.disabled');
  });
});
