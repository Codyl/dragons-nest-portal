import UserServices from '@/api/services/user.services';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useLinkGoogle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (json: { credential: string }) => UserServices.linkGoogle(json),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useLinkGoogle;
