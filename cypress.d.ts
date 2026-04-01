import { type MountOptions } from 'cypress/react';
import type { ReactNode } from 'react';

export {};

declare global {
  namespace Cypress {
    interface Chainable {
      mount: (component: React.ReactNode, options?: MountOptions) => Chainable;
      /** Mount a composed Storybook story - reuses story decorators and setup */
      mountStory: (
        story: React.ComponentType,
        options?: MountOptions,
      ) => Chainable;
      /** Log in via auth API and set cookies for domain localhost (for flow tests) */
      loginViaApi: (username: string, password: string) => Chainable<void>;
      /** Completes the account-setup steps when on /account-setup */
      completeAccountSetupIfShown: () => Chainable<void>;
      /** Clicks welcome CTA when the first-login welcome screen is shown */
      dismissWelcomeIfShown: () => Chainable<void>;
      /** Request helper for cognito auth API (e2e endpoint tests) */
      authApiRequest: (
        method: string,
        path: string,
        body?: object,
      ) => Chainable<Cypress.Response<unknown>>;
    }
  }
}
