import { useQuery } from '@tanstack/react-query';
import ProfileServices from '@/api/services/profile.services';

const useManagedUserSubjects = (managedUserId: string | null | undefined) =>
  useQuery({
    queryKey: ['manageduser', managedUserId, 'classes'], // ponytail: query key kept for cache continuity
    queryFn: () => ProfileServices.getManagedUserSubjects(managedUserId!),
    enabled: !!managedUserId,
  });

export default useManagedUserSubjects;
