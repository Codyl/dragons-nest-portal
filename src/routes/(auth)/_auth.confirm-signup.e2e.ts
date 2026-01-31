/// <reference types="cypress" />
/**
 * Single-page E2E: Confirm Signup.
 * Run with app: pnpm dev then pnpm cypress:run:e2e:app
 */
describe('Confirm Signup page', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/auth/confirm-signup', {
      statusCode: 200,
      body: {
        message: 'ok',
        data: {
          Session: 'session',
          ChallengeName: null,
          AuthenticationResult: {
            AccessToken: 'token',
            RefreshToken: 'refresh',
            IdToken: 'id',
          },
        },
      },
    }).as('confirmSignup');
  });

  it('renders confirmation code form', () => {
    cy.visit('/confirm-signup');
    cy.get('input[name="code"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
    cy.contains('Confirm Signup').should('be.visible');
  });
});
