/// <reference types="cypress" />
/// <reference types="cypress-storybook/cypress" />
import './commands';
import 'cypress-storybook/cypress';

beforeEach(() => {
  cy.request({
    method: 'DELETE',
    url: `http://localhost:8080/test-users`,
    failOnStatusCode: false,
  });
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.clearAllSessionStorage();

  cy.request('GET', 'http://localhost:8080/health').then((response) => {
    if (response.status !== 200) {
      throw new Error('Failed to ping test server');
    }
  });
});

/**
 * Stop the test if it fails to allow debugging.
 */
afterEach(function () {
  // @ts-ignore
  if (this.currentTest.state === 'failed') {
    Cypress.stop();
  }
});
