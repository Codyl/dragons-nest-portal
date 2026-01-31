/// <reference types="cypress" />
/**
 * Single-page E2E: Privacy Policy.
 * Run with app: pnpm dev then pnpm cypress:run:e2e:app
 */
describe('Privacy Policy page', () => {
  it('renders privacy policy content', () => {
    cy.visit('/privacy-policy');
    cy.contains('Privacy Policy').should('be.visible');
    cy.contains('No Mobile information will be shared').should('be.visible');
  });
});
