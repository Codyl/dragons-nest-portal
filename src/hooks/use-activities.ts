import { useQuery } from '@tanstack/react-query';
import ActivitiesServices from '@/api/services/activities.services';

const useActivities = (subjectId: string, studentId: string) =>
  useQuery({
    queryKey: ['activities', subjectId, studentId],
    queryFn: () => ActivitiesServices.getActivities({ subjectId, studentId }),
    enabled: !!subjectId && !!studentId,
    staleTime: 5 * 60 * 1000,
  });

export default useActivities;
