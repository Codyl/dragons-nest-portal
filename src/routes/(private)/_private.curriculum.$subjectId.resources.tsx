import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Resource } from '@/api/services/resources.services';
import useResources from '@/hooks/use-resources';
import useFavoriteToggle from '@/hooks/use-favorite-toggle';

export const Route = createFileRoute(
  '/(private)/_private/curriculum/$subjectId/resources',
)({
  component: CommunityResourcesRoute,
});

const truncate = (text: string, max: number) =>
  text.length > max ? text.slice(0, max) + '…' : text;

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function CommunityResourcesRoute() {
  const { subjectId } = Route.useParams();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const search = debouncedSearch.length >= 2 ? debouncedSearch : undefined;

  // Reset page when search changes
  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setPage(1);
  }

  const { data, isLoading, isError, refetch } = useResources(
    subjectId,
    page,
    search,
  );

  const toggleFavorite = useFavoriteToggle(subjectId);

  // Accumulate resources across pages (reset on search change)
  const [accumulated, setAccumulated] = useState<Resource[]>([]);

  useEffect(() => {
    if (!data) return;
    if (page === 1) {
      setAccumulated(data.data);
    } else {
      setAccumulated((prev) => [...prev, ...data.data]);
    }
  }, [data, page]);

  const totalLoaded = accumulated.length;
  const total = data?.pagination?.total ?? 0;
  const hasMore = totalLoaded < total;

  const handleLoadMore = useCallback(() => setPage((p) => p + 1), []);

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-destructive">
          Resources could not be loaded.
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold">Community Resources</h2>

      <Input
        type="text"
        placeholder="Search resources (min 2 characters)…"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="max-w-md"
      />

      {isLoading && accumulated.length === 0 && (
        <p className="text-muted-foreground">Loading resources…</p>
      )}

      {!isLoading && accumulated.length === 0 && (
        <p className="text-muted-foreground">
          No community resources are available yet.
        </p>
      )}

      {accumulated.length > 0 && (
        <ul className="space-y-4">
          {accumulated.map((resource) => (
            <li
              key={resource._id}
              className="flex items-start gap-3 rounded-lg border p-4"
            >
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1 pt-0.5 text-sm text-muted-foreground"
                aria-label={
                  resource.isFavoritedByCurrentUser
                    ? 'Unfavorite this resource'
                    : 'Favorite this resource'
                }
                onClick={() =>
                  toggleFavorite.mutate(
                    {
                      resourceId: resource._id,
                      isFavorited: resource.isFavoritedByCurrentUser,
                    },
                    {
                      onError: () =>
                        toast.error(
                          'Could not update favorite. Please try again.',
                        ),
                    },
                  )
                }
              >
                <Star
                  className="size-4"
                  fill={
                    resource.isFavoritedByCurrentUser
                      ? 'currentColor'
                      : 'none'
                  }
                />
                <span>{resource.favoriteCount}</span>
              </button>

              <div className="flex-1 space-y-1">
                <p className="font-medium">
                  {truncate(resource.title, 120)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {truncate(resource.description, 200)}
                </p>
                <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {resource.subjectTag}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            isPending={isLoading && page > 1}
          >
            See more resources
          </Button>
        </div>
      )}
    </div>
  );
}
