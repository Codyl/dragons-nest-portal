import { api } from '../api.config';
import { unauthenticatedApi } from '../api.unauthenticated.config';

const AuthServices = {
  verifyUsername: async (json: {
    email: string;
    session?: string;
  }): Promise<{
    message: string;
    data: {
      Session: string;
      AvailableChallenges: string[];
    };
  }> => {
    const response = await unauthenticatedApi.post('auth/verify-username', {
      json,
    });
    return response.json() as Promise<{
      message: string;
      data: {
        Session: string;
        AvailableChallenges: string[];
      };
    }>;
  },
  selectAuthChallenge: async (json: {
    answer: string;
    username: string;
    session?: string;
    emailCode?: string;
  }): Promise<{
    message: string;
    data: {
      Session: string;
      ChallengeName: string;
      AuthenticationResult?: {
        AccessToken?: string;
        RefreshToken?: string;
        IdToken?: string;
      };
    };
  }> => {
    const response = await unauthenticatedApi.post(
      'auth/select-auth-challenge',
      {
        json,
      },
    );
    return response.json();
  },
  answerOTP: async (json: {
    otpType: string;
    answer: string;
    username: string;
    session?: string;
    emailCode?: string;
  }): Promise<{
    message: string;
    data: {
      Session: string;
      ChallengeName: string;
      AuthenticationResult?: {
        AccessToken?: string;
        RefreshToken?: string;
        IdToken?: string;
      };
    };
  }> => {
    const response = await unauthenticatedApi.post('auth/answer-otp', { json });
    return response.json();
  },
  initiateAuth: async (json: {
    username: string;
    password: string;
    session?: string;
    deviceKey?: string;
    deviceName?: string;
  }): Promise<{
    message: string;
    data: {
      Session: string;
      ChallengeName: string;
      AuthenticationResult?: {
        AccessToken?: string;
        RefreshToken?: string;
        IdToken?: string;
        NewDeviceMetadata?: {
          DeviceKey?: string;
          DeviceName?: string;
        };
        DeviceRandomPassword?: string;
      };
    };
  }> => {
    const response = await unauthenticatedApi.post('auth/initiate-login', {
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
  }): Promise<{
    message: string;
    data: {
      Session: string;
      ChallengeName: string;
      AuthenticationResult?: {
        AccessToken?: string;
        RefreshToken?: string;
        IdToken?: string;
      };
    };
  }> => {
    const response = await unauthenticatedApi.post('auth/mfa', { json });
    return response.json();
  },
  forgotPassword: async (json: {
    username: string;
  }): Promise<{ message: string; data: {} }> => {
    const response = await unauthenticatedApi.post('auth/forgot-password', {
      json,
    });
    return response.json();
  },
  confirmForgotPassword: async (json: {
    username: string;
    code: string;
    password: string;
  }): Promise<{
    message: string;
    data: {
      AuthenticationResult?: {
        AccessToken?: string;
        RefreshToken?: string;
        IdToken?: string;
      };
    };
  }> => {
    const response = await unauthenticatedApi.post(
      'auth/confirm-forgot-password',
      { json },
    );
    return response.json();
  },
  logout: async (): Promise<{ message: string; data: {} }> => {
    const token = localStorage.getItem('AccessToken');

    if (!token) {
      throw new Error('No access token found');
    }

    const response = await unauthenticatedApi.get('auth/logout', {
      searchParams: { accessToken: token },
    });
    return response.json();
  },
  initiateSignup: async (json: {
    email: string;
    password: string;
  }): Promise<{
    message: string;
    data: {
      Session: string;
    };
  }> => {
    const response = await unauthenticatedApi.post('auth/initiate-signup', {
      json,
    });
    return response.json();
  },
  confirmSignup: async (json: {
    username: string;
    code: string;
    session?: string;
    password?: string;
  }): Promise<{
    message: string;
    data: {
      Session: string;
      ChallengeName: string;
      AuthenticationResult?: {
        AccessToken?: string;
        RefreshToken?: string;
        IdToken?: string;
      };
    };
  }> => {
    const response = await unauthenticatedApi.post('auth/confirm-signup', {
      json,
    });
    return response.json();
  },
  googleSSOSignup: async (json: {
    credential: string;
  }): Promise<{
    message: string;
    data: {
      AuthenticationResult?: {
        AccessToken?: string;
        RefreshToken?: string;
        IdToken?: string;
      };
    };
  }> => {
    const response = await unauthenticatedApi.post('auth/google-sso-signup', {
      json,
    });
    return response.json();
  },
  resendSignupConfirmationCode: async (json: {
    username: string;
  }): Promise<{ message: string; data: {} }> => {
    const response = await unauthenticatedApi.post(
      'auth/confirm-signup/resend-code',
      { json },
    );
    return response.json();
  },
  generateAuthenticatorSecret: async (json: {
    session: string;
    username: string;
    accessToken?: string;
  }): Promise<{
    message: string;
    data: {
      Session: string;
      qrString: string;
    };
  }> => {
    const response = await api.post('auth/mfa/generate-authenticator-secret', {
      json,
    });
    return response.json();
  },
  connectAuthenticatorApp: async (json: {
    accessToken?: string;
    friendlyDeviceName: string;
    session: string;
    userCode: string;
    username: string;
    password: string;
  }): Promise<{
    message: string;
    data: {
      Session: string;
      ChallengeName: string;
      AuthenticationResult?: {
        AccessToken?: string;
        RefreshToken?: string;
        IdToken?: string;
      };
    };
  }> => {
    const response = await api.post('auth/mfa/connect-authenticator-app', {
      json,
    });
    return response.json();
  },
};

export default AuthServices;
