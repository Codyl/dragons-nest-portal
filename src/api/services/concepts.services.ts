import { api } from '@/api/api.config';

export type Concept = {
  _id: string;
  subject: string;
  grade: string;
  state?: string;
  name: string;
};

const ConceptsServices = {
  getBySubject: async (params: {
    subjectId: string;
    grade?: string;
  }): Promise<{ message: string; data: Concept[] }> => {
    const searchParams = new URLSearchParams({ subjectId: params.subjectId });
    if (params.grade) searchParams.set('grade', params.grade);
    const response = await api.get('concepts', { searchParams });
    return response.json();
  },
};

export default ConceptsServices;
