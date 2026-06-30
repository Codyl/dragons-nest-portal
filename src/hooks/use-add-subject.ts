import { useMutation, useQueryClient } from '@tanstack/react-query';
import ProfileServices from '@/api/services/profile.services';

const useAddSubject = (studentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subjectId: string) =>
      ProfileServices.addSubjectToStudent(studentId, subjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['student', studentId, 'classes'],
      });
    },
  });
};

export default useAddSubject;
