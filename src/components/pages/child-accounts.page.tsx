import { useState } from 'react';
import type { ManagedUserDraftAll } from '@/api/services/profile.services';
import ManagedUserDraftCard from '@/components/cards/manageduser-card';
import AddManagedUserSheet from '@/components/sections/add-manageduser-sheet';
import RemoveConfirmDialog from '@/components/modals/remove-confirm-dialog';
import { Button } from '@/components/ui/button';
import useArchiveManagedUser from '@/hooks/use-archive-managed-user';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import useRestoreManagedUser from '@/hooks/use-restore-managed-user';

const ChildAccountsPage = () => {
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const profileQuery = useLoggedInUser();
  const archiveMutation = useArchiveManagedUser();
  const restoreMutation = useRestoreManagedUser();

  const allDrafts: ManagedUserDraftAll[] =
    profileQuery.data?.data?.managedAccountsViewAll ?? [];
  const activeDrafts = allDrafts.filter((d) => !d.archivedAt);
  const archivedDrafts = allDrafts.filter((d) => Boolean(d.archivedAt));

  const confirmArchiveOpen = archivingId !== null;

  const handleConfirmArchive = () => {
    if (!archivingId) return;
    setActionError(null);
    archiveMutation.mutate(archivingId, {
      onSuccess: () => {
        setArchivingId(null);
      },
      onError: (err) => {
        setActionError(
          err.message ?? 'Failed to archive manageduser. Please try again.',
        );
        setArchivingId(null);
      },
    });
  };

  const handleCancelArchive = () => {
    if (archiveMutation.isPending) return;
    setArchivingId(null);
  };

  const handleRestore = (managedUserId: string) => {
    setActionError(null);
    restoreMutation.mutate(managedUserId, {
      onError: (err) => {
        setActionError(
          err.message ?? 'Failed to restore manageduser. Please try again.',
        );
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Child Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage household managedusers for your sidebar and curriculum.
          </p>
        </div>
        <Button onClick={() => setAddSheetOpen(true)}>Add ManagedUser</Button>
      </div>

      {actionError && (
        <div
          role="alert"
          className="rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {actionError}
        </div>
      )}

      {profileQuery.isLoading && (
        <div aria-label="Loading managedusers" className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {profileQuery.isError && !profileQuery.isLoading && (
        <div
          role="alert"
          className="rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between gap-4"
        >
          <span>
            {profileQuery.error?.message ??
              'Failed to load manageduser profiles. Please try again.'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => profileQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {!profileQuery.isLoading && !profileQuery.isError && (
        <>
          <section aria-labelledby="active-managedusers-heading">
            <h2
              id="active-managedusers-heading"
              className="text-lg font-medium mb-3"
            >
              Active managedusers
            </h2>
            {activeDrafts.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <p>No managedusers added yet.</p>
                <p className="text-sm mt-1">
                  Click &quot;Add ManagedUser&quot; to create a household profile.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeDrafts.map((draft) => (
                  <ManagedUserDraftCard
                    key={draft.managedUserId}
                    draft={draft}
                    onArchive={(id) => {
                      setActionError(null);
                      setArchivingId(id);
                    }}
                    isArchiving={
                      archiveMutation.isPending &&
                      archiveMutation.variables === draft.managedUserId
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {archivedDrafts.length > 0 && (
            <section
              aria-labelledby="archived-managedusers-heading"
              className="mt-8"
            >
              <h2
                id="archived-managedusers-heading"
                className="text-lg font-medium mb-3"
              >
                Archived managedusers
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-90">
                {archivedDrafts.map((draft) => (
                  <ManagedUserDraftCard
                    key={draft.managedUserId}
                    draft={draft}
                    onRestore={handleRestore}
                    isRestoring={
                      restoreMutation.isPending &&
                      restoreMutation.variables === draft.managedUserId
                    }
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <AddManagedUserSheet open={addSheetOpen} onOpenChange={setAddSheetOpen} />

      <RemoveConfirmDialog
        open={confirmArchiveOpen}
        onConfirm={handleConfirmArchive}
        onCancel={handleCancelArchive}
        isPending={archiveMutation.isPending}
        title="Archive manageduser"
        description="Archive this manageduser? They will be hidden from the sidebar selector but you can restore them here anytime."
        confirmLabel="Archive"
      />
    </div>
  );
};

export default ChildAccountsPage;
