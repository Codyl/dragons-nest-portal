import { useQuery } from '@tanstack/react-query';
import CurriculumServices from '@/api/services/curriculum.services';

const useCurriculumSelection = (params: {
  subjectId: string;
  managedUserId: string | null;
}) =>
  useQuery({
    queryKey: ['curriculum-selection', params.subjectId, params.managedUserId],
    queryFn: () =>
      CurriculumServices.getSelection({
        subjectId: params.subjectId,
        managedUserId: params.managedUserId!,
      }),
    enabled: !!params.subjectId && !!params.managedUserId,
  });

export default useCurriculumSelection;
