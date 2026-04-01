import { composeStories } from '@storybook/react-vite';
import * as stories from './account-setup.form.stories';

const { ProfileStep } = composeStories(stories);

describe('AccountSetupForm', () => {
  it('should render', () => {
    cy.mountStory(ProfileStep);
    cy.get('[data-testid="input-name"]').should('exist');
    cy.get('[data-testid="input-age"]').should('exist');
  });

  it('should render via Storybook story (reuses story setup)', () => {
    cy.mountStory(ProfileStep);
    cy.get('form').should('exist');
    cy.get('[data-testid="input-name"]').should('exist');
    cy.get('[data-testid="input-age"]').should('exist');
    cy.contains('button', 'Continue').should('exist');
  });

  it('should show validation errors when continuing profile step with empty fields', () => {
    cy.mountStory(ProfileStep);
    cy.contains('button', 'Continue').click();
    cy.get('[data-testid="error-message-name"]').should('be.visible');
  });

  it('should advance to interests after valid profile step', () => {
    cy.mountStory(ProfileStep);
    cy.get('[data-testid="input-name"]').type('Alex');
    cy.get('[data-testid="input-age"]').type('11');
    cy.get('[data-testid="avatar-owl"]').click();
    cy.contains('button', 'Continue').click();
    cy.contains('What interests you?').should('be.visible');
  });

  it('should toggle interest selection', () => {
    cy.mountStory(ProfileStep);
    cy.get('[data-testid="input-name"]').type('Test');
    cy.get('[data-testid="input-age"]').type('10');
    cy.get('[data-testid="avatar-bear"]').click();
    cy.contains('button', 'Continue').click();
    cy.get('[data-testid="interest-music"]').click();
    cy.get('[data-testid="interest-music"]').should(
      'have.attr',
      'aria-pressed',
      'true',
    );
  });

  it('should show interest validation when none selected', () => {
    cy.mountStory(ProfileStep);
    cy.get('[data-testid="input-name"]').type('Test');
    cy.get('[data-testid="input-age"]').type('10');
    cy.get('[data-testid="avatar-turtle"]').click();
    cy.contains('button', 'Continue').click();
    cy.contains('button', 'Continue').click();
    cy.get('[data-testid="error-message-interests"]').should(
      'contain.text',
      'Select at least one topic',
    );
  });
});
