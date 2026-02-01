/// <reference types="cypress" />
/**
 * Single-page E2E: Forgot Password.
 * Run with app: pnpm dev then pnpm cypress:run:e2e:app
 */
describe('Forgot Password page', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/auth/forgot-password').as('forgotPassword');
  });

  it('renders forgot password form', () => {
    cy.visit('/forgot-password');
    cy.get('input[name="username"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
    cy.contains('Forgot Password').should('be.visible');
  });
});
