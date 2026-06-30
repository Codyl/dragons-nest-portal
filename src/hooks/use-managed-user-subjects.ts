import { useQuery } from '@tanstack/react-query';
import ProfileServices from '@/api/services/profile.services';

const useManagedUserSubjects = (studentId: string | null | undefined) =>
  useQuery({
    queryKey: ['student', studentId, 'classes'], // ponytail: query key kept for cache continuity
    queryFn: () => ProfileServices.getManagedUserSubjects(studentId!),
    enabled: !!studentId,
  });

export default useManagedUserSubjects;
