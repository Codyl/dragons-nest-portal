import { useQuery } from '@tanstack/react-query';
import SubjectsServices from '@/api/services/subjects.services';

const useSubjects = () =>
  useQuery({
    queryKey: ['subjects'],
    queryFn: SubjectsServices.getSubjects,
    staleTime: 5 * 60 * 1000,
  });

export default useSubjects;
