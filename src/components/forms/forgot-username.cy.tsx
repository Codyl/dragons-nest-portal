import ForgotUsernameForm from "./forgot-username.form";

describe('ForgotUsernameForm', () => {
  it('should render', () => {
    cy.mount(<ForgotUsernameForm />);
    cy.get('input[name="email"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should show alert when form is submitted (not yet implemented)', () => {
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alert');
    });
    cy.mount(<ForgotUsernameForm />);
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('button[type="submit"]').click();
    cy.get('@alert').should('have.been.called');
  });

  it('should require valid email address', () => {
    cy.mount(<ForgotUsernameForm />);
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-email"]').should('contain.text', 'Please enter a valid email address');
  });

  it('should require email field', () => {
    cy.mount(<ForgotUsernameForm />);
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-email"]').should('exist');
  });
});
