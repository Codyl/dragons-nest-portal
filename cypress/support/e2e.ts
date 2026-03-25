/// <reference types="cypress" />
/// <reference types="cypress-storybook/cypress" />
import { CYPRESS_E2E_SUPPRESS_NEW_DEVICE_MODAL_SESSION_KEY } from '../../src/constants/cypress-e2e-new-device-modal';
import './commands';
import 'cypress-storybook/cypress';

/** App E2E only (not component tests): never show “remember this device” during runs. */
Cypress.on('window:before:load', (win) => {
  win.sessionStorage.setItem(CYPRESS_E2E_SUPPRESS_NEW_DEVICE_MODAL_SESSION_KEY, '1');
});

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
