import { api } from '@/api/api.config';

export type CurriculumItem = {
  _id: string;
  fileName: string;
  mimeType: string;
  uploadedAt: string; // ISO 8601 UTC, e.g. "2024-11-15T14:32:00.000Z"
  url: string;
  subjectId: string;
  studentId: string | null;
  householdId: string;
};

const CurriculumServices = {
  getCurriculumItems: async (params: {
    subjectId: string;
    studentId: string | null;
    householdId: string;
  }): Promise<{ message: string; data: CurriculumItem[] }> => {
    const searchParams = new URLSearchParams({
      subjectId: params.subjectId,
      householdId: params.householdId,
    });
    if (params.studentId) searchParams.set('studentId', params.studentId);
    const response = await api.get('curriculum', { searchParams });
    return response.json();
  },

  uploadCurriculumItem: async (params: {
    file: File;
    subjectId: string;
    studentId: string | null;
    householdId: string;
  }): Promise<{ message: string; data: CurriculumItem }> => {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('subjectId', params.subjectId);
    formData.append('householdId', params.householdId);
    if (params.studentId) formData.append('studentId', params.studentId);
    // Note: pass body: formData (not json:) so ky omits the Content-Type header
    // and the browser sets multipart/form-data with the correct boundary automatically
    const response = await api.post('curriculum/upload', { body: formData });
    return response.json();
  },

  getSelection: async (params: {
    subjectId: string;
    studentId: string;
  }): Promise<{
    message: string;
    data: { curriculumItemId: string } | null;
  }> => {
    const searchParams = new URLSearchParams({
      subjectId: params.subjectId,
      studentId: params.studentId,
    });
    const response = await api.get('curriculum/selection', { searchParams });
    return response.json();
  },

  setSelection: async (params: {
    subjectId: string;
    studentId: string;
    curriculumItemId: string;
  }): Promise<{ message: string; data: unknown }> => {
    const response = await api.put('curriculum/selection', { json: params });
    return response.json();
  },
};

export default CurriculumServices;
