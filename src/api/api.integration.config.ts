import ky from "ky";

/**
 * API client for 3rd party requests (ipstack, etc.)
 */
export const integrationApi = ky.create({
  headers: {
    "Content-Type": "application/json",
  },
  retry: 0,
});
