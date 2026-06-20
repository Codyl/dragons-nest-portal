import ky, { HTTPError } from 'ky';
import { refreshCognitoSession } from '@/lib/cognito-auth';

// Track if we're currently refreshing to prevent infinite loops
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

/**
 * Refresh the session and re-sync the HttpOnly auth cookies.
 *
 * Two flows are supported, in order:
 * 1. Amplify-managed refresh: when login was performed via browser SRP
 *    (`signInWithCognito`), the refresh token lives inside Amplify's storage,
 *    NOT in a cookie. We ask Amplify to refresh and then post the new
 *    AccessToken / IdToken to `/auth/set-session` so the backend updates the
 *    HttpOnly cookies.
 * 2. Cookie-based refresh: for flows that do issue a REFRESH_TOKEN cookie
 *    (backend signup, Google SSO, backend SRP), fall back to
 *    `/auth/refresh-token` which reads the cookie server-side.
 */
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

      // 1. Try Amplify-managed refresh first (covers Amplify SRP logins).
      const amplifyTokens = await refreshCognitoSession();
      if (amplifyTokens?.AccessToken) {
        const setSessionRes = await unauthenticatedApi.post(
          'auth/set-session',
          {
            json: {
              AccessToken: amplifyTokens.AccessToken,
              IdToken: amplifyTokens.IdToken,
            },
            throwHttpErrors: false,
            credentials: 'include',
          },
        );
        if (setSessionRes.ok) {
          refreshSuccess = true;
          return;
        }
      }

      // 2. Fall back to the cookie-backed refresh endpoint.
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
  hooks: {
    beforeRetry: [
      async ({ request, error, retryCount }) => {
        // Only retry on 401 and limit retries to prevent infinite loops
        if (
          error instanceof HTTPError &&
          error.response.status === 401 &&
          retryCount < 2
        ) {
          if (
            request.url.includes('auth/refresh-token') ||
            request.url.includes('auth/set-session')
          ) {
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
