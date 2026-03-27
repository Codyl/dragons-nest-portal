import MFAGenerateSecretForm from './mfa-generate-secret.form';

describe('MFAGenerateSecretForm', () => {
  beforeEach(() => {
    sessionStorage.setItem('username', 'test@example.com');
    sessionStorage.setItem('password', 'Password123!');
    sessionStorage.setItem('session', 'test-session');
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should render', () => {
    cy.intercept('POST', '**/auth/mfa/generate-authenticator-secret', {
      statusCode: 200,
      body: {
        data: {
          Session: 'new-session',
          qrString:
            'otpauth://totp/Test:test@example.com?secret=TEST123&issuer=Test',
        },
      },
    });
    cy.mount(<MFAGenerateSecretForm />);
    cy.get('[data-testid="six-digit-code-code"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should connect authenticator app successfully', () => {
    cy.intercept('POST', '**/auth/mfa/generate-authenticator-secret', {
      statusCode: 200,
      body: {
        data: {
          Session: 'new-session',
          qrString:
            'otpauth://totp/Test:test@example.com?secret=TEST123&issuer=Test',
        },
      },
    });
    cy.intercept('POST', '**/auth/mfa/connect-authenticator-app', {
      statusCode: 200,
      body: {
        data: {
          Session: 'final-session',
        },
      },
    });
    cy.mount(<MFAGenerateSecretForm />);
    cy.get('[data-testid="digit-input-0"]').type('123456');
    cy.get('button[type="submit"]').click();
    // Should navigate on success
  });

  it('should show error when code is invalid', () => {
    cy.intercept('POST', '**/auth/mfa/generate-authenticator-secret', {
      statusCode: 200,
      body: {
        data: {
          Session: 'new-session',
          qrString:
            'otpauth://totp/Test:test@example.com?secret=TEST123&issuer=Test',
        },
      },
    });
    cy.intercept('POST', '**/auth/mfa/connect-authenticator-app', {
      statusCode: 400,
      body: {
        message: 'Invalid code',
      },
    });
    cy.mount(<MFAGenerateSecretForm />);
    cy.get('[data-testid="digit-input-0"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid code').should('exist');
  });

  it('should require code field', () => {
    cy.intercept('POST', '**/auth/mfa/generate-authenticator-secret', {
      statusCode: 200,
      body: {
        data: {
          Session: 'new-session',
          qrString:
            'otpauth://totp/Test:test@example.com?secret=TEST123&issuer=Test',
        },
      },
    });
    cy.mount(<MFAGenerateSecretForm />);
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-code"]').should(
      'contain.text',
      'Code must be 6 digits',
    );
  });

  it('should show loading state when submitting', () => {
    cy.intercept('POST', '**/auth/mfa/generate-authenticator-secret', {
      statusCode: 200,
      body: {
        data: {
          Session: 'new-session',
          qrString:
            'otpauth://totp/Test:test@example.com?secret=TEST123&issuer=Test',
        },
      },
    });
    cy.intercept('POST', '**/auth/mfa/connect-authenticator-app', {
      delay: 1000,
      statusCode: 200,
      body: {
        data: {
          Session: 'final-session',
        },
      },
    });
    cy.mount(<MFAGenerateSecretForm />);
    cy.get('[data-testid="digit-input-0"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should render in settings mode with userEmail', () => {
    cy.intercept('POST', '**/auth/mfa/generate-authenticator-secret', {
      statusCode: 200,
      body: {
        data: {
          Session: 'new-session',
          qrString:
            'otpauth://totp/Test:user@example.com?secret=TEST123&issuer=Test',
        },
      },
    });
    cy.mount(
      <MFAGenerateSecretForm
        source="settings"
        userEmail="user@example.com"
      />,
    );
    cy.get('[data-testid="six-digit-code-code"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });
});
