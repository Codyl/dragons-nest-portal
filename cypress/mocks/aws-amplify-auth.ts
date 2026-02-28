/**
 * Mock for aws-amplify/auth used in Cypress component tests.
 * Avoids Cognito config and network in component tests.
 */
export const rememberDevice = (): Promise<void> => Promise.resolve();
export const forgetDevice = (): Promise<void> => Promise.resolve();
