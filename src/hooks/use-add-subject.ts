import { useMutation, useQueryClient } from '@tanstack/react-query';
import ProfileServices from '@/api/services/profile.services';

const useAddSubject = (managedUserId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subjectId: string) =>
      ProfileServices.addSubjectToManagedUser(managedUserId, subjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['manageduser', managedUserId, 'classes'],
      });
    },
  });
};

export default useAddSubject;
