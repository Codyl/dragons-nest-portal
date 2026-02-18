/// <reference types="cypress" />
/// <reference types="cypress-storybook/cypress" />
import './commands';
import 'cypress-storybook/cypress';

beforeEach(() => {
  cy.request('GET', 'http://localhost:8080/health').then((response) => {
    if (response.status !== 200) {
      throw new Error('Failed to ping test server');
    }
    if (response.body.debug.nodeEnv !== 'test') {
      throw new Error('Node environment is not test');
    }
  });
});

afterEach(() => {
  cy.clearLocalStorage();
  cy.clearCookies();
  // cy.resetCognito();
  cy.clearAllSessionStorage();
});
