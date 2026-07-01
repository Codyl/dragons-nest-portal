import { useQuery } from '@tanstack/react-query';
import CurriculumServices from '@/api/services/curriculum.services';

const useCurriculumItems = (params: {
  subjectId: string;
  managedUserId: string | null;
  householdId: string;
}) =>
  useQuery({
    queryKey: [
      'curriculum',
      params.subjectId,
      params.managedUserId ?? params.householdId,
    ],
    queryFn: () => CurriculumServices.getCurriculumItems(params),
    enabled: !!params.householdId && !!params.subjectId,
  });

export default useCurriculumItems;
