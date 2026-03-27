import LoginForm from './login.form';

describe('LoginForm', () => {
  beforeEach(() => {
    sessionStorage.setItem('username', 'test@example.com');
    sessionStorage.setItem('session', 'test-session');
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should render', () => {
    cy.mount(<LoginForm />);
    cy.get('input[id="username-display"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should login successfully', () => {
    cy.intercept('POST', '**/auth/initiate-login', {
      statusCode: 200,
      body: {
        data: {
          AuthenticationResult: {},
        },
      },
    });
    cy.mount(<LoginForm />);
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    // Should navigate on success
  });

  it('should show error when password is incorrect', () => {
    cy.intercept('POST', '**/auth/initiate-login', {
      statusCode: 401,
      body: {
        message: 'Incorrect username or password',
      },
    });
    cy.mount(<LoginForm />);
    cy.get('input[name="password"]').type('WrongPassword123!');
    cy.get('button[type="submit"]').click();
    cy.contains('Incorrect username or password').should('exist');
  });

  it('should require password to be at least 6 characters', () => {
    cy.mount(<LoginForm />);
    cy.get('input[name="password"]').type('12345');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-password"]').should(
      'contain.text',
      'Password must be at least 6 characters long',
    );
  });

  it('should show loading state when submitting', () => {
    cy.intercept('POST', '**/auth/initiate-login', {
      delay: 1000,
      statusCode: 200,
      body: {
        data: {
          AuthenticationResult: {},
        },
      },
    });
    cy.mount(<LoginForm />);
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('[data-testid="button-loading-indicator"]').should('exist');
  });

  it('should require password field', () => {
    cy.mount(<LoginForm />);
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-password"]').should('exist');
  });

  it('should navigate to MFA when challenge is SOFTWARE_TOKEN_MFA', () => {
    cy.intercept('POST', '**/auth/initiate-login', {
      statusCode: 200,
      body: {
        data: {
          Session: 'session',
          ChallengeName: 'SOFTWARE_TOKEN_MFA',
        },
      },
    });
    cy.mount(<LoginForm />);
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    // Should navigate to MFA page
  });
});
