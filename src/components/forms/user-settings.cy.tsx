import UserSettingsForm from "./user-settings.form";

describe('UserSettingsForm', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/users/me', {
      statusCode: 200,
      body: {
        data: {
          email: 'test@example.com',
          given_name: 'John',
          family_name: 'Doe',
          middle_name: 'Middle',
          phone_number: '+12025550123',
        },
      },
    });
  });

  it('should render', () => {
    cy.mount(<UserSettingsForm />);
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="given_name"]').should('exist');
    cy.get('input[name="family_name"]').should('exist');
    cy.get('input[name="middle_name"]').should('exist');
    cy.get('input[name="phone_number"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should update user settings successfully', () => {
    cy.intercept('PUT', '**/users/me/account', {
      statusCode: 200,
      body: {
        message: 'Settings updated successfully',
      },
    });
    cy.mount(<UserSettingsForm />);
    cy.get('input[name="given_name"]').clear().type('Jane');
    cy.get('button[type="submit"]').click();
    // Should handle success
  });

  it('should show error when email is invalid', () => {
    cy.mount(<UserSettingsForm />);
    cy.get('input[name="email"]').clear().type('invalid-email');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-email"]').should('contain.text', 'Invalid email address');
  });

  it('should show error when phone number is invalid', () => {
    cy.mount(<UserSettingsForm />);
    cy.get('input[name="phone_number"]').clear().type('123');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-phone_number"]').should('contain.text', 'Invalid phone number');
  });

  it('should show loading state when submitting', () => {
    cy.intercept('PUT', '**/users/me/account', {
      delay: 1000,
      statusCode: 200,
      body: {
        message: 'Settings updated successfully',
      },
    });
    cy.mount(<UserSettingsForm />);
    cy.get('input[name="given_name"]').clear().type('Jane');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should show error when update fails', () => {
    cy.intercept('PUT', '**/users/me/account', {
      statusCode: 400,
      body: {
        message: 'Update failed',
      },
    });
    cy.mount(<UserSettingsForm />);
    cy.get('input[name="given_name"]').clear().type('Jane');
    cy.get('button[type="submit"]').click();
    cy.contains('Update failed').should('exist');
  });
});
