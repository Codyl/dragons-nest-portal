import { composeStories } from '@storybook/react-vite';
import * as stories from './account-setup.form.stories';

const { ComplianceStep } = composeStories(stories);

describe('AccountSetupForm', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/subjects', [
      {
        _id: 'topic-music',
        name: 'Music',
        icon: 'music',
        color: '#f8d9c4',
        slug: 'music',
        isEnrichment: true,
      },
      {
        _id: 'topic-science',
        name: 'Science',
        icon: 'flask',
        color: '#d8e8ff',
        slug: 'science',
        isEnrichment: false,
      },
    ]);
  });

  it('should render compliance step', () => {
    cy.mountStory(ComplianceStep);
    cy.get('[data-testid="input-name"]').should('exist');
    cy.get('[data-testid="input-age"]').should('exist');
    cy.get('[data-testid="input-state"]').should('exist');
  });

  it('should show validation errors when continuing with empty fields', () => {
    cy.mountStory(ComplianceStep);
    cy.contains('button', 'Continue').click();
    cy.get('[data-testid="error-message-name"]').should('be.visible');
  });

  it('should advance to interests after valid compliance step', () => {
    cy.mountStory(ComplianceStep);
    cy.get('[data-testid="input-name"]').type('Alex');
    cy.get('[data-testid="input-age"]').type('11');
    cy.get('[data-testid="input-state"]').select('ca');
    cy.get('[data-testid="input-zip"]').type('90210');
    cy.get('[data-testid="input-phone"]').type('5551234567');
    cy.get('[data-testid="avatar-owl"]').click();
    cy.contains('button', 'Continue').click();
    cy.contains('What interests you?').should('be.visible');
  });

  it('should toggle interest selection', () => {
    cy.mountStory(ComplianceStep);
    cy.get('[data-testid="input-name"]').type('Test');
    cy.get('[data-testid="input-age"]').type('10');
    cy.get('[data-testid="input-state"]').select('ny');
    cy.get('[data-testid="input-zip"]').type('10001');
    cy.get('[data-testid="input-phone"]').type('5559876543');
    cy.get('[data-testid="avatar-bear"]').click();
    cy.contains('button', 'Continue').click();
    cy.get('[data-testid="interest-music"]').click();
    cy.get('[data-testid="interest-music"]').should(
      'have.attr',
      'aria-pressed',
      'true',
    );
  });

  it('should load interests from subjects api', () => {
    cy.mountStory(ComplianceStep);
    cy.get('[data-testid="input-name"]').type('Test');
    cy.get('[data-testid="input-age"]').type('10');
    cy.get('[data-testid="input-state"]').select('tx');
    cy.get('[data-testid="input-zip"]').type('73301');
    cy.get('[data-testid="input-phone"]').type('5551112222');
    cy.get('[data-testid="avatar-bear"]').click();
    cy.contains('button', 'Continue').click();
    cy.get('[data-testid="interest-music"]').should('be.visible');
    cy.get('[data-testid="interest-science"]').should('be.visible');
  });

  it('should show interest validation when none selected', () => {
    cy.mountStory(ComplianceStep);
    cy.get('[data-testid="input-name"]').type('Test');
    cy.get('[data-testid="input-age"]').type('10');
    cy.get('[data-testid="input-state"]').select('fl');
    cy.get('[data-testid="input-zip"]').type('33101');
    cy.get('[data-testid="input-phone"]').type('5554443333');
    cy.get('[data-testid="avatar-turtle"]').click();
    cy.contains('button', 'Continue').click();
    cy.contains('button', 'Finish setup').click();
    cy.get('[data-testid="error-message-interests"]').should(
      'contain.text',
      'Select at least one subject',
    );
  });
});
