/**
 * Component tests for AddCourseSheet.
 * Reference: `change-password.form.cy.tsx` (composeStories reuse, PATCH intercept flow).
 */
import { composeStories } from '@storybook/react-vite';

import {
  enrichmentArt,
  defaultAddCourseSheetSubjects,
} from './add-course-sheet.stories';
import * as stories from './add-course-sheet.stories';

const { Default, EnrichmentSubjectsOnly } = composeStories(stories);

describe('AddCourseSheet', () => {
  beforeEach(() => {
    cy.intercept('PATCH', '**/profile/teachable-courses', {
      statusCode: 200,
      body: {
        message: 'OK',
        data: {
          teachableCourses: [
            {
              className: 'Watercolor',
              subjectId: enrichmentArt._id,
              matchesAllGrades: true,
              grades: [],
              curriculum: 'saxon',
              maxStudents: 1,
              activeEnrollmentCount: 0,
            },
          ],
        },
      },
    }).as('addCourse');
  });

  it('renders title and fields via Storybook story (rendering, props)', () => {
    cy.mountStory(Default, {
      args: { subjects: defaultAddCourseSheetSubjects },
    });
    cy.get('h2').contains('Add Course').should('be.visible');
    cy.get('[data-testid=input-add-course-classname]').should('exist');
    cy.get('[data-testid=add-course-subject]').should('exist');
    cy.get('[data-testid=add-course-grade-select]').should('exist');
    cy.get('[data-testid=input-add-course-maxstudents]').should('exist');
    cy.get('[data-testid=add-course-curriculum]').should('exist');
  });

  it('submit is disabled until the form is complete (validation / edge)', () => {
    cy.mountStory(Default, {
      args: { subjects: defaultAddCourseSheetSubjects },
    });
    cy.contains('button', 'Add Course')
      .should('be.visible')
      .should('be.disabled');
    cy.contains('button', 'Add Course').should('have.attr', 'form');
  });

  it('submits a valid enrichment row and sends PATCH (user interactions, loading)', () => {
    cy.mountStory(EnrichmentSubjectsOnly, {
      args: { subjects: [enrichmentArt] },
    });

    cy.get('[data-testid=input-add-course-classname]').type('Intro to Watercolor');

    cy.get('[data-testid=add-course-subject]').click();
    cy.get('[role=option]').contains('Art').click();

    cy.get('[data-testid=add-course-grade-select]')
      .find('.teachable-grade__control')
      .click();
    cy.get('.teachable-grade__menu').contains('Any').click();

    cy.get('[data-testid=add-course-curriculum]').scrollIntoView();
    cy.get('[data-testid=add-course-curriculum]').click({ force: true });
    cy.get('[role=option]').first().click({ force: true });

    cy.contains('button', 'Add Course').should('not.be.disabled');
    cy.contains('button', 'Add Course').click();

    cy.wait('@addCourse').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      const raw = interception.request.body;
      const parsed = (typeof raw === 'string' ? JSON.parse(raw) : raw) as {
        className: string;
        subjectId: string;
        matchesAllGrades: boolean;
      };
      expect(parsed.className).to.include('Intro to Watercolor');
      expect(parsed.subjectId).to.eq(enrichmentArt._id);
      expect(parsed.matchesAllGrades).to.eq(true);
    });
  });

  it('shows mutation error when PATCH fails (error state)', () => {
    cy.intercept('PATCH', '**/profile/teachable-courses', {
      statusCode: 400,
      body: { message: 'Server rejected course' },
    }).as('addCourseFail');

    cy.mountStory(EnrichmentSubjectsOnly, {
      args: { subjects: [enrichmentArt] },
    });

    cy.get('[data-testid=input-add-course-classname]').type('x');
    cy.get('[data-testid=add-course-subject]').click();
    cy.get('[role=option]').contains('Art').click();

    cy.get('[data-testid=add-course-grade-select]')
      .find('.teachable-grade__control')
      .click();
    cy.get('.teachable-grade__menu').contains('Any').click();

    cy.get('[data-testid=add-course-curriculum]').scrollIntoView();
    cy.get('[data-testid=add-course-curriculum]').click({ force: true });
    cy.get('[role=option]').first().click({ force: true });

    cy.contains('button', 'Add Course').click();
    cy.wait('@addCourseFail');
    cy.get('[data-testid=add-course-mutation-error]').should('be.visible');
  });
});
