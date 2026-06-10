import { describe, expect, it } from 'vite-plus/test';
import { parseCredentialRequestOptionsFromCognito } from './cognito-webauthn-challenge';

describe('parseCredentialRequestOptionsFromCognito', () => {
  it('parses JSON from a challenge parameter value', () => {
    const options = {
      challenge: 'AA',
      timeout: 60000,
      rpId: 'example.com',
      allowCredentials: [],
    };
    const parsed = parseCredentialRequestOptionsFromCognito({
      CREDENTIAL_REQUEST_OPTIONS: JSON.stringify(options),
    });
    expect(parsed).toEqual(options);
  });

  it('throws when parameters are missing', () => {
    expect(() => parseCredentialRequestOptionsFromCognito(undefined)).toThrow(
      /Missing WebAuthn challenge parameters/,
    );
  });

  it('throws when no value contains request options JSON', () => {
    expect(() =>
      parseCredentialRequestOptionsFromCognito({ foo: 'not-json' }),
    ).toThrow(/Could not parse/);
  });
});
