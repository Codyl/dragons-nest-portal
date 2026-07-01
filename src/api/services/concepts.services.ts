import { api } from '@/api/api.config';

export type Concept = {
  _id: string;
  subject: string;
  grade: string;
  state?: string;
  name: string;
  createdBy?: string;
};

export type CreateConceptDto = {
  subjectId: string;
  grade: string;
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

  create: async (
    body: CreateConceptDto,
  ): Promise<{ message: string; data: Concept }> => {
    const response = await api.post('concepts', { json: body });
    return response.json();
  },
};

export default ConceptsServices;
