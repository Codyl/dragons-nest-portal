/// <reference types="cypress" />
import WelcomePage from './welcome-page';

/**
 * Component tests reference pattern: new-device.modal.cy.tsx (mount, interactions, testid).
 */
describe('WelcomePage', () => {
  describe('Rendering', () => {
    it('renders personalized title and overview copy', () => {
      cy.mount(<WelcomePage displayName="Jordan" onContinue={() => {}} />);
      cy.contains('Welcome, Jordan').should('be.visible');
      cy.contains('Your account is ready').should('be.visible');
    });

    it('uses neutral greeting when displayName is blank', () => {
      cy.mount(<WelcomePage displayName="" onContinue={() => {}} />);
      cy.contains('Welcome, there').should('be.visible');
    });
  });

  describe('Props', () => {
    it('reflects displayName in headline', () => {
      cy.mount(<WelcomePage displayName="Sam" onContinue={() => {}} />);
      cy.contains('Welcome, Sam').should('be.visible');
    });

    it('disables continue when continueDisabled is true', () => {
      cy.mount(
        <WelcomePage
          displayName="Sam"
          onContinue={() => {}}
          continueDisabled
        />,
      );
      cy.get('[data-testid="welcome-continue"]').should('be.disabled');
    });
  });

  describe('User interactions', () => {
    it('calls onContinue when primary button is clicked', () => {
      const onContinue = cy.stub().as('onContinue');
      cy.mount(<WelcomePage displayName="Riley" onContinue={onContinue} />);
      cy.get('[data-testid="welcome-continue"]').click();
      cy.get('@onContinue').should('have.been.calledOnce');
    });
  });

  describe('Edge cases', () => {
    it('trims whitespace in displayName', () => {
      cy.mount(<WelcomePage displayName="  Pat  " onContinue={() => {}} />);
      cy.contains('Welcome, Pat').should('be.visible');
    });
  });
});
