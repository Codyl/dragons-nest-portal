/**
 * Component tests for ManagedUserDraftCard.
 * Reference: `add-course-sheet.cy.tsx` (composeStories, mounting patterns).
 */
import { composeStories } from '@storybook/react-vite';

import * as stories from './manageduser-card.stories';

const { Active, Archived } = composeStories(stories);

describe('ManagedUserDraftCard', () => {
  it('renders active draft with Archive (rendering, props)', () => {
    cy.mountStory(Active);
    cy.contains('Jordan').should('be.visible');
    cy.get('[data-testid=manageduser-draft-archive]').should('exist');
  });

  it('renders archived draft with Restore (user interactions)', () => {
    cy.mountStory(Archived);
    cy.contains('River').should('be.visible');
    cy.get('[data-testid=manageduser-draft-restore]').should('exist');
  });
});
