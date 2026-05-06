/**
 * Component tests for StudentDraftCard.
 * Reference: `add-course-sheet.cy.tsx` (composeStories, mounting patterns).
 */
import { composeStories } from '@storybook/react-vite';

import * as stories from './student-draft-card.stories';

const { Active, Archived } = composeStories(stories);

describe('StudentDraftCard', () => {
  it('renders active draft with Archive (rendering, props)', () => {
    cy.mountStory(Active);
    cy.contains('Jordan').should('be.visible');
    cy.get('[data-testid=student-draft-archive]').should('exist');
  });

  it('renders archived draft with Restore (user interactions)', () => {
    cy.mountStory(Archived);
    cy.contains('River').should('be.visible');
    cy.get('[data-testid=student-draft-restore]').should('exist');
  });
});
