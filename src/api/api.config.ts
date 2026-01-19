import ky, { HTTPError } from "ky";

// Track if we're currently refreshing to prevent infinite loops
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

const refreshAccessToken = async (): Promise<boolean> => {
    // If already refreshing, wait for the existing refresh to complete
    if (isRefreshing && refreshPromise) {
        await refreshPromise;
        // Check if we still have a token after waiting
        return !!localStorage.getItem("AccessToken");
    }

    const refreshToken = localStorage.getItem("RefreshToken");
    if (!refreshToken) {
        return false;
    }

    isRefreshing = true;
    let refreshSuccess = false;

    refreshPromise = (async () => {
        try {
            // Use unauthenticated API to refresh token
            const { unauthenticatedApi } = await import(
                "./api.unauthenticated.config"
            );
            const response = await unauthenticatedApi.post(
                "auth/refresh-token",
                {
                    json: {
                        refreshToken: refreshToken
                    },
                    throwHttpErrors: false
                }
            );

            if (response.status === 200) {
                const data = (await response.json()) as {
                    refreshToken: string;
                    accessToken: string;
                };
                localStorage.setItem("RefreshToken", data.refreshToken);
                localStorage.setItem("AccessToken", data.accessToken);
                refreshSuccess = true;
            } else {
                // Refresh failed, clear tokens
                localStorage.removeItem("AccessToken");
                localStorage.removeItem("RefreshToken");
            }
        } catch {
            // Refresh failed, clear tokens
            localStorage.removeItem("AccessToken");
            localStorage.removeItem("RefreshToken");
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
 * Includes auth headers and automatic token refresh on 401
 */
export const api = ky.create({
    prefixUrl: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("AccessToken") || ""}`
    },
    hooks: {
        beforeRequest: [
            (request) => {
                const accessToken = localStorage.getItem("AccessToken");
                if (accessToken) {
                    request.headers.set(
                        "Authorization",
                        `Bearer ${accessToken}`
                    );
                }
                const refreshToken = localStorage.getItem("RefreshToken");
                if (refreshToken) {
                    request.headers.set("X-Refresh-Token", refreshToken);
                }
            }
        ],
        beforeRetry: [
            async ({ request, error, retryCount }) => {
                // Only retry on 401 and limit retries to prevent infinite loops
                if (
                    error instanceof HTTPError &&
                    error.response.status === 401 &&
                    retryCount < 2
                ) {
                    // Don't try to refresh if this is the refresh token request itself
                    if (request.url.includes("auth/refresh-token")) {
                        return;
                    }

                    // Try to refresh the token
                    const refreshSuccess = await refreshAccessToken();

                    // Only update headers if refresh succeeded
                    if (refreshSuccess) {
                        const newAccessToken =
                            localStorage.getItem("AccessToken");
                        if (newAccessToken) {
                            request.headers.set(
                                "Authorization",
                                `Bearer ${newAccessToken}`
                            );
                        }
                    } else {
                        // If refresh failed, throw error to prevent retry
                        throw new Error("Token refresh failed");
                    }
                }
            }
        ],
        beforeError: [
            async (error) => {
                if (error.response) {
                    const errorBody = await error.response.json();
                    throw { ...error, ...errorBody };
                }

                if (
                    error instanceof HTTPError &&
                    error.response.status === 500
                ) {
                    throw new Error("Internal server error");
                }
                throw error;
            }
        ]
    },
    retry: {
        limit: 2,
        methods: ["get", "post", "put", "delete"],
        statusCodes: [401]
    }
});
