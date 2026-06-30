import { useQuery } from '@tanstack/react-query';
import SubjectsServices from '@/api/services/subjects.services';

const useSubjectSummary = (subjectId: string, studentId: string) =>
  useQuery({
    queryKey: ['subject-summary', subjectId, studentId],
    queryFn: () => SubjectsServices.getSubjectSummary({ subjectId, studentId }),
    enabled: !!subjectId && !!studentId,
    staleTime: 5 * 60 * 1000,
  });

export default useSubjectSummary;
