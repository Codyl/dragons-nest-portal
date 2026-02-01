import MFAConnectForm from "./mfa-connect.form";

describe('MFAConnectForm', () => {
  it('should render', () => {
    cy.mount(<MFAConnectForm />);
    cy.get('input[name="userCode"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should connect authenticator successfully', () => {
    cy.intercept('POST', '**/auth/mfa/connect-authenticator-app', {
      statusCode: 200,
      body: {
        qrString: 'otpauth://totp/Test:test@example.com?secret=TEST123&issuer=Test',
      },
    });
    cy.mount(<MFAConnectForm />);
    cy.get('input[name="userCode"]').type('123456');
    cy.get('button[type="submit"]').click();
    // Should show QR code on success
  });

  it('should show error when connection fails', () => {
    cy.intercept('POST', '**/auth/mfa/connect-authenticator-app', {
      statusCode: 400,
      body: {
        message: 'Connection failed',
      },
    });
    cy.mount(<MFAConnectForm />);
    cy.get('input[name="userCode"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.contains('Connection failed').should('exist');
  });

  it('should require userCode field', () => {
    cy.mount(<MFAConnectForm />);
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-userCode"]').should('contain.text', 'User code is required');
  });

  it('should show loading state when submitting', () => {
    cy.intercept('POST', '**/auth/mfa/connect-authenticator-app', {
      delay: 1000,
      statusCode: 200,
      body: {
        qrString: 'otpauth://totp/Test:test@example.com?secret=TEST123&issuer=Test',
      },
    });
    cy.mount(<MFAConnectForm />);
    cy.get('input[name="userCode"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('[data-testid="button-loading-indicator"]').should('exist');
  });
});
