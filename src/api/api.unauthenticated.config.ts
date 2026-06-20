import ky from 'ky';
import { toast } from 'sonner';
import { redirect } from '@tanstack/react-router';

/**
 * API client for unauthenticated requests (login, signup, etc.)
 * This client does not include auth headers or retry logic
 */
export const unauthenticatedApi = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeError: [
      async (error) => {
        if (!error.response) {
          throw error;
        }

        if (error.response.status === 500) {
          throw new Error('Internal server error');
        }

        const errorBody = await error.response.clone().json();
        throw { ...error, ...errorBody };
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (!response.ok) {
          // Ky doesn't automatically parse JSON on error responses
          // so we do it manually here
          try {
            const data = (await response.json()) as {
              data?: { redirect?: boolean; message?: string };
            };

            if (data?.data?.redirect) {
              toast(data.data.message || 'Session expired');
              throw redirect({ to: '/login' });
            }
          } catch (e) {
            // Response wasn't JSON, handle accordingly
          }
        }
      },
    ],
  },
});
