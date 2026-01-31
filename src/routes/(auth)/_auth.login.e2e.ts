/// <reference types="cypress" />
/**
 * Single-page E2E: Login.
 * Requires sessionStorage (username, availableChallenges) or app redirects to verify-username.
 * Run with app: pnpm dev then pnpm cypress:run:e2e:app
 */
describe('Login page', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/auth/initiate-login', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          message: 'ok',
          data: {
            AuthenticationResult: {
              AccessToken: 'test-access',
              RefreshToken: 'test-refresh',
              IdToken: 'test-id',
            },
          },
        },
      });
    }).as('login');
  });

  it('redirects to verify-username when no session context', () => {
    cy.visit('/login');
    cy.url().should('include', '/verify-username');
  });

  it('renders login form when session has password challenge', () => {
    cy.visit('/verify-username');
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
    cy.get('input[name="username"]').type('user@example.com');
    cy.get('button[type="submit"]').click();
    cy.wait('@verifyUsername');
    cy.url().should('include', '/login');
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });
});
