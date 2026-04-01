import UserServices from '@/api/services/user.services';
import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

const useLoggedInUser = (): UseQueryResult<
  {
    message: string;
    data: {
      email?: string;
      family_name?: string;
      middle_name?: string;
      given_name?: string;
      phone_number?: string;
      emailMfaEnabled?: boolean;
      smsMfaEnabled?: boolean;
      softwareTokenMfaEnabled?: boolean;
      preferredMfa?: string;
      loginMethods?: string[];
      hasPassword?: boolean;
      hasPasskey?: boolean;
      passkeyCount?: number;
      firstLoggedInAt?: string | null;
    };
  },
  Error
> => {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: UserServices.getUser,
  });
};

export default useLoggedInUser;
