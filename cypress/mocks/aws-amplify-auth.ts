/**
 * Mock for aws-amplify/auth used in Cypress component tests.
 * Avoids Cognito config and network in component tests.
 */
export const rememberDevice = (): Promise<void> => Promise.resolve();
export const forgetDevice = (): Promise<void> => Promise.resolve();

export const fetchDevices = async () => [];
export const fetchAuthSession = async () => ({
  tokens: {
    accessToken: {
      payload: {},
      toString: () => 'mock-access-token',
    },
    idToken: {
      payload: {},
      toString: () => 'mock-id-token',
    },
    refreshToken: {
      toString: () => 'mock-refresh-token',
    },
  },
});

export const signOut = async () => Promise.resolve();
export const signIn = async () => Promise.resolve();
export const confirmSignIn = async () => Promise.resolve();
export const fetchUserAttributes = async () => Promise.resolve();
export const fetchUser = async () => Promise.resolve();
