/// <reference types="cypress" />
/**
 * Single-page E2E: Verify Username.
 * Run with app: pnpm dev then pnpm cypress:run:e2e:app
 */
describe('Verify Username page', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/auth/verify-username', {
      statusCode: 200,
      body: {
        message: 'ok',
        data: {
          Session: 'test-session',
          AvailableChallenges: ['PASSWORD'],
        },
      },
    }).as('verifyUsername');
  });

  it('renders verify username form', () => {
    cy.visit('/verify-username');
    cy.get('input[name="username"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
    cy.contains('Verify Username').should('be.visible');
  });

  it('submits username and navigates to login', () => {
    cy.visit('/verify-username');
    cy.get('input[name="username"]').type('test@example.com');
    cy.get('button[type="submit"]').click();
    cy.wait('@verifyUsername');
    cy.url().should('include', '/login');
  });
});
