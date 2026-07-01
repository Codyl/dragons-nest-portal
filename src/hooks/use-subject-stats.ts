import { useQuery } from '@tanstack/react-query';
import SubjectsServices from '@/api/services/subjects.services';

const useSubjectStats = (subjectId: string, managedUserId: string) =>
  useQuery({
    queryKey: ['subject-stats', subjectId, managedUserId],
    queryFn: () => SubjectsServices.getSubjectStats({ subjectId, managedUserId }),
    enabled: !!subjectId && !!managedUserId,
    staleTime: 5 * 60 * 1000,
  });

export default useSubjectStats;
