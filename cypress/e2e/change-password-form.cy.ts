/// <reference types="cypress" />
/// <reference types="cypress-storybook/cypress" />

/**
 * E2E tests against running Storybook.
 * Run: pnpm storybook (in one terminal), then pnpm cypress:run --e2e
 * MSW is active in Storybook, so form submit is mocked.
 */
describe('ChangePasswordForm (Storybook)', () => {
  before(() => {
    cy.visitStorybook();
  });

  beforeEach(() => {
    cy.loadStory('Forms/ChangePasswordForm', 'Default');
  });

  it('renders the form', () => {
    cy.get('input[name="currentPassword"]').should('exist');
    cy.get('input[name="newPassword"]').should('exist');
    cy.get('input[name="confirmPassword"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('submits and gets mocked success (MSW)', () => {
    cy.get('input[name="currentPassword"]').type('Password123!');
    cy.get('input[name="newPassword"]').type('NewPassword123!');
    cy.get('input[name="confirmPassword"]').type('NewPassword123!');
    cy.get('button[type="submit"]').click();
    // MSW returns 200; no error message should appear
    cy.get('[data-testid="error-message"]').should('not.exist');
  });
});
