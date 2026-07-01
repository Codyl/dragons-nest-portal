import { useMutation, useQueryClient } from '@tanstack/react-query';
import ActivitiesServices, {
  type CreateActivityDto,
} from '@/api/services/activities.services';

const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateActivityDto) =>
      ActivitiesServices.createActivity(body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['activities', variables.subjectId, variables.managedUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ['subject-summary', variables.subjectId, variables.managedUserId],
      });
    },
  });
};

export default useCreateActivity;
