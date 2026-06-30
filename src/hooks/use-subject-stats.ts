import { useQuery } from '@tanstack/react-query';
import SubjectsServices from '@/api/services/subjects.services';

const useSubjectStats = (subjectId: string, studentId: string) =>
  useQuery({
    queryKey: ['subject-stats', subjectId, studentId],
    queryFn: () => SubjectsServices.getSubjectStats({ subjectId, studentId }),
    enabled: !!subjectId && !!studentId,
    staleTime: 5 * 60 * 1000,
  });

export default useSubjectStats;
