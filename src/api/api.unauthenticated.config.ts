import ky from "ky";

/**
 * API client for unauthenticated requests (login, signup, etc.)
 * This client does not include auth headers or retry logic
 */
export const unauthenticatedApi = ky.create({
    prefixUrl: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});
