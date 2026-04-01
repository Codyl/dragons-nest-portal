/// <reference types="cypress" />
/**
 * Single-page E2E: Legacy /account-settings redirects to settings profile.
 * Run with app: pnpm dev then pnpm cypress:run:e2e:app
 */
describe('Account settings redirect', () => {
  it('redirects unauthenticated user', () => {
    cy.visit('/account-settings');
    cy.url().should('include', '/verify-username');
  });

  it('redirects authenticated user to settings profile', () => {
    cy.intercept('GET', '**/profile*', {
      statusCode: 200,
      body: {
        message: 'OK',
        data: {
          email: 'test@example.com',
          given_name: 'Test',
          family_name: 'User',
        },
      },
    }).as('me');
    cy.visit('/account-settings');
    cy.url().should('include', '/settings/profile');
    cy.contains('Profile').should('be.visible');
  });
});
