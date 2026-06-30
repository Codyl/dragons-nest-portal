import { unauthenticatedApi } from '../api.unauthenticated.config';
import { api } from '@/api/api.config';

export type Subject = {
  _id: string;
  name: string;
  icon: string;
  color: string;
  slug: string;
  isEnrichment: boolean;
  mascot?: string;
  links?: string[];
};

export type SubjectStats = {
  progressPercent: number;
  hoursCompleted: number;
  hoursTarget: number;
  standardsMet: number;
  standardsTotal: number;
  documentsCount: number;
};

export type SubjectSummary = {
  mostPracticedConcept: string | null;
  totalTimeThisWeek: { hours: number; minutes: number };
  averageDifficulty: 'Low' | 'Medium' | 'High' | null;
};

export type ConceptCard = {
  _id: string;
  concept: {
    _id: string,
    subject: string,
    grade: string,
    name: string;
  };
  difficulty: 'Easy' | 'Medium' | 'Hard';
  totalMinutes: number;
  progressPercent: number;
  sessionCount: number;
  lastSessionDate: string | null;
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

  getSubjectStats: async (params: {
    subjectId: string;
    studentId: string;
  }): Promise<{ message: string; data: SubjectStats }> => {
    const searchParams = new URLSearchParams({ studentId: params.studentId });
    const response = await api.get(`subjects/${params.subjectId}/stats`, { searchParams });
    return response.json();
  },

  getSubjectSummary: async (params: {
    subjectId: string;
    studentId: string;
  }): Promise<{ message: string; data: SubjectSummary }> => {
    const searchParams = new URLSearchParams({ studentId: params.studentId });
    const response = await api.get(`subjects/${params.subjectId}/summary`, { searchParams });
    return response.json();
  },

  getSubjectConcepts: async (params: {
    subjectId: string;
    studentId: string;
    limit?: number;
  }): Promise<{ message: string; data: ConceptCard[] }> => {
    const searchParams = new URLSearchParams({ studentId: params.studentId });
    if (params.limit) searchParams.set('limit', String(params.limit));
    const response = await api.get(`subjects/${params.subjectId}/concepts`, { searchParams });
    return response.json();
  },
};

export default SubjectsServices;
