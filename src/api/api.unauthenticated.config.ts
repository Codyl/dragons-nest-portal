import ky from "ky";

/**
 * API client for unauthenticated requests (login, signup, etc.)
 * This client does not include auth headers or retry logic
 */
export const unauthenticatedApi = ky.create({
    prefixUrl: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json"
    },
    hooks: {
        beforeError: [
            async (error) => {
                if (error.response.status === 500) {
                    throw new Error("Internal server error");
                }

                if (error.response) {
                    const errorBody = await error.response.clone().json();
                    throw { ...error, ...errorBody };
                }

                throw error;
            }
        ]
    }
});
