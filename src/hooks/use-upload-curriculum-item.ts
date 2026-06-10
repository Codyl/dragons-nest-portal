import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import CurriculumServices, { type CurriculumItem } from '@/api/services/curriculum.services';

const useUploadCurriculumItem = (params: {
  subjectId: string;
  studentId: string | null;
  householdId: string;
}): UseMutationResult<{ message: string; data: CurriculumItem }, Error, File> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) =>
      CurriculumServices.uploadCurriculumItem({ file, ...params }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['curriculum', params.subjectId, params.studentId ?? params.householdId],
      });
    },
  });
};

export default useUploadCurriculumItem;
