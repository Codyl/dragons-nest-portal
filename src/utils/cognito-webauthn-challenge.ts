import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';

/**
 * Cognito WEB_AUTHN challenge parameters are string maps; the request options JSON is typically
 * provided as a stringified value under one of the entries.
 */
export function parseCredentialRequestOptionsFromCognito(
  challengeParameters: Record<string, string> | undefined,
): PublicKeyCredentialRequestOptionsJSON {
  if (!challengeParameters) {
    throw new Error('Missing WebAuthn challenge parameters from Cognito.');
  }

  for (const value of Object.values(challengeParameters)) {
    try {
      const parsed = JSON.parse(value) as PublicKeyCredentialRequestOptionsJSON;
      if (
        parsed &&
        typeof parsed === 'object' &&
        'challenge' in parsed &&
        typeof (parsed as { challenge?: unknown }).challenge === 'string'
      ) {
        return parsed;
      }
    } catch {
      // not JSON
    }
  }

  throw new Error(
    'Could not parse WebAuthn credential request options from Cognito challenge parameters.',
  );
}
