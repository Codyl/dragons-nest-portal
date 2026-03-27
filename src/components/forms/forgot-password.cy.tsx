import ForgotPasswordForm from './forgot-password.form';

describe('ForgotPasswordForm', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('should render', () => {
    cy.mount(<ForgotPasswordForm />);
    cy.get('input[name="username"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should send reset code successfully', () => {
    cy.intercept('POST', '**/auth/forgot-password', {
      statusCode: 200,
      body: {
        message: 'Reset code sent',
      },
    });
    cy.mount(<ForgotPasswordForm />);
    cy.get('input[name="username"]').type('test@example.com');
    cy.get('button[type="submit"]').click();
    // Should navigate on success
  });

  it('should show error when username is invalid', () => {
    cy.intercept('POST', '**/auth/forgot-password', {
      statusCode: 400,
      body: {
        message: 'User not found',
      },
    });
    cy.mount(<ForgotPasswordForm />);
    cy.get('input[name="username"]').type('invalid@example.com');
    cy.get('button[type="submit"]').click();
    cy.contains('User not found').should('exist');
  });

  it('should require username field', () => {
    cy.mount(<ForgotPasswordForm />);
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-username"]').should(
      'contain.text',
      'Username or email is required',
    );
  });

  it('should show loading state when submitting', () => {
    cy.intercept('POST', '**/auth/forgot-password', {
      delay: 1000,
      statusCode: 200,
      body: {
        message: 'Reset code sent',
      },
    });
    cy.mount(<ForgotPasswordForm />);
    cy.get('input[name="username"]').type('test@example.com');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should pre-fill username from sessionStorage', () => {
    sessionStorage.setItem('username', 'prefilled@example.com');
    cy.mount(<ForgotPasswordForm />);
    cy.get('input[name="username"]').should(
      'have.value',
      'prefilled@example.com',
    );
  });

  it('should pre-fill username from preFilledEmail prop', () => {
    cy.mount(<ForgotPasswordForm preFilledEmail="prop@example.com" />);
    cy.get('input[name="username"]').should('have.value', 'prop@example.com');
  });
});
