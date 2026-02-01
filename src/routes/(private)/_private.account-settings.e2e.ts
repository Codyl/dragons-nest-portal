/// <reference types="cypress" />
/**
 * Single-page E2E: Account Settings (private).
 * Unauthenticated users are redirected.
 * Run with app: pnpm dev then pnpm cypress:run:e2e:app
 */
describe('Account Settings page', () => {
  it('redirects unauthenticated user', () => {
    cy.visit('/account-settings');
    cy.url().should('include', '/verify-username');
  });

  it('renders account settings when authenticated', () => {
    cy.visit('/account-settings', {
      onBeforeLoad(win) {
        win.localStorage.setItem('AccessToken', 'test-token');
        win.localStorage.setItem('RefreshToken', 'test-refresh');
      },
    });
    cy.intercept('GET', '**/users/me*').as('me');
    cy.visit('/account-settings');
    cy.contains('Account Settings').should('be.visible');
  });
});
