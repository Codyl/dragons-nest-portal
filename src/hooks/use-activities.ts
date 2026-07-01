import { useQuery } from '@tanstack/react-query';
import ActivitiesServices from '@/api/services/activities.services';

const useActivities = (subjectId: string, managedUserId: string) =>
  useQuery({
    queryKey: ['activities', subjectId, managedUserId],
    queryFn: () => ActivitiesServices.getActivities({ subjectId, managedUserId }),
    enabled: !!subjectId && !!managedUserId,
    staleTime: 5 * 60 * 1000,
  });

export default useActivities;
