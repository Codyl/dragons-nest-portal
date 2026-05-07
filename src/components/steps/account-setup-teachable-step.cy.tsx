import { composeStories } from '@storybook/react-vite';
import * as stories from './account-setup-teachable-step.stories';

const { Default } = composeStories(stories);

const subjectsPayload = [
  {
    _id: 'topic-math',
    name: 'Math',
    icon: '🧮',
    color: '#d8e8ff',
    slug: 'math',
    isEnrichment: false,
  },
  {
    _id: 'topic-reading',
    name: 'Reading',
    icon: '📖',
    color: '#f8d9c4',
    slug: 'reading',
    isEnrichment: false,
  },
  {
    _id: 'topic-music',
    name: 'Music',
    icon: '🎵',
    color: '#eee',
    slug: 'music',
    isEnrichment: true,
  },
];

/**
 * Reference test: `src/components/forms/account-setup.cy.tsx`.
 */
describe('AccountSetupTeachableStep', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/subjects', subjectsPayload);
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

  it('enables Finish setup when no courses are added (all rows empty)', () => {
    cy.mountStory(Default);
    cy.get('[data-testid="account-setup-teachable-continue"]').should(
      'not.be.disabled',
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

  it("shows Any-grade hint when Any is selected on enrichment subject (rendering, user interaction)", () => {
    cy.mountStory(Default);
    cy.get('[data-testid^="select-subj-"]').first().click();
    cy.get('[data-slot="select-item"]').contains('Music').click();

    cy.get('[data-testid^="select-grade-"]')
      .first()
      .find('.teachable-grade__control')
      .click();
    cy.get('.teachable-grade__menu').contains('Any').click();
    cy.contains(
      "Selecting 'Any' will show your class to all students regardless of age.",
    ).should('be.visible');
  });

  it('disables grade select until a subject is chosen (user interaction)', () => {
    cy.mountStory(Default);
    cy.get('[data-testid^="select-grade-"]')
      .first()
      .find('.teachable-grade__control--is-disabled')
      .should('exist');
  });

  it('does not offer Any in grade menu for core subjects (user interaction)', () => {
    cy.mountStory(Default);
    cy.get('[data-testid^="select-subj-"]').first().click();
    cy.get('[data-slot="select-item"]').contains('Math').click();

    cy.get('[data-testid^="select-grade-"]')
      .first()
      .find('.teachable-grade__control')
      .click();
    cy.get('.teachable-grade__menu').within(() => {
      cy.contains('Any').should('not.exist');
    });
  });

  it('hides grade choices that would exceed core span limit (user interaction)', () => {
    cy.mountStory(Default);
    cy.get('[data-testid^="select-subj-"]').first().click();
    cy.get('[data-slot="select-item"]').contains('Math').click();

    cy.get('[data-testid^="select-grade-"]')
      .first()
      .find('.teachable-grade__control')
      .click();
    cy.get('.teachable-grade__menu').contains('9th').click();
    cy.get('.teachable-grade__menu').contains('10th').click();
    cy.get('.teachable-grade__menu').within(() => {
      cy.contains('11th').should('not.exist');
      cy.contains('8th').should('not.exist');
    });
    cy.get('[data-testid^="grade-span-warning-"]').should('not.exist');
  });

  it('clears Any when switching from enrichment to core subject (edge case)', () => {
    cy.mountStory(Default);
    cy.get('[data-testid^="select-subj-"]').first().click();
    cy.get('[data-slot="select-item"]').contains('Music').click();

    cy.get('[data-testid^="select-grade-"]')
      .first()
      .find('.teachable-grade__control')
      .click();
    cy.get('.teachable-grade__menu').contains('Any').click();
    cy.get('[data-testid^="select-grade-"]')
      .first()
      .find('.teachable-grade__multi-value__label')
      .should('contain.text', 'Any');

    cy.get('[data-testid^="select-subj-"]').first().click();
    cy.get('[data-slot="select-item"]').contains('Math').click();

    cy.get('[data-testid^="select-grade-"]')
      .first()
      .find('.teachable-grade__multi-value__label')
      .should('not.exist');
  });

  it('caps max students at 20 (props, user interaction)', () => {
    cy.mountStory(Default);
    cy.get('[data-testid^="max-students-"]')
      .first()
      .clear()
      .type('25');
    cy.get('[data-testid^="max-students-"]').first().should('have.value', '20');
  });

  it('shows loading message while subjects are pending (loading state)', () => {
    cy.intercept('GET', '**/subjects', (req) => {
      req.on('response', (res) => {
        res.setDelay(1200);
      });
      req.reply(subjectsPayload);
    });
    cy.mountStory(Default);
    cy.contains('Loading subjects…').should('be.visible');
  });
});
