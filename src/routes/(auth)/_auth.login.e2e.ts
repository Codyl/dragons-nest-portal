/// <reference types="cypress" />
/**
 * Single-page E2E: Login.
 * Requires sessionStorage (username, availableChallenges) or app redirects to verify-username.
 * Run with app: pnpm dev then pnpm cypress:run:e2e:app
 */
describe('Login page', () => {
  it('redirects to verify-username when no session context', () => {
    cy.visit('/login');
    cy.url().should('include', '/verify-username');
  });

  it('renders login form when session has password challenge', () => {
    cy.visit('/verify-username');
    cy.get('input[name="username"]').type(Cypress.env('VITE_MAILSLURP_EMAIL'));
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/login');
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });
});
