import CreateAccountForm from "./create-account.form";

describe('CreateAccountForm', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('should render', () => {
    cy.mount(<CreateAccountForm />);
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('input[name="confirmPassword"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should create account successfully', () => {
    cy.intercept('POST', '**/auth/signup', {
      statusCode: 200,
      body: {
        data: {
          Session: 'test-session',
        },
      },
    });
    cy.mount(<CreateAccountForm />);
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    // Should navigate to confirm-signup on success
  });

  it('should show error when email is invalid', () => {
    cy.mount(<CreateAccountForm />);
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-email"]').should('contain.text', 'Please enter a valid email address');
  });

  it('should show error when passwords do not match', () => {
    cy.mount(<CreateAccountForm />);
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('DifferentPassword123!');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-confirmPassword"]').should('contain.text', 'Passwords do not match');
  });

  it('should show error when password is too short', () => {
    cy.mount(<CreateAccountForm />);
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Short1!');
    cy.get('input[name="confirmPassword"]').type('Short1!');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-password"]').should('contain.text', 'Password must be at least 8 characters long');
  });

  it('should show error when password is missing uppercase letter', () => {
    cy.mount(<CreateAccountForm />);
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123!');
    cy.get('input[name="confirmPassword"]').type('password123!');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-password"]').should('contain.text', 'Password must contain at least one uppercase letter');
  });

  it('should show error when password is missing lowercase letter', () => {
    cy.mount(<CreateAccountForm />);
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('PASSWORD123!');
    cy.get('input[name="confirmPassword"]').type('PASSWORD123!');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-password"]').should('contain.text', 'Password must contain at least one lowercase letter');
  });

  it('should show error when password is missing number', () => {
    cy.mount(<CreateAccountForm />);
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password!');
    cy.get('input[name="confirmPassword"]').type('Password!');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-password"]').should('contain.text', 'Password must contain at least one number');
  });

  it('should show loading state when submitting', () => {
    cy.intercept('POST', '**/auth/signup', {
      delay: 1000,
      statusCode: 200,
      body: {
        data: {
          Session: 'test-session',
        },
      },
    });
    cy.mount(<CreateAccountForm />);
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('be.disabled');
    cy.contains('Creating account...').should('exist');
  });

  it('should show error when signup fails', () => {
    cy.intercept('POST', '**/auth/signup', {
      statusCode: 400,
      body: {
        message: 'User already exists',
      },
    });
    cy.mount(<CreateAccountForm />);
    cy.get('input[name="email"]').type('existing@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.contains('User already exists').should('exist');
  });
});
