import { useMutation, useQueryClient } from '@tanstack/react-query';
import ResourcesServices, {
  type CreateResourceDto,
} from '@/api/services/resources.services';

const useCreateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateResourceDto) =>
      ResourcesServices.createResource(body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['resources', variables.subjectId],
      });
    },
  });
};

export default useCreateResource;
