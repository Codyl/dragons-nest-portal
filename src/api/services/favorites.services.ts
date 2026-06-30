import { api } from '@/api/api.config';

const FavoritesServices = {
  favorite: async (
    resourceId: string,
  ): Promise<{ message: string; data: Record<string, never> }> => {
    const response = await api.post('favorites', { json: { resourceId } });
    return response.json();
  },

  unfavorite: async (
    resourceId: string,
  ): Promise<{ message: string; data: Record<string, never> }> => {
    const response = await api.delete(`favorites/${resourceId}`);
    return response.json();
  },
};

export default FavoritesServices;
