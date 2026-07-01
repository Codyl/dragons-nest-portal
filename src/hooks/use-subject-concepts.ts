import { useQuery } from '@tanstack/react-query';
import SubjectsServices from '@/api/services/subjects.services';

const useSubjectConcepts = (subjectId: string, managedUserId: string) =>
  useQuery({
    queryKey: ['subject-concepts', subjectId, managedUserId],
    queryFn: () => SubjectsServices.getSubjectConcepts({ subjectId, managedUserId }),
    enabled: !!subjectId && !!managedUserId,
    staleTime: 5 * 60 * 1000,
  });

export default useSubjectConcepts;
