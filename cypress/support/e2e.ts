/// <reference types="cypress" />
/// <reference types="cypress-storybook/cypress" />
import './commands';
import 'cypress-storybook/cypress';

afterEach(() => {
  cy.clearLocalStorage();
  cy.clearCookies();
  // cy.resetCognito();
  cy.clearAllSessionStorage();
});
