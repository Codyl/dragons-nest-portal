import { useQuery } from '@tanstack/react-query';
import ResourcesServices from '@/api/services/resources.services';

const useGetMyResources = (subjectId: string) =>
  useQuery({
    queryKey: ['my-resources', subjectId],
    queryFn: () =>
      ResourcesServices.getMyResources({ subjectId, limit: 10 }),
    enabled: !!subjectId,
    staleTime: 5 * 60 * 1000,
  });

export default useGetMyResources;
