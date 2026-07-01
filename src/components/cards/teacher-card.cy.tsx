/**
 * Component tests for TeacherCard.
 * Reference: `manageduser-card.cy.tsx` (composeStories, mounting patterns).
 */
import { composeStories } from '@storybook/react-vite';

import * as stories from './teacher-card.stories';

const { WeekdaysIdentical, WeekdaysAndWeekend, NoAvailability } =
  composeStories(stories);

describe('TeacherCard', () => {
  it('shows M–F summary when Mon–Fri share the same slots (rendering, props)', () => {
    cy.mountStory(WeekdaysIdentical);
    cy.get('[data-testid=teacher-availability]').should('be.visible');
    cy.get('[data-testid=teacher-availability]').should('contain', 'M–F');
    cy.get('[data-testid=teacher-availability]').should(
      'contain',
      '9:00am–3:00pm',
    );
  });

  it('shows Sa–Su when weekend matches (rendering)', () => {
    cy.mountStory(WeekdaysAndWeekend);
    cy.get('[data-testid=teacher-availability]').should(
      'contain',
      'Sa–Su 10:00am–2:00pm',
    );
  });

  it('shows empty state when no availability (edge cases)', () => {
    cy.mountStory(NoAvailability);
    cy.contains('Availability not set').should('be.visible');
    cy.get('[data-testid=teacher-availability]').should('not.exist');
  });
});
