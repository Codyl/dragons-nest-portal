import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ComplianceServices, { type ComplianceCompletion } from '@/api/services/compliance.services';

export const useComplianceCompletion = (
  state: string | null | undefined,
  managedUserId: string | null | undefined,
) =>
  useQuery({
    queryKey: ['compliance', 'completion', state, managedUserId],
    queryFn: () => ComplianceServices.getCompletion(state!, managedUserId!),
    enabled: !!state && !!managedUserId,
  });

export const useToggleComplianceItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ComplianceServices.toggleCompletion,
    onMutate: async (variables) => {
      const queryKey = ['compliance', 'completion', variables.state, variables.managedUserId];
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<ComplianceCompletion>(queryKey);

      queryClient.setQueryData<ComplianceCompletion>(queryKey, (old) => ({
        items: { ...old?.items, [variables.itemKey]: variables.completed },
      }));

      return { previous, queryKey };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['compliance', 'completion', variables.state, variables.managedUserId],
      });
    },
  });
};
