/**
 * Direct SRP handshake with Cognito in the browser (password never leaves the browser).
 * Tokens are then handed off to the backend to set HttpOnly cookies.
 */
import { Amplify } from 'aws-amplify';
import {
  signIn,
  signOut,
  confirmSignIn,
  fetchAuthSession,
} from 'aws-amplify/auth';

const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID as string;
const USER_POOL_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID as string;

const AMPLIFY_AUTH_FLOW_KEY = 'authFlow';

/** Call once at app init. Requires VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID. */
export function configureCognitoAuth(): void {
  if (!USER_POOL_ID || !USER_POOL_CLIENT_ID) {
    return;
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: USER_POOL_ID,
        userPoolClientId: USER_POOL_CLIENT_ID,
      },
    },
  });
}

/** Whether direct Cognito (Amplify) auth is configured and should be used for login. */
export function isCognitoAuthConfigured(): boolean {
  return Boolean(USER_POOL_ID && USER_POOL_CLIENT_ID);
}

/** Mark that the current auth flow is Amplify (for MFA/challenge completion). */
export function setAmplifyAuthFlow(): void {
  sessionStorage.setItem(AMPLIFY_AUTH_FLOW_KEY, 'amplify');
}

/** Clear Amplify auth flow flag. */
export function clearAmplifyAuthFlow(): void {
  sessionStorage.removeItem(AMPLIFY_AUTH_FLOW_KEY);
}

/** True if the user is in an Amplify-started flow (e.g. needs confirmSignIn on MFA page). */
export function isAmplifyAuthFlow(): boolean {
  return sessionStorage.getItem(AMPLIFY_AUTH_FLOW_KEY) === 'amplify';
}

/** Map Amplify nextStep.signInStep to backend-style ChallengeName for UI routing. */
function mapSignInStepToChallengeName(signInStep: string): string {
  const map: Record<string, string> = {
    CONFIRM_SIGN_IN_WITH_TOTP_CODE: 'SOFTWARE_TOKEN_MFA',
    CONFIRM_SIGN_IN_WITH_SMS_CODE: 'SMS_MFA',
    CONFIRM_SIGN_IN_WITH_EMAIL_CODE: 'EMAIL_MFA',
    CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED: 'NEW_PASSWORD_REQUIRED',
    CONTINUE_SIGN_IN_WITH_TOTP_SETUP: 'MFA_SETUP',
    CONTINUE_SIGN_IN_WITH_MFA_SETUP_SELECTION: 'MFA_SETUP',
  };
  return map[signInStep] ?? signInStep;
}

/**
 * Extract JWT strings from Amplify session.
 *
 * NOTE: Amplify v6 does NOT expose the raw refresh token via `fetchAuthSession`.
 * Its `AuthTokens` type only contains `accessToken` and `idToken` (see
 * `@aws-amplify/core/.../singleton/Auth/types.d.ts`). The refresh token is held
 * inside Amplify's token provider storage and is rotated transparently when
 * `fetchAuthSession({ forceRefresh: true })` is called. Do not try to pull a
 * `refreshToken` field off the session here, it will always be undefined and
 * leads to a missing REFRESH_TOKEN cookie on the backend.
 */
function tokensFromSession(
  session: Awaited<ReturnType<typeof fetchAuthSession>>,
): {
  AccessToken?: string;
  IdToken?: string;
} {
  const t = session.tokens;
  if (!t) return {};

  const toJwt = (x: unknown): string | undefined => {
    if (typeof x === 'string') return x;

    if (x && typeof (x as { toString?: () => string }).toString === 'function')
      return (x as { toString: () => string }).toString();

    return undefined;
  };
  return {
    AccessToken: toJwt(t.accessToken),
    IdToken: toJwt(t.idToken),
  };
}

export type SignInWithCognitoResult =
  | {
      success: true;
      tokens: { AccessToken?: string; IdToken?: string };
    }
  | {
      success: false;
      challenge: true;
      challengeName: string;
      signInStep: string;
      /** For MFA_SETUP / TOTP setup */
      totpSetupUri?: string;
    }
  | { success: false; error: unknown };

/**
 * Sign in with Cognito using SRP in the browser (password never sent to backend).
 * Returns tokens on success, or challenge info when MFA/new password etc. is required.
 * Clears any existing Amplify session first so "Sign in" always does a fresh sign-in
 * and avoids "There is already a signed in user" when cookies were lost (e.g. refresh).
 */
export async function signInWithCognito(
  username: string,
  password: string,
): Promise<SignInWithCognitoResult> {
  try {
    // Clear any existing Amplify session so signIn() succeeds and we can sync cookies via set-session
    try {
      await signOut();
    } catch {
      // No user signed in or signOut failed; proceed with signIn
    }

    const { nextStep } = await signIn({ username, password });

    if (nextStep.signInStep === 'DONE') {
      const session = await fetchAuthSession();
      const tokens = tokensFromSession(session);
      return { success: true, tokens };
    }

    setAmplifyAuthFlow();
    const challengeName = mapSignInStepToChallengeName(nextStep.signInStep);
    const totpSetupUri =
      'totpSetupDetails' in nextStep &&
      typeof (
        nextStep as unknown as {
          totpSetupDetails?: { getSetupUri?: (...args: unknown[]) => { href: string } };
        }
      ).totpSetupDetails?.getSetupUri === 'function'
        ? (
            nextStep as unknown as {
              totpSetupDetails: { getSetupUri: (appName: string) => { href: string } };
            }
          ).totpSetupDetails.getSetupUri('CodyLillywhite').href
        : undefined;

    return {
      success: false,
      challenge: true,
      challengeName,
      signInStep: nextStep.signInStep,
      totpSetupUri,
    };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Complete MFA (or other challenge) and return tokens. Call after signInWithCognito returned a challenge.
 */
export async function confirmSignInAndGetTokens(
  challengeResponse: string,
): Promise<{
  AccessToken?: string;
  IdToken?: string;
}> {
  const { nextStep } = await confirmSignIn({ challengeResponse });
  if (nextStep.signInStep !== 'DONE') {
    throw new Error('Sign-in not complete');
  }

  const session = await fetchAuthSession();
  return tokensFromSession(session);
}

/**
 * Force-refresh the Cognito session using Amplify's internally-stored refresh
 * token, returning the new short-lived JWTs. Returns null if Amplify is not
 * configured or no active session is available (e.g. user signed out, refresh
 * token revoked).
 *
 * Pair this with `/auth/set-session` to replace the HttpOnly access/id cookies
 * after refresh. The backend `/auth/refresh-token` route only works when a
 * REFRESH_TOKEN cookie was issued (Google, signup, or backend SRP flows); it
 * does not work after an Amplify SRP login because Amplify v6 keeps the
 * refresh token in its own storage and never hands it to the backend.
 */
export async function refreshCognitoSession(): Promise<{
  AccessToken?: string;
  IdToken?: string;
} | null> {
  if (!isCognitoAuthConfigured()) return null;

  try {
    const session = await fetchAuthSession({ forceRefresh: true });
    const tokens = tokensFromSession(session);
    if (!tokens.AccessToken) return null;
    return tokens;
  } catch {
    return null;
  }
}
