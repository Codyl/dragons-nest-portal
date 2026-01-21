import { api } from "../api.config";
import { unauthenticatedApi } from "../api.unauthenticated.config";

const AuthServices = {
  verifyUsername: async (json: { email: string; session?: string }) => {
    const response = await unauthenticatedApi.post("auth/verify-username", {
      json,
    });
    return response.json();
  },
  selectAuthChallenge: async (json: {
    challengeName: string;
    username: string;
    session?: string;
  }) => {
    const response = await unauthenticatedApi.post(
      "auth/select-auth-challenge",
      {
        json,
      },
    );
    return response.json();
  },
  initiateAuth: async (json: {
    username: string;
    password: string;
    session?: string;
  }) => {
    const response = await unauthenticatedApi.post("auth/initiate-login", {
      json,
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
  forgotPassword: async (json: { username: string }) => {
    const response = await unauthenticatedApi.post("auth/forgot-password", {
      json,
    });
    return response.json();
  },
  confirmForgotPassword: async (json: {
    username: string;
    code: string;
    password: string;
  }) => {
    const response = await unauthenticatedApi.post(
      "auth/confirm-forgot-password",
      { json },
    );
    return response.json();
  },
  logout: async (accessToken: string) => {
    const response = await unauthenticatedApi.get("auth/logout", {
      searchParams: { accessToken },
    });
    return response.json();
  },
  changePassword: async (json: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await unauthenticatedApi.post("user/me/change-password", {
      json,
    });
    return response.json();
  },
  initiateSignup: async (json: { email: string; password: string }) => {
    const response = await unauthenticatedApi.post("auth/initiate-signup", {
      json,
    });
    return response.json();
  },
  confirmSignup: async (json: {
    username: string;
    code: string;
    session?: string;
    password?: string;
  }) => {
    const response = await unauthenticatedApi.post("auth/confirm-signup", {
      json,
    });
    return response.json();
  },
  resendSignupConfirmationCode: async (json: { username: string }) => {
    const response = await unauthenticatedApi.post(
      "auth/confirm-signup/resend-code",
      { json },
    );
    return response.json();
  },
  generateAuthenticatorSecret: async (json: {
    session: string;
    username: string;
    accessToken?: string;
  }) => {
    const response = await api.post("auth/mfa/generate-authenticator-secret", {
      json,
    });
    return response.json();
  },
  connectAuthenticatorApp: async (json: {
    accessToken?: string;
    friendlyDeviceName: string;
    session: string;
    userCode: string;
  }) => {
    const response = await api.post("auth/mfa/connect-authenticator-app", {
      json,
    });
    return response.json();
  },
  checkAuthenticated: async () => {
    const response = await api.get("authenticated");
    return response.json();
  },
};

export default AuthServices;
