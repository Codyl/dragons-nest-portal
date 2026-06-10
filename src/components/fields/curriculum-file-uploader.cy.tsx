/**
 * Cypress component tests for CurriculumFileUploader.
 * Requirements: 3.1, 3.2, 3.3, 3.4
 *
 * Mocking strategy: cy.intercept handles the POST /curriculum/upload network
 * call that useUploadCurriculumItem fires. For the isPending spinner test we
 * use a delayed intercept so the mutation stays in-flight long enough to assert.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CurriculumFileUploader from './curriculum-file-uploader';

const defaultProps = {
  subjectId: 'subject-1',
  studentId: null,
  householdId: 'household-1',
};

function mountUploader(props = defaultProps) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  cy.mount(
    <QueryClientProvider client={queryClient}>
      <CurriculumFileUploader {...props} />
    </QueryClientProvider>,
  );
}

describe('CurriculumFileUploader', () => {
  it('file selection triggers visible file name display (Req 3.1)', () => {
    // Intercept the upload so it resolves successfully
    cy.intercept('POST', '**/curriculum/upload', {
      statusCode: 200,
      body: { message: 'ok', data: {} },
    }).as('upload');

    mountUploader();

    // Select a valid PDF file
    cy.get('[data-testid="curriculum-file-input"]').selectFile(
      {
        contents: Cypress.Buffer.from('pdf content'),
        fileName: 'lesson-plan.pdf',
        mimeType: 'application/pdf',
      },
      { force: true },
    );

    // The selected file name should be visible
    cy.get('[data-testid="curriculum-selected-file-name"]')
      .should('be.visible')
      .and('contain.text', 'lesson-plan.pdf');
  });

  it('selecting a disallowed MIME type shows a validation error message (Req 3.2)', () => {
    mountUploader();

    // Select a file with a disallowed MIME type (text/plain)
    cy.get('[data-testid="curriculum-file-input"]').selectFile(
      {
        contents: Cypress.Buffer.from('plain text content'),
        fileName: 'notes.txt',
        mimeType: 'text/plain',
      },
      { force: true },
    );

    // Validation error should be visible
    cy.get('[data-testid="curriculum-upload-error"]')
      .should('be.visible')
      .and('contain.text', 'Unsupported file type');
  });

  it('selecting a file over 50 MB shows a validation error message (Req 3.3)', () => {
    mountUploader();

    // Create a buffer that exceeds 50 MB (50 * 1024 * 1024 + 1 bytes)
    const oversizedContent = Cypress.Buffer.alloc(50 * 1024 * 1024 + 1, 'x');

    cy.get('[data-testid="curriculum-file-input"]').selectFile(
      {
        contents: oversizedContent,
        fileName: 'huge-file.pdf',
        mimeType: 'application/pdf',
      },
      { force: true },
    );

    // Validation error should be visible
    cy.get('[data-testid="curriculum-upload-error"]')
      .should('be.visible')
      .and('contain.text', 'too large');
  });

  it('upload progress spinner is visible while upload is in progress (Req 3.4)', () => {
    // Use a delayed intercept so the mutation stays in-flight
    cy.intercept('POST', '**/curriculum/upload', (req) => {
      req.reply({
        delay: 3000,
        statusCode: 200,
        body: { message: 'ok', data: {} },
      });
    }).as('slowUpload');

    mountUploader();

    // Select a valid file to trigger the upload
    cy.get('[data-testid="curriculum-file-input"]').selectFile(
      {
        contents: Cypress.Buffer.from('pdf content'),
        fileName: 'lesson-plan.pdf',
        mimeType: 'application/pdf',
      },
      { force: true },
    );

    // While the upload is in progress the button should show the spinner text
    cy.get('[data-testid="curriculum-upload-button"]')
      .should('be.disabled')
      .and('contain.text', 'Uploading');

    // The Loader2 spinner icon is rendered inside the button during isPending
    cy.get('[data-testid="curriculum-upload-button"] svg').should('exist');
  });
});
