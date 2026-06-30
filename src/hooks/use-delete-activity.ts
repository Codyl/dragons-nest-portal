import { useMutation, useQueryClient } from '@tanstack/react-query';
import ActivitiesServices from '@/api/services/activities.services';

const useDeleteActivity = (subjectId: string, studentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ActivitiesServices.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['activities', subjectId, studentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['subject-summary', subjectId, studentId],
      });
    },
  });
};

export default useDeleteActivity;
