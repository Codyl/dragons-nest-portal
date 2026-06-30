import { useQuery } from '@tanstack/react-query';
import SubjectsServices from '@/api/services/subjects.services';

const useSubjectConcepts = (subjectId: string, studentId: string) =>
  useQuery({
    queryKey: ['subject-concepts', subjectId, studentId],
    queryFn: () => SubjectsServices.getSubjectConcepts({ subjectId, studentId }),
    enabled: !!subjectId && !!studentId,
    staleTime: 5 * 60 * 1000,
  });

export default useSubjectConcepts;
