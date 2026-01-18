import ky from "ky";

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
        afterResponse: [
            async (request, options, response) => {
                if (response.status === 401) {
                    const refreshToken = localStorage.getItem("RefreshToken");
                    if (refreshToken) {
                        const response = await ky.post(
                            import.meta.env.VITE_API_URL + "auth/refresh-token",
                            {
                                json: {
                                    refreshToken: refreshToken
                                }
                            }
                        );
                        const data = await response.json();

                        if (response.status === 200) {
                            localStorage.setItem(
                                "RefreshToken",
                                data.refreshToken
                            );
                            localStorage.setItem(
                                "AccessToken",
                                data.accessToken
                            );
                        }
                    }
                }
            }
        ]
    }
});
