import AccountRecoveryForm from './account-recovery.form';

describe('AccountRecoveryForm', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('should render', () => {
    cy.mount(<AccountRecoveryForm />);
    cy.get('input[name="username"]').should('exist');
    cy.get('input[name="code"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should recover account successfully', () => {
    cy.intercept('POST', '**/auth/account-recovery/verify-code', {
      statusCode: 200,
      body: {
        message: 'Account recovered successfully',
        data: { AuthenticationResult: {} },
      },
    });
    cy.mount(<AccountRecoveryForm />);
    cy.get('input[name="username"]').type('test@example.com');
    cy.get('input[name="code"]').type('123456');
    cy.get('input[name="password"]').type('SecurePassword123!');
    cy.get('button[type="submit"]').click();
  });

  it('should show error when recovery code is invalid', () => {
    cy.intercept('POST', '**/auth/account-recovery/verify-code', {
      statusCode: 400,
      body: {
        message: 'Temporary recovery code is invalid',
      },
    });
    cy.mount(<AccountRecoveryForm />);
    cy.get('input[name="username"]').type('test@example.com');
    cy.get('input[name="code"]').type('bad-code');
    cy.get('input[name="password"]').type('SecurePassword123!');
    cy.get('button[type="submit"]').click();
    cy.contains('Temporary recovery code is invalid').should('exist');
  });

  it('should require all fields', () => {
    cy.mount(<AccountRecoveryForm />);
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-username"]').should(
      'contain.text',
      'Username or email is required',
    );
    cy.get('[data-testid="error-message-code"]').should(
      'contain.text',
      'Temporary recovery code is required',
    );
    cy.get('[data-testid="error-message-password"]').should(
      'contain.text',
      'Password must be at least 8 characters',
    );
  });

  it('should show loading state when submitting', () => {
    cy.intercept('POST', '**/auth/account-recovery/verify-code', {
      delay: 1000,
      statusCode: 200,
      body: {
        message: 'Account recovered successfully',
        data: { AuthenticationResult: {} },
      },
    });
    cy.mount(<AccountRecoveryForm />);
    cy.get('input[name="username"]').type('test@example.com');
    cy.get('input[name="code"]').type('123456');
    cy.get('input[name="password"]').type('SecurePassword123!');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should pre-fill username from sessionStorage', () => {
    sessionStorage.setItem('username', 'prefilled@example.com');
    cy.mount(<AccountRecoveryForm />);
    cy.get('input[name="username"]').should(
      'have.value',
      'prefilled@example.com',
    );
  });

  it('should pre-fill username from preFilledEmail prop', () => {
    cy.mount(<AccountRecoveryForm preFilledEmail="prop@example.com" />);
    cy.get('input[name="username"]').should('have.value', 'prop@example.com');
  });
});
