/// <reference types="cypress" />
/**
 * Single-page E2E: Forgot Username.
 * Run with app: pnpm dev then pnpm cypress:run:e2e:app
 */
describe('Forgot Username page', () => {
  it('renders forgot username form', () => {
    cy.visit('/forgot-username');
    cy.contains('Forgot Username').should('be.visible');
    cy.get('form').should('exist');
  });
});
