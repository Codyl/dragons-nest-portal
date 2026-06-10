import { unauthenticatedApi } from '../api.unauthenticated.config';

export type Subject = {
  _id: string;
  name: string;
  icon: string;
  color: string;
  slug: string;
  isEnrichment: boolean;
  links?: string[]
};

const SubjectsServices = {
  getSubjects: async (): Promise<Subject[]> => {
    const response = await unauthenticatedApi.get('subjects');
    const payload: unknown = await response.json();

    if (Array.isArray(payload)) {
      return payload as Subject[];
    }

    if (
      payload &&
      typeof payload === 'object' &&
      'data' in payload &&
      Array.isArray((payload as { data: unknown }).data)
    ) {
      return (payload as { data: Subject[] }).data;
    }

    return [];
  },
};

export default SubjectsServices;
