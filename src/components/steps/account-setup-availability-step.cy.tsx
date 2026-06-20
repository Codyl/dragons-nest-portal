import { composeStories } from '@storybook/react-vite';
import * as stories from './account-setup-availability-step.stories';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { TeenFinish, ParentNext } = composeStories(stories as any) as any;

/**
 * Reference test: `src/components/steps/account-setup-teachable-step.cy.tsx`.
 */
describe('AccountSetupAvailabilityStep', () => {
  it('renders teen copy and presets (rendering)', () => {
    cy.mountStory(TeenFinish);
    cy.contains('Class availability').should('be.visible');
    cy.get('[data-testid="availability-preset-anytime"]').should('be.visible');
    cy.get('[data-testid="availability-preset-school_hours"]').should(
      'be.visible',
    );
    cy.get('[data-testid="availability-day-monday"]').should('be.visible');
    cy.get('[data-testid="account-setup-availability-continue"]').should(
      'contain.text',
      'Finish setup',
    );
  });

  it('renders parent copy and Next when not last step (props)', () => {
    cy.mountStory(ParentNext);
    cy.contains('Contact availability').should('be.visible');
    cy.get('[data-testid="account-setup-availability-continue"]').should(
      'contain.text',
      'Next',
    );
  });

  it('applies school-hours preset when selected (user interaction)', () => {
    cy.mountStory(TeenFinish);
    cy.get('[data-testid="availability-preset-school_hours"]').click();
    cy.get('[data-testid="availability-start-monday-0"]')
      .find('option:selected')
      .should('contain.text', '8:00am');
    cy.get('[data-testid="availability-end-monday-0"]')
      .find('option:selected')
      .should('contain.text', '4:00pm');
  });

  it('adds a time range when plus is used (user interaction)', () => {
    cy.mountStory(TeenFinish);
    cy.get('[data-testid="availability-add-monday"]').click();
    cy.get('[data-testid="availability-day-monday"]').within(() => {
      cy.get('select').should('have.length', 4);
    });
  });

  it('shows Unavailable and restores hours when the last range is removed (edge case)', () => {
    cy.mountStory(TeenFinish);
    cy.get('[data-testid="availability-remove-monday-0"]').click();
    cy.get('[data-testid="availability-unavailable-monday"]').should(
      'be.visible',
    );
    cy.get('[data-testid="availability-add-monday"]').click();
    cy.get('[data-testid="availability-start-monday-0"]').should('exist');
    cy.get('[data-testid="availability-unavailable-monday"]').should(
      'not.exist',
    );
  });

  it('shows validation when all slots removed (edge case)', () => {
    cy.mountStory(TeenFinish);
    for (let i = 0; i < 7; i += 1) {
      const key = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ][i] as string;
      cy.get(`[data-testid="availability-remove-${key}-0"]`).click();
    }
    cy.get('[data-testid="account-setup-availability-continue"]').click();
    cy.get('[data-testid="error-message-weekly-availability"]').should(
      'be.visible',
    );
  });

  it('calls onBack when Back is pressed (user interaction)', () => {
    const onBack = cy.stub().as('onBack');
    cy.mountStory(TeenFinish, { args: { onBack } });
    cy.contains('button', 'Back').click();
    cy.get('@onBack').should('have.been.calledOnce');
  });
});
