import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import CurriculumServices from '@/api/services/curriculum.services';

const useSetCurriculumSelection = (params: {
  subjectId: string;
  managedUserId: string | null;
}): UseMutationResult<
  { message: string; data: unknown },
  Error,
  { curriculumItemId: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { curriculumItemId: string }) =>
      CurriculumServices.setSelection({
        subjectId: params.subjectId,
        managedUserId: params.managedUserId!,
        curriculumItemId: variables.curriculumItemId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['curriculum-selection', params.subjectId, params.managedUserId],
      });
    },
  });
};

export default useSetCurriculumSelection;
