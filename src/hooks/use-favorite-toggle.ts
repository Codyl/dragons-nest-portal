import { useMutation, useQueryClient } from '@tanstack/react-query';
import FavoritesServices from '@/api/services/favorites.services';
import type { Resource } from '@/api/services/resources.services';

type FavoriteToggleParams = {
  resourceId: string;
  isFavorited: boolean;
};

const useFavoriteToggle = (subjectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resourceId, isFavorited }: FavoriteToggleParams) =>
      isFavorited
        ? FavoritesServices.unfavorite(resourceId)
        : FavoritesServices.favorite(resourceId),
    onMutate: async ({ resourceId, isFavorited }) => {
      // Cancel in-flight queries so they don't overwrite our optimistic update
      await queryClient.cancelQueries({
        queryKey: ['resources', subjectId],
        exact: false,
      });

      // Snapshot all matching resource queries for rollback
      const previousQueries = queryClient.getQueriesData<{
        message: string;
        data: Resource[];
        pagination: unknown;
      }>({ queryKey: ['resources', subjectId] });

      // Optimistically update every cached page
      queryClient.setQueriesData<{
        message: string;
        data: Resource[];
        pagination: unknown;
      }>({ queryKey: ['resources', subjectId] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((r) =>
            r._id === resourceId
              ? {
                  ...r,
                  isFavoritedByCurrentUser: !isFavorited,
                  favoriteCount: r.favoriteCount + (isFavorited ? -1 : 1),
                }
              : r,
          ),
        };
      });

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      // Rollback to snapshots
      context?.previousQueries.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['resources', subjectId],
        exact: false,
      });
    },
  });
};

export default useFavoriteToggle;
