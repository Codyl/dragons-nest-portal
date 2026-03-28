import type { PasskeyListItem } from '@/api/services/user.services';
import { passkeysQueryKey } from '@/hooks/use-passkeys';
import type { ReactElement } from 'react';
import PasskeySettingsSection from './passkey-settings.section';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mount } from 'cypress/react';
import '../../index.css';

function mountPasskeySection(
  passkeys: PasskeyListItem[],
  component: ReactElement,
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
  queryClient.setQueryData(passkeysQueryKey, passkeys);
  /** Raw mount avoids nested QueryClientProvider from cypress/support/component.tsx */
  mount(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>,
  );
}

/**
 * Seeds React Query cache (avoids competing with cypress/support/component.tsx GET *).
 * Reference pattern: login-method-settings.section.cy.tsx.
 */
describe('PasskeySettingsSection', () => {
  describe('Rendering', () => {
    it('renders section title and empty state when there are no passkeys', () => {
      mountPasskeySection([], <PasskeySettingsSection />);
      cy.get('h1').should('contain', 'Passkey settings');
      cy.get('[data-testid=passkeys-empty]').should('be.visible');
    });
  });

  describe('Props / list data', () => {
    it('shows create passkey CTA when list is empty', () => {
      mountPasskeySection([], <PasskeySettingsSection />);
      cy.get('[data-testid=register-passkey-button]')
        .should('exist')
        .and('contain', 'Create a new passkey');
    });

    it('shows passkey rows with metadata and remove actions', () => {
      mountPasskeySection(
        [
          {
            credentialId: 'cred-a',
            displayName: 'iCloud Keychain',
            provider: 'apple_icloud',
            createdAt: '2023-12-31T12:00:00.000Z',
            lastUsedAt: '2024-01-15T12:00:00.000Z',
          },
          {
            credentialId: 'cred-b',
            displayName: 'Windows Hello',
            provider: 'windows_hello',
            createdAt: '2023-12-15T00:00:00.000Z',
            lastUsedAt: '2023-12-20T00:00:00.000Z',
          },
        ],
        <PasskeySettingsSection />,
      );
      cy.get('[data-testid=passkey-count]').should('contain', '2 saved');
      cy.get('[data-testid=passkey-row]').should('have.length', 2);
      cy.contains('iCloud Keychain').should('be.visible');
      cy.contains('Date created:').should('be.visible');
      cy.contains('Last used:').should('be.visible');
      cy.get('[data-testid=passkey-remove-cred-a]').should('exist');
      cy.get('[data-testid=register-passkey-button]').should(
        'contain',
        'Create a new passkey',
      );
    });
  });

  describe('User interactions', () => {
    it('opens remove confirmation when remove is clicked', () => {
      mountPasskeySection(
        [
          {
            credentialId: 'cred-x',
            displayName: 'Google Password Manager',
            provider: 'google_password_manager',
            createdAt: '2023-06-01T00:00:00.000Z',
            lastUsedAt: '2023-06-01T00:00:00.000Z',
          },
        ],
        <PasskeySettingsSection />,
      );
      cy.get('[data-testid=passkey-remove-cred-x]').click();
      cy.contains('Remove this passkey?').should('be.visible');
    });
  });

  describe('Edge cases', () => {
    it('shows em dash for last used when Cognito omits last-used metadata', () => {
      mountPasskeySection(
        [
          {
            credentialId: 'cred-no-last',
            displayName: 'Passkey',
            provider: 'unknown',
            createdAt: '2024-03-01T00:00:00.000Z',
            lastUsedAt: null,
          },
        ],
        <PasskeySettingsSection />,
      );
      cy.contains('Last used:').should('be.visible');
      cy.contains('Last used: —').should('be.visible');
    });

    it('renders a single row without count header edge cases', () => {
      mountPasskeySection(
        [
          {
            credentialId: 'only-one',
            displayName: 'This device',
            provider: 'this_device',
            createdAt: '2024-03-01T00:00:00.000Z',
            lastUsedAt: '2024-03-01T00:00:00.000Z',
          },
        ],
        <PasskeySettingsSection />,
      );
      cy.get('[data-testid=passkey-count]').should('contain', '1 saved');
      cy.get('[data-testid=passkey-row]').should('have.length', 1);
    });
  });
});
