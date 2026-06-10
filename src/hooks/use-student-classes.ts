import { useQuery } from '@tanstack/react-query';
import ProfileServices from '@/api/services/profile.services';

const useStudentClasses = (studentId: string | null | undefined) =>
  useQuery({
    queryKey: ['student', studentId, 'classes'],
    queryFn: () => ProfileServices.getStudentClasses(studentId!),
    enabled: !!studentId,
  });

export default useStudentClasses;
