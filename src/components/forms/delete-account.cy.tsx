import type { ReactElement } from 'react';
import DeleteAccountForm from './delete-account.form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { mount } from 'cypress/react';
import '../../index.css';

/**
 * Reference pattern: login-method-settings.section.cy.tsx (QueryClient + seeded user/me query).
 * Raw mount avoids the default cy.mount GET intercept colliding with seeded cache.
 */
function mountDeleteAccountForm(
  component: ReactElement,
  userData: Record<string, unknown> = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
  queryClient.setQueryData(['user', 'me'], {
    message: 'ok',
    data: {
      email: 'john@example.com',
      hasPassword: true,
      softwareTokenMfaEnabled: false,
      loginMethods: [] as string[],
      hasPasskey: false,
      passkeyCount: 0,
      ...userData,
    },
  });
  const rootRoute = createRootRoute({
    component: () => component,
  });
  const routeTree = rootRoute.addChildren([
    createRoute({ getParentRoute: () => rootRoute, path: '/' }),
  ]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory(),
    defaultPendingMinMs: 0,
  });
  mount(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe('DeleteAccountForm', () => {
  it('should render password flow without MFA when software token MFA is off', () => {
    mountDeleteAccountForm(<DeleteAccountForm />);
    cy.get('[data-testid="input-password"]').should('exist');
    cy.get('[data-testid="input-mfaCode"]').should('not.exist');
    cy.get('button[type="submit"]').should('exist');
    cy.contains('Are you sure you want to delete your account?').should(
      'exist',
    );
  });

  it('should render password and authenticator fields when software token MFA is on', () => {
    mountDeleteAccountForm(<DeleteAccountForm />, {
      softwareTokenMfaEnabled: true,
    });
    cy.get('[data-testid="input-password"]').should('exist');
    cy.get('[data-testid="input-mfaCode"]').should('exist');
  });

  it('should render Google confirmation for Google-only accounts (Cypress mock)', () => {
    mountDeleteAccountForm(<DeleteAccountForm />, {
      hasPassword: false,
      loginMethods: ['GOOGLE'],
    });
    cy.get('[data-testid="input-password"]').should('not.exist');
    cy.get('[data-testid="delete-account-google-confirm"]').should('exist');
    cy.contains('Sign in with Google to confirm').should('exist');
  });

  it('should delete account with password only when MFA is off', () => {
    cy.intercept('DELETE', '**/profile', {
      statusCode: 200,
      body: {
        message: 'Account deleted successfully',
      },
    }).as('deleteProfile');
    mountDeleteAccountForm(<DeleteAccountForm />);
    cy.get('[data-testid="input-password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.wait('@deleteProfile').then((interception) => {
      const raw = interception.request.body;
      const body = typeof raw === 'string' ? JSON.parse(raw) : raw;
      expect(body).to.include({ password: 'Password123!' });
      expect(body).not.to.have.property('mfaCode');
    });
  });

  it('should send MFA code when software token MFA is enabled', () => {
    cy.intercept('DELETE', '**/profile', {
      statusCode: 200,
      body: {
        message: 'Account deleted successfully',
      },
    }).as('deleteProfile');
    mountDeleteAccountForm(<DeleteAccountForm />, {
      softwareTokenMfaEnabled: true,
    });
    cy.get('[data-testid="input-password"]').type('Password123!');
    cy.get('[data-testid="input-mfaCode"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.wait('@deleteProfile').then((interception) => {
      const raw = interception.request.body;
      const body = typeof raw === 'string' ? JSON.parse(raw) : raw;
      expect(body).to.include({ mfaCode: '123456' });
    });
  });

  it('should delete Google-only account via mock credential', () => {
    cy.intercept('DELETE', '**/profile', {
      statusCode: 200,
      body: {
        message: 'Account deleted successfully',
      },
    }).as('deleteProfile');
    mountDeleteAccountForm(<DeleteAccountForm />, {
      hasPassword: false,
      loginMethods: ['GOOGLE'],
    });
    cy.get('[data-testid="delete-account-google-confirm"]').click();
    cy.wait('@deleteProfile').then((interception) => {
      const raw = interception.request.body;
      const body = typeof raw === 'string' ? JSON.parse(raw) : raw;
      expect(body).to.have.property('googleCredential');
      expect(String(body.googleCredential).length).to.be.at.least(20);
    });
  });

  it('should show error when password is incorrect', () => {
    cy.intercept('DELETE', '**/profile', {
      statusCode: 400,
      body: {
        message: 'Invalid password',
      },
    });
    mountDeleteAccountForm(<DeleteAccountForm />);
    cy.get('[data-testid="input-password"]').type('WrongPassword123!');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid password').should('exist');
  });

  it('should require password field', () => {
    mountDeleteAccountForm(<DeleteAccountForm />);
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-password"]').should(
      'contain.text',
      'Password must be at least 8 characters',
    );
  });

  it('should require authenticator code when MFA is enabled', () => {
    mountDeleteAccountForm(<DeleteAccountForm />, {
      softwareTokenMfaEnabled: true,
    });
    cy.get('[data-testid="input-password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="error-message-mfaCode"]').should('exist');
  });

  it('should show loading state when submitting', () => {
    cy.intercept('DELETE', '**/profile', {
      delay: 1000,
      statusCode: 200,
      body: {
        message: 'Account deleted successfully',
      },
    });
    mountDeleteAccountForm(<DeleteAccountForm />);
    cy.get('[data-testid="input-password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('be.disabled');
  });
});
