import type { Preview } from '@storybook/react-vite';
import { setupWorker } from 'msw/browser';
import { handlers } from './msw-handlers';
import '../src/index.css';

// Set up MSW worker - will be started per story with different handlers
let worker: ReturnType<typeof setupWorker> | null = null;
let workerStarted = false;

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  decorators: [
    (Story, context) => {
      // Initialize worker if not already done
      if (!worker) {
        worker = setupWorker(...handlers);
      }

      // Get handlers from story parameters
      const storyHandlers = context.parameters.msw?.handlers || handlers;

      // Reset handlers for this story
      worker.resetHandlers(...storyHandlers);

      // Start worker if not already started
      if (!workerStarted) {
        worker
          .start({
            onUnhandledRequest: 'bypass',
            serviceWorker: {
              url: '/mockServiceWorker.js',
            },
          })
          .catch(() => {
            // If service worker fails to start, continue anyway
            // This allows stories to work even if MSW isn't fully set up
            console.warn(
              "MSW service worker could not be started. Make sure to run 'npx msw init public/'",
            );
          });
        workerStarted = true;
      }

      return Story();
    },
  ],
};

export default preview;
