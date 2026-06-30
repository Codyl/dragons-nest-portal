import { api } from '@/api/api.config';

export type Activity = {
  _id: string;
  subjectId: string;
  studentId: string;
  date: string;
  conceptId: {
    _id: string;
    name: string;
    grade: string;
    subject: string
  };
  conceptName: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeSpentMinutes: number;
  notes?: string;
};

export type CreateActivityDto = {
  subjectId: string;
  studentId: string;
  date: string;
  conceptId: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeSpentMinutes: number;
  notes?: string;
};

const ActivitiesServices = {
  getActivities: async (params: {
    subjectId: string;
    studentId: string;
  }): Promise<{ message: string; data: Activity[] }> => {
    const searchParams = new URLSearchParams({
      subjectId: params.subjectId,
      studentId: params.studentId,
    });
    const response = await api.get('activities', { searchParams });
    return response.json();
  },

  createActivity: async (
    body: CreateActivityDto,
  ): Promise<{ message: string; data: Activity }> => {
    const response = await api.post('activities', { json: body });
    return response.json();
  },

  deleteActivity: async (
    id: string,
  ): Promise<{ message: string; data: Record<string, never> }> => {
    const response = await api.delete(`activities/${id}`);
    return response.json();
  },
};

export default ActivitiesServices;
