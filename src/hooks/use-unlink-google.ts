import ProfileServices from '@/api/services/profile.services';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useUnlinkGoogle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ProfileServices.unlinkGoogle(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useUnlinkGoogle;
