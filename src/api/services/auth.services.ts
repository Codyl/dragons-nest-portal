import { api } from "../api.config";
import { unauthenticatedApi } from "../api.unauthenticated.config";

const AuthServices = {
    initiateAuth: async (json: {
        username: string;
        password: string;
        session?: string;
    }) => {
        console.log(json);
        const response = await unauthenticatedApi.post("auth/initiate-login", {
            json
        });
        return response.json();
    },
    completeMFAAuth: async (json: {
        username: string;
        password: string;
        softwareTokenMfaCode: string;
        session: string;
        challengeName: string;
    }) => {
        const response = await unauthenticatedApi.post("auth/mfa", { json });
        return response.json();
    },
    logout: async (accessToken: string) => {
        const response = await unauthenticatedApi.get("auth/logout", {
            searchParams: { accessToken }
        });
        return response.json();
    },
    initiateSignup: async (json: {
        username: string;
        password: string;
        address: string;
        family_name: string;
        middle_name: string;
        given_name: string;
        timezone: string;
        email: string;
    }) => {
        const response = await unauthenticatedApi.post("auth/initiate-signup", {
            json
        });
        return response.json();
    },
    confirmSignup: async (json: {
        username: string;
        code: string;
        session?: string;
    }) => {
        const response = await unauthenticatedApi.post("auth/confirm-signup", {
            json
        });
        return response.json();
    },
    resendSignupConfirmationCode: async (json: { username: string }) => {
        const response = await unauthenticatedApi.post(
            "auth/confirm-signup/resend-code",
            { json }
        );
        return response.json();
    },
    generateAuthenticatorSecret: async (json: {
        session: string;
        accessToken: string;
    }) => {
        const response = await api.post(
            "auth/mfa/generate-authenticator-secret",
            { json }
        );
        return response.json();
    },
    connectAuthenticatorApp: async (json: {
        accessToken: string;
        friendlyDeviceName: string;
        session: string;
        userCode: string;
    }) => {
        const response = await api.post("auth/mfa/connect-authenticator-app", {
            json
        });
        return response.json();
    },
    checkAuthenticated: async () => {
        const response = await api.get("authenticated");
        return response.json();
    }
};

export default AuthServices;
