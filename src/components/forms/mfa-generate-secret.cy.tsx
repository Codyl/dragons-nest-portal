import MFAGenerateSecretForm from "./mfa-generate-secret.form";

describe('MFAGenerateSecretForm', () => {
  beforeEach(() => {
    sessionStorage.setItem("username", "test@example.com");
    sessionStorage.setItem("password", "Password123!");
    sessionStorage.setItem("session", "test-session");
    localStorage.setItem("AccessToken", "test-token");
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should render', () => {
    cy.intercept('POST', '**/auth/associate-software-token', {
      statusCode: 200,
      body: {
        data: {
          Session: 'new-session',
          qrString: 'otpauth://totp/Test:test@example.com?secret=TEST123&issuer=Test',
        },
      },
    });
    cy.mount(<MFAGenerateSecretForm />);
    cy.get('input[name="code"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should connect authenticator app successfully', () => {
    cy.intercept('POST', '**/auth/associate-software-token', {
      statusCode: 200,
      body: {
        data: {
          Session: 'new-session',
          qrString: 'otpauth://totp/Test:test@example.com?secret=TEST123&issuer=Test',
        },
      },
    });
    cy.intercept('POST', '**/auth/verify-software-token', {
      statusCode: 200,
      body: {
        data: {
          Session: 'final-session',
        },
      },
    });
    cy.mount(<MFAGenerateSecretForm />);
    cy.get('input[name="code"]').type('123456');
    cy.get('button[type="submit"]').click();
    // Should navigate on success
  });

  it('should show error when code is invalid', () => {
    cy.intercept('POST', '**/auth/associate-software-token', {
      statusCode: 200,
      body: {
        data: {
          Session: 'new-session',
          qrString: 'otpauth://totp/Test:test@example.com?secret=TEST123&issuer=Test',
        },
      },
    });
    cy.intercept('POST', '**/auth/verify-software-token', {
      statusCode: 400,
      body: {
        message: 'Invalid code',
      },
    });
    cy.mount(<MFAGenerateSecretForm />);
    cy.get('input[name="code"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid code').should('exist');
  });

  it('should require code field', () => {
    cy.intercept('POST', '**/auth/associate-software-token', {
      statusCode: 200,
      body: {
        data: {
          Session: 'new-session',
          qrString: 'otpauth://totp/Test:test@example.com?secret=TEST123&issuer=Test',
        },
      },
    });
    cy.mount(<MFAGenerateSecretForm />);
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-code"]').should('contain.text', 'Code is required');
  });

  it('should show loading state when submitting', () => {
    cy.intercept('POST', '**/auth/associate-software-token', {
      statusCode: 200,
      body: {
        data: {
          Session: 'new-session',
          qrString: 'otpauth://totp/Test:test@example.com?secret=TEST123&issuer=Test',
        },
      },
    });
    cy.intercept('POST', '**/auth/verify-software-token', {
      delay: 1000,
      statusCode: 200,
      body: {
        data: {
          Session: 'final-session',
        },
      },
    });
    cy.mount(<MFAGenerateSecretForm />);
    cy.get('input[name="code"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('be.disabled');
  });
});
