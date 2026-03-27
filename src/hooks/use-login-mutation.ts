import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import AuthServices from '@/api/services/auth.services';
import { isCognitoAuthConfigured, signInWithCognito } from '@/lib/cognito-auth';

export type LoginMutationVariables = {
  username: string;
  password: string;
  session?: string;
  deviceKey?: string;
  deviceName?: string;
};

export type LoginMutationData = {
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
};

async function loginWithDirectHandoff(
  username: string,
  password: string,
): Promise<LoginMutationData> {
  const result = await signInWithCognito(username, password);

  if (result.success && result.tokens) {
    await AuthServices.setSession(result.tokens);
    return {
      message: 'Login initiated successfully',
      data: {
        Session: '',
        ChallengeName: '',
        AuthenticationResult: {},
      },
    };
  }

  if (result.success === false && 'challenge' in result && result.challenge) {
    return {
      message: 'Login initiated successfully',
      data: {
        Session: '',
        ChallengeName: result.challengeName,
        AuthenticationResult: undefined,
      },
    };
  }

  const err =
    result.success === false && 'error' in result
      ? result.error
      : new Error('Sign-in failed');
  throw err;
}

async function loginMutationFn(
  variables: LoginMutationVariables,
): Promise<LoginMutationData> {
  const { username, password, session, deviceKey, deviceName } = variables;

  if (isCognitoAuthConfigured()) {
    return loginWithDirectHandoff(username, password);
  }

  return AuthServices.initiateAuth({
    username,
    password,
    ...(session ? { session } : {}),
    ...(deviceKey ? { deviceKey } : {}),
    ...(deviceName ? { deviceName } : {}),
  });
}

const useLoginMutation = (): UseMutationResult<
  LoginMutationData,
  Error,
  LoginMutationVariables
> => {
  return useMutation({
    mutationFn: loginMutationFn,
  });
};

export default useLoginMutation;
