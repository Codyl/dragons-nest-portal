/**
 * Component tests for AddManagedUserSheet.
 * Reference: `add-course-sheet.cy.tsx` (composeStories, POST intercept).
 */
import { composeStories } from '@storybook/react-vite';

import * as stories from './add-manageduser-sheet.stories';

const { Default } = composeStories(stories);

describe('AddManagedUserSheet', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/profile/household-managedusers', {
      statusCode: 200,
      body: {
        message: 'ok',
        data: {
          managedAccountsView: [
            {
              managedUserId: 'new-id',
              displayName: 'Test',
              currentGrade: 0,
              lastPromotionYear: 2026,
              archivedAt: null,
            },
          ],
        },
      },
    }).as('addManagedUser');
  });

  it('renders title and fields (rendering, props)', () => {
    cy.mountStory(Default);
    cy.get('[role=dialog]').within(() => {
      cy.contains('Add ManagedUser').should('be.visible');
      cy.get('[data-testid=add-manageduser-display-name]').should('exist');
      cy.get('[data-testid=add-manageduser-grade]').should('exist');
    });
  });

  it('submit is disabled when form is empty (validation)', () => {
    cy.mountStory(Default);
    cy.get('[role=dialog]').within(() => {
      cy.get('[data-testid=add-manageduser-submit]')
        .should('be.visible')
        .should('be.disabled');
    });
  });
});
