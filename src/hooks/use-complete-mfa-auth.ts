import AuthServices from '@/api/services/auth.services';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import {
  clearAmplifyAuthFlow,
  confirmSignInAndGetTokens,
  isAmplifyAuthFlow,
} from '@/lib/cognito-auth';

export type CompleteMFAMutationData = {
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
    };
  };
};

export type CompleteMFAMutationVariables = {
  username: string;
  password: string;
  softwareTokenMfaCode: string;
  session: string;
  challengeName: string;
};

async function completeMFAMutationFn(
  variables: CompleteMFAMutationVariables,
): Promise<CompleteMFAMutationData> {
  const { softwareTokenMfaCode } = variables;

  if (isAmplifyAuthFlow()) {
    const tokens = await confirmSignInAndGetTokens(softwareTokenMfaCode);
    await AuthServices.setSession(tokens);
    clearAmplifyAuthFlow();
    return {
      message: 'MFA verified successfully',
      data: {
        Session: '',
        ChallengeName: '',
        AuthenticationResult: {},
      },
    };
  }

  return AuthServices.completeMFAAuth(variables);
}

const useCompleteMFAAuth = (): UseMutationResult<
  CompleteMFAMutationData,
  Error,
  CompleteMFAMutationVariables
> => {
  return useMutation({
    mutationFn: completeMFAMutationFn,
  });
};

export default useCompleteMFAAuth;
