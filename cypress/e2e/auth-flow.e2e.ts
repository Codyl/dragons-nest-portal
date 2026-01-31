/// <reference types="cypress" />
/**
 * Whole-flow E2E: Auth (password-based only).
 * Excludes MFA and Google SSO — see cypress/e2e/README.md for why these cannot be tested with Cypress.
 * Run with app: pnpm dev then pnpm cypress:run:e2e:app
 */

describe('Auth flow (password-based)', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/auth/verify-username', {
      statusCode: 200,
      body: {
        message: 'ok',
        data: {
          Session: 'flow-session',
          AvailableChallenges: ['PASSWORD'],
        },
      },
    }).as('verifyUsername');

    cy.intercept('POST', '**/auth/initiate-login', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          message: 'ok',
          data: {
            AuthenticationResult: {
              AccessToken: 'flow-access-token',
              RefreshToken: 'flow-refresh-token',
              IdToken: 'flow-id-token',
            },
          },
        },
      });
    }).as('login');

    cy.intercept('GET', '**/users/me*', {
      statusCode: 200,
      body: {
        message: 'ok',
        data: { email: 'user@example.com', given_name: 'Flow', family_name: 'User' },
      },
    }).as('me');
  });

  it('verify username → login → home (happy path)', () => {
    cy.visit('/verify-username');
    cy.get('input[name="username"]').type('user@example.com');
    cy.get('button[type="submit"]').click();
    cy.wait('@verifyUsername');
    cy.url().should('include', '/login');

    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.wait('@login');
    cy.url().should('match', /\/(\?.*)?$/);
    cy.contains('Welcome Home').should('be.visible');
    cy.contains('Logout').should('be.visible');
  });

  it('signup → confirm signup flow', () => {
    cy.intercept('POST', '**/auth/initiate-signup', {
      statusCode: 200,
      body: { message: 'ok', data: { Session: 'signup-flow-session' } },
    }).as('signup');
    cy.intercept('POST', '**/auth/confirm-signup', {
      statusCode: 200,
      body: {
        message: 'ok',
        data: {
          Session: 's',
          ChallengeName: null,
          AuthenticationResult: {
            AccessToken: 'signup-token',
            RefreshToken: 'signup-refresh',
            IdToken: 'signup-id',
          },
        },
      },
    }).as('confirmSignup');

    cy.visit('/signup');
    cy.get('input[name="email"]').type('newuser@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.wait('@signup');
    cy.url().should('include', '/confirm-signup');

    cy.get('input[name="code"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.wait('@confirmSignup');
    cy.url().should('match', /\/(\?.*)?$/);
    cy.contains('Welcome Home').should('be.visible');
  });

  it('forgot password → reset code → new password flow', () => {
    cy.intercept('POST', '**/auth/forgot-password', {
      statusCode: 200,
      body: { message: 'ok', data: {} },
    }).as('forgotPassword');
    cy.intercept('POST', '**/auth/confirm-forgot-password', {
      statusCode: 200,
      body: {
        message: 'ok',
        data: {
          AuthenticationResult: {
            AccessToken: 'reset-token',
            RefreshToken: 'reset-refresh',
            IdToken: 'reset-id',
          },
        },
      },
    }).as('confirmForgotPassword');

    cy.visit('/forgot-password');
    cy.get('input[name="username"]').type('user@example.com');
    cy.get('button[type="submit"]').click();
    cy.wait('@forgotPassword');

    cy.visit('/reset-password', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('username', 'user@example.com');
      },
    });
    cy.get('input[name="code"]').type('123456');
    cy.get('button[type="submit"]').click();

    cy.get('input[name="newPassword"]').should('exist');
    cy.get('input[name="newPassword"]').type('NewPassword123!');
    cy.get('input[name="confirmPassword"]').type('NewPassword123!');
    cy.get('button[type="submit"]').click();
    cy.wait('@confirmForgotPassword');
    cy.url().should('match', /\/(\?.*)?$/);
    cy.contains('Welcome Home').should('be.visible');
  });
});
