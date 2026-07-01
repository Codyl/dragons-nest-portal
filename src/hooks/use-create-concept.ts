import { useMutation, useQueryClient } from '@tanstack/react-query';
import ConceptsServices, {
  type CreateConceptDto,
} from '@/api/services/concepts.services';

const useCreateConcept = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateConceptDto) => ConceptsServices.create(body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['concepts', variables.subjectId],
      });
    },
  });
};

export default useCreateConcept;
