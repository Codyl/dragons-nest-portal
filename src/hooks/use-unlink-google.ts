import UserServices from '@/api/services/user.services';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useUnlinkGoogle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => UserServices.unlinkGoogle(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useUnlinkGoogle;
