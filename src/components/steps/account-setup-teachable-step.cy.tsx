import { composeStories } from '@storybook/react-vite';
import * as stories from './account-setup-teachable-step.stories';

const { Default } = composeStories(stories);

/**
 * Reference test: `src/components/forms/account-setup.cy.tsx`.
 */
describe('AccountSetupTeachableStep', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/subjects', [
      {
        _id: 'topic-math',
        name: 'Math',
        icon: 'calculator',
        color: '#d8e8ff',
        slug: 'math',
        isEnrichment: false,
      },
      {
        _id: 'topic-reading',
        name: 'Reading',
        icon: 'book-open',
        color: '#f8d9c4',
        slug: 'reading',
        isEnrichment: false,
      },
    ]);
  });

  it('renders one default course row and core controls (rendering)', () => {
    cy.mountStory(Default);
    cy.contains('Courses you can teach').should('be.visible');
    cy.get('[data-testid^="select-subj-"]').should('have.length', 1);
    cy.contains('button', 'Add another course').should('be.visible');
    cy.get('[data-testid="account-setup-teachable-continue"]').should('be.visible');
  });

  it('calls onBack when Back is selected (props, interaction)', () => {
    const onBack = cy.stub().as('onBack');
    cy.mountStory(Default, { args: { onBack } });
    cy.contains('button', 'Back').click();
    cy.get('@onBack').should('have.been.calledOnce');
  });

  it('adds and removes course rows via user actions (user interaction)', () => {
    cy.mountStory(Default);
    cy.contains('button', 'Add another course').click();
    cy.get('[data-testid^="select-subj-"]').should('have.length', 2);
    cy.get('button[aria-label="Remove course"]').first().click();
    cy.get('[data-testid^="select-subj-"]').should('have.length', 1);
  });

  it('keeps row values while updating another field in the same row (edge case)', () => {
    cy.mountStory(Default);
    cy.get('[data-testid^="select-subj-"] [data-slot="select-trigger"]')
      .first()
      .click();
    cy.get('[data-slot="select-item"]').contains('Math').click();

    cy.get('[data-testid^="select-grade-"] [data-slot="select-trigger"]')
      .first()
      .click();
    cy.get('[data-slot="select-item"]').first().click();

    cy.get('[data-testid^="select-subj-"]').first().should('contain.text', 'Math');
  });

  it('shows loading message while subjects are pending (loading state)', () => {
    cy.intercept('GET', '**/subjects', (req) => {
      req.on('response', (res) => {
        res.setDelay(1200);
      });
      req.reply([
        {
          _id: 'topic-math',
          name: 'Math',
          icon: 'calculator',
          color: '#d8e8ff',
          slug: 'math',
          isEnrichment: false,
        },
      ]);
    });
    cy.mountStory(Default);
    cy.contains('Loading subjects…').should('be.visible');
  });
});
