import { api } from '@/api/api.config';

export type Resource = {
  _id: string;
  title: string;
  description: string;
  subjectTag: string;
  favoriteCount: number;
  isFavoritedByCurrentUser: boolean;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
};

export type CreateResourceDto = {
  title: string;
  description: string;
  subjectId: string;
  subjectTag: string;
};

export type GetMyResourcesDto = {
  subjectId: string;
  limit?: number;
};

const ResourcesServices = {
  getResources: async (params: {
    subjectId: string;
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ message: string; data: Resource[]; pagination: PaginationMeta }> => {
    const searchParams = new URLSearchParams({
      subjectId: params.subjectId,
      page: String(params.page),
      limit: String(params.limit),
    });
    if (params.search) searchParams.set('search', params.search);
    const response = await api.get('resources', { searchParams });
    return response.json();
  },

  createResource: async (
    body: CreateResourceDto,
  ): Promise<{ message: string; data: Resource }> => {
    const response = await api.post('resources', { json: body });
    return response.json();
  },

  getMyResources: async (
    params: GetMyResourcesDto,
  ): Promise<{ message: string; data: Resource[] }> => {
    const searchParams = new URLSearchParams({ subjectId: params.subjectId });
    if (params.limit) searchParams.set('limit', String(params.limit));
    const response = await api.get('resources/me', { searchParams });
    return response.json();
  },
};

export default ResourcesServices;
