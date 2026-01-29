/// <reference types="cypress" />
/// <reference path="../../cypress.d.ts" />
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  createMemoryHistory
} from '@tanstack/react-router';
import { mount as cypressMount, type MountOptions } from 'cypress/react';
import type { ReactNode } from 'react';
import React from 'react';
import './commands';
import '../../src/index.css';


Cypress.Commands.add('mount', (component: ReactNode, options: MountOptions = {}) => {

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const rootRoute = createRootRoute({
    component: () => component,
  });

  const routeTree = rootRoute.addChildren([
    createRoute({ getParentRoute: () => rootRoute, path: '/' })
  ]);

  const router = createRouter({
    routeTree,
    history: createMemoryHistory(),
    defaultPendingMinMs: 0,
  });

  cy.intercept('GET', '/users/me', {
    statusCode: 200,
    body: {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
  });

  return cypressMount(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
    options
  );
});
