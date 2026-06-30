import { useQuery } from '@tanstack/react-query';
import ResourcesServices from '@/api/services/resources.services';

const useResources = (subjectId: string, page: number, search?: string) =>
  useQuery({
    queryKey: ['resources', subjectId, page, search],
    queryFn: () =>
      ResourcesServices.getResources({ subjectId, page, limit: 10, search }),
    enabled: !!subjectId,
    staleTime: 5 * 60 * 1000,
  });

export default useResources;
