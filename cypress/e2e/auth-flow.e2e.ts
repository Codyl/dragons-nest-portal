/// <reference types="cypress" />
/// <reference path="../../cypress.d.ts" />
/**
 * E2E: Auth API endpoints (tested individually) and password-based auth flows.
 * Uses cognito backend endpoints so tests can run per-endpoint where possible.
 * Excludes MFA and Google SSO — see cypress/e2e/README.md.
 * Run with app: pnpm dev then pnpm cypress:run:e2e:app
 */

const STATIC_EMAIL = () => Cypress.env('VITE_STATIC_EMAIL') as string;
const MAILSLURP_EMAIL = () => Cypress.env('VITE_MAILSLURP_EMAIL') as string;
const PASSWORD = 'Password123!';

describe('Auth API endpoints', () => {
  beforeEach(() => {
    cy.clearCookies();
  });

  it('POST /auth/verify-username returns session and available challenges', () => {
    cy.authApiRequest('POST', '/auth/verify-username', {
      email: STATIC_EMAIL(),
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('message');
      expect(res.body.data).to.have.property('Session').that.is.a('string');
      expect(res.body.data)
        .to.have.property('AvailableChallenges')
        .that.is.an('array');
    });
  });

  it('POST /auth/initiate-signup returns 200 for new email', () => {
    cy.authApiRequest('POST', '/auth/initiate-signup', {
      email: MAILSLURP_EMAIL(),
      password: PASSWORD,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('message');
      expect(res.body.data).to.have.property('Session');
    });
  });

  it('POST /auth/initiate-login returns 200 and sets cookies when session + password valid', () => {
    cy.authApiRequest('POST', '/auth/verify-username', {
      email: STATIC_EMAIL(),
    })
      .then((verifyRes) => {
        expect(verifyRes.status).to.eq(200);
        const session = (verifyRes.body as { data?: { Session?: string } })
          ?.data?.Session;
        expect(session).to.be.a('string');
        return cy.authApiRequest('POST', '/auth/initiate-login', {
          username: STATIC_EMAIL(),
          password: PASSWORD,
          session,
        });
      })
      .then((loginRes) => {
        expect(loginRes.status).to.eq(200);
        expect(loginRes.body.data).to.have.property('AuthenticationResult');
        const setCookie =
          (loginRes.headers as Record<string, string | string[]>)[
            'set-cookie'
          ] ??
          (loginRes.headers as Record<string, string | string[]>)['Set-Cookie'];
        expect(setCookie).to.be.ok;
      });
  });

  it('POST /auth/forgot-password returns 200', () => {
    cy.authApiRequest('POST', '/auth/forgot-password', {
      username: STATIC_EMAIL(),
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('message');
    });
  });

  it('GET /users/me returns 401 when unauthenticated', () => {
    cy.authApiRequest('GET', '/users/me').then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it('GET /users/me returns 200 when authenticated', () => {
    cy.loginViaApi(STATIC_EMAIL(), PASSWORD);
    cy.authApiRequest('GET', '/users/me').then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data).to.have.property('sub');
    });
  });
});

describe('Auth flow (password-based)', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/auth/verify-username').as('verifyUsername');
    cy.intercept('POST', '**/auth/initiate-login').as('login');
    cy.intercept('POST', '**/auth/initiate-signup').as('signup');
    cy.intercept('POST', '**/auth/confirm-signup').as('confirmSignup');
  });

  it('create user → home (happy path)', () => {
    cy.visit('/signup');
    cy.get('input[name="email"]').type(MAILSLURP_EMAIL());
    cy.get('input[name="password"]').type(PASSWORD);
    cy.get('input[name="confirmPassword"]').type(PASSWORD);
    cy.get('button[type="submit"]').click();
    cy.wait('@signup');
    cy.url().should('include', '/confirm-signup');

    cy.get('input[name="code"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.wait('@confirmSignup');

    cy.contains('Welcome Home').should('be.visible');
  });

  it('login → home (happy path)', () => {
    cy.loginViaApi(STATIC_EMAIL(), PASSWORD);
    cy.visit('/');
    cy.contains('Welcome Home').should('be.visible');
    cy.reload();
    cy.contains('Welcome Home').should('be.visible');
  });

  it('login → account settings (update phone)', () => {
    cy.loginViaApi(STATIC_EMAIL(), PASSWORD);
    cy.visit('/');
    cy.contains('Welcome Home').should('be.visible');

    cy.contains('Account Settings').click();
    cy.url().should('include', '/account-settings');
    cy.get('[data-slot="dialog-close"]').click();
    cy.get('input[name="phone_number"]').clear().type('2086003434');
    cy.intercept('PUT', '**/users/me/account').as('updateUserSettings');
    cy.get('button[type="submit"]').click();
    cy.wait('@updateUserSettings');
    cy.reload();
    cy.get('[data-slot="dialog-close"]').click();
    cy.get('input[name="phone_number"]').should('have.value', '(208) 600-3434');
    cy.get('input[name="phone_number"]').clear();
    cy.get('button[type="submit"]').click();
    cy.wait('@updateUserSettings');
    cy.reload();
    cy.get('[data-slot="dialog-close"]').click();
    cy.intercept('GET', '**/users/me').as('me');
    cy.wait('@me');
    cy.get('input[name="phone_number"]').should('have.value', '');
  });

  it('signup → account settings → delete account', () => {
    cy.visit('/signup');
    cy.get('input[name="email"]').type(MAILSLURP_EMAIL());
    cy.get('input[name="password"]').type(PASSWORD);
    cy.get('input[name="confirmPassword"]').type(PASSWORD);
    cy.get('button[type="submit"]').click();
    cy.wait('@signup');
    cy.url().should('include', '/confirm-signup');

    cy.get('input[name="code"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.wait('@confirmSignup');

    cy.contains('Account Settings').click();
    cy.url().should('include', '/account-settings');
    cy.get('[data-slot="dialog-close"]').click();
    cy.get('button').contains('Advanced').click();
    cy.contains('Delete Account').click();
    cy.get('input[name="password"]').type(PASSWORD);
    cy.intercept('DELETE', '**/users/me').as('deleteAccount');
    cy.get('div[role="dialog"]').find('button[type="submit"]').click();
    cy.wait('@deleteAccount');
    cy.url().should('include', '/verify-username');

    cy.get('input[name="username"]').type(MAILSLURP_EMAIL());
    cy.get('button[type="submit"]').click();
    cy.wait('@verifyUsername');
    cy.get('input[name="password"]').type(PASSWORD);
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message"]').should(
      'contain.text',
      'Incorrect username or password.',
    );
  });

  it('login → change password flow', () => {
    cy.loginViaApi(STATIC_EMAIL(), PASSWORD);
    cy.visit('/security-settings');
    cy.get('[data-slot="dialog-close"]').click();
    cy.contains('Change Password').click();
    cy.get('input[name="currentPassword"]').type(PASSWORD);
    cy.get('input[name="newPassword"]').type('NewPassword123!');
    cy.get('input[name="confirmPassword"]').type('NewPassword123!');
    cy.intercept('POST', '**/users/me/change-password').as('changePassword');
    cy.get('div[role="dialog"]').find('button[type="submit"]').click();
    cy.wait('@changePassword');
  });

  it('forgot password → reset code → new password flow', () => {
    cy.visit('/signup');
    cy.get('input[name="email"]').type(MAILSLURP_EMAIL());
    cy.get('input[name="password"]').type(PASSWORD);
    cy.get('input[name="confirmPassword"]').type(PASSWORD);
    cy.get('button[type="submit"]').click();
    cy.wait('@signup');
    cy.url().should('include', '/confirm-signup');

    cy.get('input[name="code"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.wait('@confirmSignup');

    cy.contains('Sign out').click();
    cy.wait(1000);

    cy.get('input[name="username"]').type(MAILSLURP_EMAIL());
    cy.get('button[type="submit"]').click();
    cy.wait('@verifyUsername');

    cy.contains('Forgot password?').click();

    cy.intercept('POST', '**/auth/forgot-password').as('forgotPassword');
    cy.intercept('POST', '**/auth/confirm-forgot-password').as(
      'confirmForgotPassword',
    );

    cy.get('input[name="username"]').clear().type(MAILSLURP_EMAIL());
    cy.get('button[type="submit"]').click();
    cy.wait('@forgotPassword');

    cy.get('input[name="code"]').type('123456');
    cy.get('button[type="submit"]').click();

    cy.get('input[name="newPassword"]').should('exist');
    cy.get('input[name="newPassword"]').type('NewPassword123!');
    cy.get('input[name="confirmPassword"]').type('NewPassword123!');
    cy.get('button[type="submit"]').click();
    cy.wait('@confirmForgotPassword');
    cy.url().should('match', /\/(\?.*)?$/);
    cy.contains('Welcome Home').should('be.visible');

    cy.contains('Sign out').click();
    cy.wait(1000);

    cy.get('input[name="username"]').type(MAILSLURP_EMAIL());
    cy.get('button[type="submit"]').click();
    cy.wait('@verifyUsername');
    cy.url().should('include', '/login');
    cy.get('input[name="password"]').type('NewPassword123!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/');
    cy.contains('Welcome Home').should('be.visible');
  });
});
