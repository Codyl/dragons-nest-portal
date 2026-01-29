import { type MountOptions } from 'cypress/react';
import type { ReactNode } from 'react';

declare global {
  namespace Cypress {
    interface Chainable {
      mount: (component: React.ReactNode, options?: MountOptions) => Chainable;
    }
  }
}
