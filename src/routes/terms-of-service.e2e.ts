/// <reference types="cypress" />
/**
 * Single-page E2E: Terms of Service.
 * Run with app: pnpm dev then pnpm cypress:run:e2e:app
 */
describe('Terms of Service page', () => {
  it('renders terms of service content', () => {
    cy.visit('/terms-of-service');
    cy.contains('Terms of Service').should('be.visible');
  });
});
