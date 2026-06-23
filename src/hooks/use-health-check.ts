import { unauthenticatedApi } from '@/api/api.unauthenticated.config';

const HEALTH_CHECK_TIMEOUT_MS = 5_000;
const HEALTH_CACHE_TTL_MS = 30_000;

let lastHealthy: number = 0;

/**
 * Runs a single health check request. Fails fast (no retries, short timeout).
 * Throws on network error or non-OK response so the caller can redirect (e.g. to maintenance).
 * Skips the network call if a successful check happened within the last 30s.
 */
export const runHealthCheck = async (): Promise<{ message: string }> => {
  if (Date.now() - lastHealthy < HEALTH_CACHE_TTL_MS) {
    return { message: 'ok' };
  }

  const response = (await unauthenticatedApi
    .get('health', { retry: 0, timeout: HEALTH_CHECK_TIMEOUT_MS })
    .then((res) => res.json())) as { message: string };

  lastHealthy = Date.now();
  return response;
};
