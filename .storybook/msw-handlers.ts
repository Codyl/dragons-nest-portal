import { http, HttpResponse, delay } from 'msw';

// Match the API pattern - ky uses prefixUrl, so we need to match the full path
// The API URL pattern will be: ${VITE_API_URL}/users/me/change-password
// For MSW, we'll use a pattern that matches any URL containing /users/me/change-password
// MSW v2 supports both string patterns and function matchers
const matchChangePassword = '*/users/me/change-password';

export const handlers = [
  // Default success handler - returns 200 with success message
  http.post(matchChangePassword, async ({ request }) => {
    const body = (await request.json()) as {
      currentPassword: string;
      newPassword: string;
    };

    // Simulate a delay for loading states
    await delay(500);

    return HttpResponse.json(
      { message: 'Password changed successfully' },
      { status: 200 },
    );
  }),
];

// Success handler with no delay
export const successHandlers = [
  http.post(matchChangePassword, async () => {
    return HttpResponse.json(
      { message: 'Password changed successfully' },
      { status: 200 },
    );
  }),
];

// Error handler - returns 400 with error message
export const errorHandlers = [
  http.post(matchChangePassword, async () => {
    return HttpResponse.json(
      { message: 'Password change failed' },
      { status: 400 },
    );
  }),
];

// Loading handler - returns 200 after a delay
export const loadingHandlers = [
  http.post(matchChangePassword, async () => {
    await delay(2000);
    return HttpResponse.json(
      { message: 'Password changed successfully' },
      { status: 200 },
    );
  }),
];

// Network error handler
export const networkErrorHandlers = [
  http.post(matchChangePassword, async () => {
    return HttpResponse.error();
  }),
];
