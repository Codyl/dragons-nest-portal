import ky, { HTTPError } from 'ky';

// Track if we're currently refreshing to prevent infinite loops
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

const refreshAccessToken = async (): Promise<boolean> => {
  // If already refreshing, wait for the existing refresh to complete
  if (isRefreshing && refreshPromise) {
    await refreshPromise;
    return true;
  }

  isRefreshing = true;
  let refreshSuccess = false;

  refreshPromise = (async () => {
    try {
      const { unauthenticatedApi } =
        await import('./api.unauthenticated.config');
      const response = await unauthenticatedApi.post('auth/refresh-token', {
        json: {},
        throwHttpErrors: false,
        credentials: 'include',
      });

      if (response.ok) {
        refreshSuccess = true;
      }
    } catch {
      refreshSuccess = false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  await refreshPromise;
  return refreshSuccess;
};

/**
 * API client for authenticated requests
 * Uses HttpOnly cookies for auth; includes automatic token refresh on 401
 */
export const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeRetry: [
      async ({ request, error, retryCount }) => {
        // Only retry on 401 and limit retries to prevent infinite loops
        if (
          error instanceof HTTPError &&
          error.response.status === 401 &&
          retryCount < 2
        ) {
          if (request.url.includes('auth/refresh-token')) {
            return;
          }

          const refreshSuccess = await refreshAccessToken();

          if (!refreshSuccess) {
            throw new Error('Token refresh failed');
          }
        }
      },
    ],
    beforeError: [
      async (error) => {
        if (error.response) {
          try {
            const errorBody = (await error.response.json()) as {
              message?: string;
            };
            const message = errorBody?.message ?? error.message;
            throw Object.assign(error, errorBody, { message });
          } catch (e) {
            if (e === error) throw e;

            throw error;
          }
        }

        if (error instanceof HTTPError && error.response.status === 500) {
          throw new Error('Internal server error');
        }

        throw error;
      },
    ],
  },
  retry: {
    limit: 2,
    methods: ['get', 'post', 'put', 'delete'],
    statusCodes: [401],
  },
});
