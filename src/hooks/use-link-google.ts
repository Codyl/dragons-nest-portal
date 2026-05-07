import ProfileServices from '@/api/services/profile.services';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useLinkGoogle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (json: { credential: string }) =>
      ProfileServices.linkGoogle(json),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useLinkGoogle;
