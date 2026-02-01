/// <reference types="cypress" />
/**
 * Single-page E2E: Home (index).
 * Unauthenticated users are redirected to verify-username.
 * Run with app: pnpm dev then pnpm cypress:run:e2e:app
 */
describe('Home page', () => {
  it('redirects unauthenticated user to verify-username', () => {
    cy.visit('/');
    cy.url().should('include', '/verify-username');
  });

  it('shows welcome and logout when authenticated', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('AccessToken', 'test-token');
        win.localStorage.setItem('RefreshToken', 'test-refresh');
      },
    });
    cy.intercept('GET', '**/auth/refresh-token');
    cy.intercept('GET', '**/users/me*').as('me');
    cy.visit('/');
    cy.contains('Welcome Home').should('be.visible');
    cy.contains('Logout').should('be.visible');
  });
});
