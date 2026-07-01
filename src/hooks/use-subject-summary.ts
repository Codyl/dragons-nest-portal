import { useQuery } from '@tanstack/react-query';
import SubjectsServices from '@/api/services/subjects.services';

const useSubjectSummary = (subjectId: string, managedUserId: string) =>
  useQuery({
    queryKey: ['subject-summary', subjectId, managedUserId],
    queryFn: () => SubjectsServices.getSubjectSummary({ subjectId, managedUserId }),
    enabled: !!subjectId && !!managedUserId,
    staleTime: 5 * 60 * 1000,
  });

export default useSubjectSummary;
