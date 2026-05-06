/**
 * Component tests for AddStudentSheet.
 * Reference: `add-course-sheet.cy.tsx` (composeStories, POST intercept).
 */
import { composeStories } from '@storybook/react-vite';

import * as stories from './add-student-sheet.stories';

const { Default } = composeStories(stories);

describe('AddStudentSheet', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/profile/household-students', {
      statusCode: 200,
      body: {
        message: 'ok',
        data: {
          householdStudentDrafts: [
            {
              studentDraftId: 'new-id',
              displayName: 'Test',
              currentGrade: 0,
              lastPromotionYear: 2026,
              archivedAt: null,
            },
          ],
        },
      },
    }).as('addStudent');
  });

  it('renders title and fields (rendering, props)', () => {
    cy.mountStory(Default);
    cy.get('[role=dialog]').within(() => {
      cy.contains('Add Student').should('be.visible');
      cy.get('[data-testid=add-student-display-name]').should('exist');
      cy.get('[data-testid=add-student-grade]').should('exist');
    });
  });

  it('submit is disabled when form is empty (validation)', () => {
    cy.mountStory(Default);
    cy.get('[role=dialog]').within(() => {
      cy.get('[data-testid=add-student-submit]')
        .should('be.visible')
        .should('be.disabled');
    });
  });
});
