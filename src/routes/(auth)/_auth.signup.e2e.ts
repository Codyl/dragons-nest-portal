/// <reference types="cypress" />
/**
 * Single-page E2E: Signup.
 * Run with app: pnpm dev then pnpm cypress:run:e2e:app
 */
describe('Signup page', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/auth/initiate-signup').as('signup');
  });

  it('renders create account form', () => {
    cy.visit('/signup');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('input[name="confirmPassword"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
    cy.contains('Create Account').should('be.visible');
  });

  it('submits and navigates to confirm-signup', () => {
    cy.visit('/signup');
    cy.get('input[name="email"]').type('new@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.wait('@signup');
    cy.url().should('include', '/confirm-signup');
  });
});
