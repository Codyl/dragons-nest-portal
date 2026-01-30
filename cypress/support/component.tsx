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
import * as GoogleOAuth from '@react-oauth/google';

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

  cy.intercept('GET', '**/users/me', {
    statusCode: 200,
    body: {
      data: {
        email: 'john.doe@example.com',
        given_name: 'John',
        family_name: 'Doe',
      },
    },
  });

  return cypressMount(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
    options
  );
});

/**
 * Mount a Storybook story via composeStories for reuse in Cypress tests.
 * Use: cy.mountStory(ComposedDefault) after importing { Default } from composeStories(stories)
 */
Cypress.Commands.add('mountStory', (StoryComponent: React.ComponentType, options: MountOptions = {}) => {
  return cy.mount(React.createElement(StoryComponent), options);
});

beforeEach(() => {
  cy.intercept('POST', '*', {
    statusCode: 200,
    body: {
      message: 'Success'
    },
  });
  cy.intercept('GET', '*', {
    statusCode: 200,
    body: {
      message: 'Success'
    },
  });
  cy.intercept('DELETE', '*', {
    statusCode: 200,
    body: {
      message: 'Success'
    },
  });
  cy.intercept('PUT', '*', {
    statusCode: 200,
    body: {
      message: 'Success'
    },
  });
});
