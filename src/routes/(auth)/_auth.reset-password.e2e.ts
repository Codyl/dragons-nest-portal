/// <reference types="cypress" />
/**
 * Single-page E2E: Reset Password.
 * Requires sessionStorage username or app redirects to forgot-password.
 * Run with app: pnpm dev then pnpm cypress:run:e2e:app
 */
describe('Reset Password page', () => {
  it('redirects to forgot-password when no username in session', () => {
    cy.visit('/reset-password');
    cy.url().should('include', '/forgot-password');
  });

  it('renders confirm reset code step when username in session', () => {
    cy.visit('/reset-password', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('username', 'user@example.com');
      },
    });
    cy.contains('Confirm Reset Code').should('be.visible');
    cy.get('input[name="code"]').should('exist');
  });
});
