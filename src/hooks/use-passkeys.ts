import UserServices from '@/api/services/user.services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const passkeysQueryKey = ['passkeys'] as const;

export function usePasskeysList() {
  return useQuery({
    queryKey: passkeysQueryKey,
    queryFn: async () => {
      const res = await UserServices.listPasskeys();
      return res.data.passkeys;
    },
  });
}

export function useDeletePasskey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentialId: string) =>
      UserServices.deletePasskey(credentialId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: passkeysQueryKey });
      void queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}
