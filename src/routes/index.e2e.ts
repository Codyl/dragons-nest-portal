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
    cy.intercept('GET', '**/profile*', {
      statusCode: 200,
      body: {
        message: 'OK',
        data: {
          email: 'test@example.com',
          given_name: 'Test',
          family_name: 'User',
          first_logged_in_at: '2020-01-01T00:00:00.000Z',
        },
      },
    }).as('me');
    cy.intercept('POST', '**/auth/refresh-token*', {
      statusCode: 200,
      body: { message: 'OK', data: {} },
    });
    cy.visit('/');
    cy.contains('Welcome Home').should('be.visible');
    cy.contains('Sign out').should('be.visible');
  });
});
