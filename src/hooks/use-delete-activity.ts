import { useMutation, useQueryClient } from '@tanstack/react-query';
import ActivitiesServices from '@/api/services/activities.services';

const useDeleteActivity = (subjectId: string, managedUserId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ActivitiesServices.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['activities', subjectId, managedUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ['subject-summary', subjectId, managedUserId],
      });
    },
  });
};

export default useDeleteActivity;
