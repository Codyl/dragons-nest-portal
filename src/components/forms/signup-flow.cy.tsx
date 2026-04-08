import { composeStories } from '@storybook/react-vite';
import * as stories from './signup-flow.stories';

const { Default } = composeStories(stories);

/**
 * Component tests reference: create-account.cy.tsx (form mounting, validation, intercepts).
 */
describe('SignupFlow', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('renders age gate with continue disabled until month and year are set', () => {
    cy.mountStory(Default);
    cy.get('[data-testid="age-gate-continue"]').should('be.disabled');
    cy.get('[data-testid="signup-birth-month"]').select('3');
    cy.get('[data-testid="age-gate-continue"]').should('be.disabled');
    cy.get('[data-testid="signup-birth-year"]').select(
      String(new Date().getFullYear() - 20),
    );
    cy.get('[data-testid="age-gate-continue"]').should('not.be.disabled');
  });

  it('routes ages 13–17 to student signup', () => {
    cy.mountStory(Default);
    cy.get('[data-testid="signup-birth-month"]').select('1');
    cy.get('[data-testid="signup-birth-year"]').select(
      String(new Date().getFullYear() - 15),
    );
    cy.get('[data-testid="age-gate-continue"]').click();
    cy.contains('h2', 'Create Your Student Account').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
  });

  it('returns credential signup back to the age gate', () => {
    cy.mountStory(Default);
    cy.get('[data-testid="signup-birth-month"]').select('3');
    cy.get('[data-testid="signup-birth-year"]').select(
      String(new Date().getFullYear() - 16),
    );
    cy.get('[data-testid="age-gate-continue"]').click();
    cy.get('[data-testid="adult-student-signup-back"]').click();
    cy.get('[data-testid="age-gate-continue"]').should('exist');
  });

  it('routes under-13 users to adult (guardian) account signup', () => {
    cy.mountStory(Default);
    cy.get('[data-testid="signup-birth-month"]').select('6');
    cy.get('[data-testid="signup-birth-year"]').select(
      String(new Date().getFullYear() - 8),
    );
    cy.get('[data-testid="age-gate-continue"]').click();
    cy.contains('h2', 'Create Your Adult Account').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
  });

  it('routes users 18+ to adult account signup', () => {
    cy.mountStory(Default);
    cy.get('[data-testid="signup-birth-month"]').select('2');
    cy.get('[data-testid="signup-birth-year"]').select(
      String(new Date().getFullYear() - 30),
    );
    cy.get('[data-testid="age-gate-continue"]').click();
    cy.contains('h2', 'Create Your Adult Account').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
  });

  it('stores signup role after initiate-signup for adults', () => {
    cy.intercept('POST', '**/auth/initiate-signup', {
      statusCode: 200,
      body: { data: { Session: 'test-session' } },
    }).as('initiateSignup');
    cy.mountStory(Default);
    cy.get('[data-testid="signup-birth-month"]').select('4');
    cy.get('[data-testid="signup-birth-year"]').select(
      String(new Date().getFullYear() - 25),
    );
    cy.get('[data-testid="age-gate-continue"]').click();
    cy.get('input[name="email"]').type('taylor@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('Password123!');
    cy.contains('button', 'Create Account').click();
    cy.wait('@initiateSignup');
    cy.window()
      .its('sessionStorage')
      .invoke('getItem', 'signupRole')
      .should('eq', 'adult');
  });
});
