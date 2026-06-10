import { useState } from 'react';
import type { HouseholdStudentDraftAll } from '@/api/services/profile.services';
import StudentDraftCard from '@/components/cards/student-draft-card';
import AddStudentSheet from '@/components/sections/add-student-sheet';
import RemoveConfirmDialog from '@/components/modals/remove-confirm-dialog';
import { Button } from '@/components/ui/button';
import useArchiveHouseholdStudent from '@/hooks/use-archive-household-student';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import useRestoreHouseholdStudent from '@/hooks/use-restore-household-student';

const ChildAccountsPage = () => {
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const profileQuery = useLoggedInUser();
  const archiveMutation = useArchiveHouseholdStudent();
  const restoreMutation = useRestoreHouseholdStudent();

  const allDrafts: HouseholdStudentDraftAll[] =
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
          err.message ?? 'Failed to archive student. Please try again.',
        );
        setArchivingId(null);
      },
    });
  };

  const handleCancelArchive = () => {
    if (archiveMutation.isPending) return;
    setArchivingId(null);
  };

  const handleRestore = (studentId: string) => {
    setActionError(null);
    restoreMutation.mutate(studentId, {
      onError: (err) => {
        setActionError(
          err.message ?? 'Failed to restore student. Please try again.',
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
            Manage household students for your sidebar and curriculum.
          </p>
        </div>
        <Button onClick={() => setAddSheetOpen(true)}>Add Student</Button>
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
        <div
          aria-label="Loading students"
          className="flex flex-col gap-4"
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-lg bg-muted animate-pulse"
            />
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
              'Failed to load student profiles. Please try again.'}
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
          <section aria-labelledby="active-students-heading">
            <h2
              id="active-students-heading"
              className="text-lg font-medium mb-3"
            >
              Active students
            </h2>
            {activeDrafts.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <p>No students added yet.</p>
                <p className="text-sm mt-1">
                  Click &quot;Add Student&quot; to create a household profile.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeDrafts.map((draft) => (
                  <StudentDraftCard
                    key={draft.studentId}
                    draft={draft}
                    onArchive={(id) => {
                      setActionError(null);
                      setArchivingId(id);
                    }}
                    isArchiving={
                      archiveMutation.isPending &&
                      archiveMutation.variables === draft.studentId
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {archivedDrafts.length > 0 && (
            <section
              aria-labelledby="archived-students-heading"
              className="mt-8"
            >
              <h2
                id="archived-students-heading"
                className="text-lg font-medium mb-3"
              >
                Archived students
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-90">
                {archivedDrafts.map((draft) => (
                  <StudentDraftCard
                    key={draft.studentId}
                    draft={draft}
                    onRestore={handleRestore}
                    isRestoring={
                      restoreMutation.isPending &&
                      restoreMutation.variables === draft.studentId
                    }
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <AddStudentSheet
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
      />

      <RemoveConfirmDialog
        open={confirmArchiveOpen}
        onConfirm={handleConfirmArchive}
        onCancel={handleCancelArchive}
        isPending={archiveMutation.isPending}
        title="Archive student"
        description="Archive this student? They will be hidden from the sidebar selector but you can restore them here anytime."
        confirmLabel="Archive"
      />
    </div>
  );
};

export default ChildAccountsPage;
