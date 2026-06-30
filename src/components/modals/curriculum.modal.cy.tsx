/**
 * Cypress component tests for CurriculumModal open/close interactions.
 * Requirements: 1.1, 1.5, 1.6, 1.7
 *
 * Mocking strategy:
 * - cy.intercept handles GET /curriculum (useCurriculumItems) and
 *   POST /curriculum/upload (useUploadCurriculumItem) network calls.
 * - The profile GET /profile is already intercepted in the global beforeEach
 *   (cypress/support/component.tsx) and returns a household _id.
 * - ManagedUserProvider is included so useManagedUser() resolves without throwing.
 * - SubjectCard is mounted directly so the Cog button interaction is tested
 *   end-to-end (Req 1.1).
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ManagedUserProvider } from '@/contexts/managed-user-context';
import SubjectCard from '@/components/cards/subject-card';
import type { Subject } from '@/api/services/subjects.services';

const subject: Subject = {
  _id: 'subject-math',
  name: 'Mathematics',
  icon: '📐',
  color: '#4A90D9',
  slug: 'mathematics',
  isEnrichment: false,
};

function mountSubjectCard() {
  // Intercept curriculum data so useCurriculumItems resolves immediately
  cy.intercept('GET', '**/curriculum*', {
    statusCode: 200,
    body: { message: 'ok', data: [] },
  }).as('getCurriculum');

  // Intercept upload endpoint
  cy.intercept('POST', '**/curriculum/upload', {
    statusCode: 200,
    body: { message: 'ok', data: {} },
  }).as('uploadCurriculum');

  // Intercept profile so useLoggedInUser resolves with a householdId
  cy.intercept('GET', '**/profile', {
    statusCode: 200,
    body: {
      message: 'ok',
      data: {
        _id: 'household-1',
        email: 'test@example.com',
        given_name: 'Test',
        family_name: 'User',
        householdStudents: [],
      },
    },
  }).as('getProfile');

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  cy.mount(
    <QueryClientProvider client={queryClient}>
      <ManagedUserProvider>
        <SubjectCard subjectId={subject._id} subjectName={subject.name} teacherName="Teacher" />
      </ManagedUserProvider>
    </QueryClientProvider>,
  );
}

describe('CurriculumModal', () => {
  it('modal opens when the Cog button is clicked on SubjectCard (Req 1.1)', () => {
    mountSubjectCard();

    // Modal should not be visible initially
    cy.contains('Mathematics — Curriculum').should('not.exist');

    // Click the Cog button
    cy.get('[aria-label="Configure curriculum"]').click();

    // Modal title should now be visible
    cy.contains('Mathematics — Curriculum').should('be.visible');
  });

  it('modal closes when the X close button is clicked (Req 1.5)', () => {
    mountSubjectCard();

    // Open the modal
    cy.get('[aria-label="Configure curriculum"]').click();
    cy.contains('Mathematics — Curriculum').should('be.visible');

    // Click the built-in Radix DialogContent close button (data-slot="dialog-close")
    cy.get('[data-slot="dialog-close"]').click();

    // Modal should no longer be visible
    cy.contains('Mathematics — Curriculum').should('not.exist');
  });

  it('modal closes when the Escape key is pressed (Req 1.7)', () => {
    mountSubjectCard();

    // Open the modal
    cy.get('[aria-label="Configure curriculum"]').click();
    cy.contains('Mathematics — Curriculum').should('be.visible');

    // Press Escape — Radix Dialog handles this natively
    cy.get('body').type('{esc}');

    // Modal should no longer be visible
    cy.contains('Mathematics — Curriculum').should('not.exist');
  });

  it('modal closes when clicking outside the dialog overlay (Req 1.6)', () => {
    mountSubjectCard();

    // Open the modal
    cy.get('[aria-label="Configure curriculum"]').click();
    cy.contains('Mathematics — Curriculum').should('be.visible');

    // Click the Radix Dialog overlay backdrop (outside the dialog panel)
    // The overlay uses data-slot="dialog-overlay" from the shadcn Dialog component
    cy.get('[data-slot="dialog-overlay"]').click({ force: true });

    // Modal should no longer be visible
    cy.contains('Mathematics — Curriculum').should('not.exist');
  });
});
