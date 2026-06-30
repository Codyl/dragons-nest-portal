import { useQuery } from '@tanstack/react-query';
import ConceptsServices from '@/api/services/concepts.services';

const useConcepts = (subjectId: string, grade?: string) =>
  useQuery({
    queryKey: ['concepts', subjectId, grade],
    queryFn: () => ConceptsServices.getBySubject({ subjectId, grade }),
    enabled: !!subjectId,
    staleTime: 5 * 60 * 1000,
  });

export default useConcepts;
