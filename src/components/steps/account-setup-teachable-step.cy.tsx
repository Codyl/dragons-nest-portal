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
    cy.get('[data-testid^="class-name-"]').should('have.length', 1);
    cy.get('[data-testid^="select-subj-"]').should('have.length', 1);
    cy.get('[data-testid^="select-grade-"]').should('have.length', 1);
    cy.contains('button', 'Add another course').should('be.visible');
    cy.get('[data-testid="account-setup-teachable-continue"]').should(
      'be.visible',
    );
  });

  it('disables Finish setup until a row is complete (props, edge case)', () => {
    cy.mountStory(Default);
    cy.get('[data-testid="account-setup-teachable-continue"]').should(
      'be.disabled',
    );
  });

  it('enables Finish setup when one row is fully filled (user interaction)', () => {
    cy.mountStory(Default);
    cy.get('[data-testid^="class-name-"]').first().type('Algebra I');
    cy.get('[data-testid^="select-subj-"]').first().click();
    cy.get('[data-slot="select-item"]').contains('Math').click();

    cy.get('[data-testid^="select-grade-"]')
      .first()
      .find('.teachable-grade__control')
      .click();
    cy.get('.teachable-grade__menu').contains('9th').click();
    cy.get('body').type('{esc}');

    cy.get('[data-testid^="select-curr-"]').first().click();
    cy.get('[data-slot="select-item"]').contains('Saxon').click();

    cy.get('[data-testid="account-setup-teachable-continue"]').should(
      'not.be.disabled',
    );
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
    cy.get('[data-testid^="select-subj-"]').first().click();
    cy.get('[data-slot="select-item"]').contains('Math').click();

    cy.get('[data-testid^="select-grade-"]')
      .first()
      .find('.teachable-grade__control')
      .click();
    cy.get('.teachable-grade__menu').contains('Kindergarten').click();

    cy.get('[data-testid^="select-subj-"]').first().should('contain.text', 'Math');
  });

  it("shows Any-grade hint when Any is selected (rendering, user interaction)", () => {
    cy.mountStory(Default);
    cy.get('[data-testid^="select-grade-"]')
      .first()
      .find('.teachable-grade__control')
      .click();
    cy.get('.teachable-grade__menu').contains('Any').click();
    cy.contains(
      "Selecting 'Any' will show your class to all students regardless of age.",
    ).should('be.visible');
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
