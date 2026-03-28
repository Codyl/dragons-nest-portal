import { PasskeyProviderIcon } from './passkey-provider-icon';

/**
 * Reference: passkey-settings.section.cy.tsx (mount + visibility).
 */
describe('PasskeyProviderIcon', () => {
  describe('Rendering', () => {
    it('renders an svg icon for a known provider', () => {
      cy.mount(
        <div className="p-4">
          <PasskeyProviderIcon provider="apple_icloud" />
        </div>,
      );
      cy.get('svg').should('exist');
    });
  });
});
