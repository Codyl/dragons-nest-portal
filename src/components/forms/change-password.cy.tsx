import { composeStories } from "@storybook/react-vite";
import * as stories from "./change-password.form.stories";
import ChangePasswordForm from "./change-password.form";

const { Default } = composeStories(stories);

describe('ChangePasswordForm', () => {
  it('should render', () => {
    cy.mount(<ChangePasswordForm onPasswordChangeSuccess={() => { }} />);
  });

  it('should render via Storybook story (reuses story setup)', () => {
    cy.intercept('POST', '**/profile/change-password', {
      statusCode: 200,
      body: { message: 'Password changed successfully' },
    });
    cy.mountStory(Default);
    cy.get('input[name="currentPassword"]').should('exist');
    cy.get('input[name="newPassword"]').should('exist');
    cy.get('input[name="confirmPassword"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should call onPasswordChangeSuccess when password is changed', () => {
    cy.intercept('POST', '/profile/change-password', {
      statusCode: 200,
      body: {
        message: 'Password changed successfully',
      },
    });
    const onPasswordChangeSuccess = cy.stub();
    cy.mount(<ChangePasswordForm onPasswordChangeSuccess={onPasswordChangeSuccess} />);
    cy.get('input[name="currentPassword"]').type('Password123!');
    cy.get('input[name="newPassword"]').type('NewPassword123!');
    cy.get('input[name="confirmPassword"]').type('NewPassword123!');
    cy.get('button[type="submit"]').click();

    cy.wrap(onPasswordChangeSuccess).should('have.been.calledOnce');
  });

  it('should not call onPasswordChangeSuccess when form is incomplete', () => {
    const onPasswordChangeSuccess = cy.stub();
    cy.mount(<ChangePasswordForm onPasswordChangeSuccess={onPasswordChangeSuccess} />);
    cy.get('button[type="submit"]').click();
    cy.wrap(onPasswordChangeSuccess).should('not.have.been.called');
  });

  it('should handle error when password is not changed', () => {
    cy.intercept('POST', '/profile/change-password', {
      statusCode: 400,
      body: {
        message: 'Password change failed',
      },
    });
    const onPasswordChangeSuccess = cy.stub();
    cy.mount(<ChangePasswordForm onPasswordChangeSuccess={onPasswordChangeSuccess} />);
    cy.get('input[name="currentPassword"]').type('Password123!');
    cy.get('input[name="newPassword"]').type('NewPassword123!');
    cy.get('input[name="confirmPassword"]').type('NewPassword123!');
    cy.get('button[type="submit"]').click();

    cy.wrap(onPasswordChangeSuccess).should('not.have.been.called');
    cy.get('[data-testid="error-message"]').should('contain.text', 'Password change failed');
  });

  it('should show error when passwords do not match', () => {
    cy.mount(<ChangePasswordForm onPasswordChangeSuccess={() => { }} />);
    cy.get('input[name="currentPassword"]').type('Password123!');
    cy.get('input[name="newPassword"]').type('NewPassword123!');
    cy.get('input[name="confirmPassword"]').type('DifferentPassword123!');
    cy.get('button[type="submit"]').click();

    cy.get('[data-testid="error-message-confirmPassword"]').should('contain.text', 'Passwords do not match');
  });

  it('should show error when password is not at least 8 characters long', () => {
    cy.mount(<ChangePasswordForm onPasswordChangeSuccess={() => { }} />);
    cy.get('input[name="currentPassword"]').type('Password123!');
    cy.get('input[name="newPassword"]').clear().type('S123!');
    cy.get('input[name="confirmPassword"]').clear().type('S123!');
    cy.get('button[type="submit"]').click();

    cy.get('[data-testid="error-message-newPassword"]').should('contain.text', 'Password must be at least 8 characters long');
  });

  it('should show loading state when password is being changed', () => {
    cy.intercept('POST', '/profile/change-password', {
      delay: 1000,
      statusCode: 200,
      body: {
        message: 'Password changed successfully',
      },
    });
    cy.mount(<ChangePasswordForm onPasswordChangeSuccess={() => { }} />);
    cy.get('input[name="currentPassword"]').type('Password123!');
    cy.get('input[name="newPassword"]').type('NewPassword123!');
    cy.get('input[name="confirmPassword"]').type('NewPassword123!');
    cy.get('button[type="submit"]').click();

    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should show error when form is incomplete', () => {
    cy.mount(<ChangePasswordForm onPasswordChangeSuccess={() => { }} />);
    cy.get('input[name="currentPassword"]').clear();
    cy.get('input[name="newPassword"]').clear();
    cy.get('input[name="confirmPassword"]').clear();
    cy.get('button[type="submit"]').click();

    cy.get('[data-testid="error-message-currentPassword"]').should('contain.text', 'Current password is required');
    cy.get('[data-testid="error-message-newPassword"]').should('contain.text', 'Password must be at least 8 characters long');
    cy.get('[data-testid="error-message-confirmPassword"]').should('contain.text', 'Please confirm your password');
  });
});