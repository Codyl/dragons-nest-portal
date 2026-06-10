import { useQuery } from '@tanstack/react-query';
import CurriculumServices from '@/api/services/curriculum.services';

const useCurriculumSelection = (params: {
  subjectId: string;
  studentId: string | null;
}) =>
  useQuery({
    queryKey: ['curriculum-selection', params.subjectId, params.studentId],
    queryFn: () =>
      CurriculumServices.getSelection({
        subjectId: params.subjectId,
        studentId: params.studentId!,
      }),
    enabled: !!params.subjectId && !!params.studentId,
  });

export default useCurriculumSelection;
