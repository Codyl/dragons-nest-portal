/// <reference types="cypress" />
/**
 * Whole-flow E2E: Auth (password-based only).
 * Excludes MFA and Google SSO — see cypress/e2e/README.md for why these cannot be tested with Cypress.
 * Run with app: pnpm dev then pnpm cypress:run:e2e:app
 */

describe('Auth flow (password-based)', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/auth/verify-username').as('verifyUsername');

    cy.intercept('POST', '**/auth/initiate-login').as('login');
    cy.intercept('POST', '**/auth/initiate-signup').as('signup');
    cy.intercept('POST', '**/auth/confirm-signup').as('confirmSignup');
  });

  it('create user → home (happy path)', () => {
    cy.visit('/signup');
    cy.get('input[name="email"]').type(Cypress.env('VITE_MAILSLURP_EMAIL'));
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.wait('@signup');
    cy.url().should('include', '/confirm-signup');

    // NOTE: This is a placeholder and is replaced with the actual code from the mailslurp inbox in backend
    cy.get('input[name="code"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.wait('@confirmSignup');

    cy.contains('Welcome Home').should('be.visible');
  });

  it('login → home (happy path)', () => {
    cy.visit('/verify-username');
    cy.get('input[name="username"]').type(Cypress.env('VITE_STATIC_EMAIL'));
    cy.get('button[type="submit"]').click();
    cy.wait('@verifyUsername');
    cy.url().should('include', '/login');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/');
    cy.contains('Welcome Home').should('be.visible');
    cy.reload();
    cy.contains('Welcome Home').should('be.visible');
  });

  it('login → forgot password → reset code → account settings', () => {
    cy.visit('/verify-username');
    cy.get('input[name="username"]').type(Cypress.env('VITE_STATIC_EMAIL'));
    cy.get('button[type="submit"]').click();
    cy.wait('@verifyUsername');
    cy.url().should('include', '/login');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/');
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
    cy.get('input[name="email"]').type(Cypress.env('VITE_MAILSLURP_EMAIL'));
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.wait('@signup');
    cy.url().should('include', '/confirm-signup');

    // NOTE: This is a placeholder and is replaced with the actual code from the mailslurp inbox in backend
    cy.get('input[name="code"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.wait('@confirmSignup');

    cy.contains('Account Settings').click();
    cy.url().should('include', '/account-settings');
    cy.get('[data-slot="dialog-close"]').click();
    cy.get('button').contains('Advanced').click();
    cy.contains('Delete Account').click();
    cy.get('input[name="password"]').type('Password123!');
    cy.intercept('DELETE', '**/users/me').as('deleteAccount');
    cy.get('div[role="dialog"]').find('button[type="submit"]').click();
    cy.wait('@deleteAccount');
    cy.url().should('include', '/verify-username');

    cy.get('input[name="username"]').type(Cypress.env('VITE_MAILSLURP_EMAIL'));
    cy.get('button[type="submit"]').click();
    cy.wait('@verifyUsername');
    // TODO: Probably should not have this message so correct it in the backend
    cy.contains('Password reset required for the user').should('be.visible');
  });

  it('login → change password flow', () => {
    cy.visit('/verify-username');
    cy.get('input[name="username"]').type(Cypress.env('VITE_MAILSLURP_EMAIL'));
    cy.get('button[type="submit"]').click();
    cy.wait('@verifyUsername');
    cy.url().should('include', '/login');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
  });

  it('forgot password → reset code → new password flow', () => {
    cy.visit('/signup');
    cy.get('input[name="email"]').type(Cypress.env('VITE_MAILSLURP_EMAIL'));
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.wait('@signup');
    cy.url().should('include', '/confirm-signup');

    // NOTE: This is a placeholder and is replaced with the actual code from the mailslurp inbox in backend
    cy.get('input[name="code"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.wait('@confirmSignup');

    cy.contains('Sign out').click();
    cy.wait(1000);

    cy.get('input[name="username"]').type(Cypress.env('VITE_MAILSLURP_EMAIL'));
    cy.get('button[type="submit"]').click();
    cy.wait('@verifyUsername');

    cy.contains('Forgot password?').click();

    cy.intercept('POST', '**/auth/forgot-password').as('forgotPassword');
    cy.intercept('POST', '**/auth/confirm-forgot-password').as(
      'confirmForgotPassword',
    );

    cy.get('input[name="username"]')
      .clear()
      .type(Cypress.env('VITE_MAILSLURP_EMAIL'));
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

    cy.get('input[name="username"]').type(Cypress.env('VITE_MAILSLURP_EMAIL'));
    cy.get('button[type="submit"]').click();
    cy.wait('@verifyUsername');
    cy.url().should('include', '/login');
    cy.get('input[name="password"]').type('NewPassword123!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/');
    cy.contains('Welcome Home').should('be.visible');
  });
});
