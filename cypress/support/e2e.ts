/// <reference types="cypress" />
/// <reference types="cypress-storybook/cypress" />
import './commands';
import 'cypress-storybook/cypress';

beforeEach(() => {
  cy.request({
    method: 'DELETE',
    url: `http://localhost:8080/test-user/${encodeURIComponent(Cypress.env('VITE_MAILSLURP_EMAIL') ?? '')}`,
    failOnStatusCode: false,
  });
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.clearAllSessionStorage();

  cy.request('GET', 'http://localhost:8080/health').then((response) => {
    if (response.status !== 200) {
      throw new Error('Failed to ping test server');
    }
    if (response.body.debug.nodeEnv !== 'test') {
      throw new Error('Node environment is not test');
    }
  });
});
