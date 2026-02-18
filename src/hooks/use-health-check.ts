import { unauthenticatedApi } from '@/api/api.unauthenticated.config';

const HEALTH_CHECK_TIMEOUT_MS = 5_000;

/**
 * Runs a single health check request. Fails fast (no retries, short timeout).
 * Throws on network error or non-OK response so the caller can redirect (e.g. to maintenance).
 */
export const runHealthCheck = async (): Promise<{ message: string }> => {
  const response = (await unauthenticatedApi
    .get('health', { retry: 0, timeout: HEALTH_CHECK_TIMEOUT_MS })
    .then((res) => res.json())) as { message: string };

  return response;
};
