import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import AuthServices from '@/api/services/auth.services';

const useLoginMutation = (): UseMutationResult<
  {
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
  },
  Error,
  {
    username: string;
    password: string;
    deviceKey?: string;
    deviceName?: string;
  }
> => {
  return useMutation({
    mutationFn: AuthServices.initiateAuth,
  });
};

export default useLoginMutation;
