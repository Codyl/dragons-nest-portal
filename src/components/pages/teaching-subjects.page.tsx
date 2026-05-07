import { useState } from 'react';
import CourseCard from '@/components/cards/course-card';
import AddCourseSheet from '@/components/sections/add-course-sheet';
import RemoveConfirmDialog from '@/components/modals/remove-confirm-dialog';
import RemoveWarningDialog from '@/components/modals/remove-warning-dialog';
import { Button } from '@/components/ui/button';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import useSubjects from '@/hooks/use-subjects';
import useRemoveTeachableCourse from '@/hooks/use-remove-teachable-course';
import type { TeachableCourseWithEnrollment } from '@/api/services/profile.services';

const TeachingSubjectsPage = () => {
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const profileQuery = useLoggedInUser();
  const subjectsQuery = useSubjects();
  const removeMutation = useRemoveTeachableCourse();

  const courses: TeachableCourseWithEnrollment[] =
    profileQuery.data?.data?.teachableCourses ?? [];
  const subjects = subjectsQuery.data ?? [];

  // The course currently staged for removal
  const courseBeingRemoved =
    removingIndex !== null ? courses[removingIndex] : null;
  const hasActiveEnrollments =
    courseBeingRemoved != null && courseBeingRemoved.activeEnrollmentCount > 0;

  const confirmDialogOpen = removingIndex !== null && !hasActiveEnrollments;
  const warningDialogOpen = removingIndex !== null && hasActiveEnrollments;

  const handleRemove = (index: number) => {
    setRemoveError(null);
    setRemovingIndex(index);
  };

  const handleConfirmRemove = () => {
    if (removingIndex === null) return;
    removeMutation.mutate(removingIndex, {
      onSuccess: () => {
        setRemovingIndex(null);
        setRemoveError(null);
      },
      onError: (err) => {
        setRemoveError(
          err.message ?? 'Failed to remove course. Please try again.',
        );
        setRemovingIndex(null);
      },
    });
  };

  const handleCancelRemove = () => {
    if (removeMutation.isPending) return;
    setRemovingIndex(null);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Teaching Subjects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the courses you offer to students.
          </p>
        </div>
        <Button onClick={() => setAddSheetOpen(true)}>Add Subject</Button>
      </div>

      {removeError && (
        <div
          role="alert"
          className="rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {removeError}
        </div>
      )}

      {profileQuery.isLoading && (
        <div
          aria-label="Loading courses"
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
              'Failed to load teaching subjects. Please try again.'}
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

      {!profileQuery.isLoading &&
        !profileQuery.isError &&
        courses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <p className="text-base">No teaching subjects added yet.</p>
            <p className="text-sm mt-1">
              Click "Add Subject" to add your first course offering.
            </p>
          </div>
        )}

      {!profileQuery.isLoading &&
        !profileQuery.isError &&
        courses.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
              <CourseCard
                key={index}
                course={course}
                index={index}
                subjects={subjects}
                onRemove={handleRemove}
                isRemoving={removingIndex === index && removeMutation.isPending}
              />
            ))}
          </div>
        )}

      <AddCourseSheet
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
        subjects={subjects}
      />

      <RemoveConfirmDialog
        open={confirmDialogOpen}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
        isPending={removeMutation.isPending}
      />

      <RemoveWarningDialog
        open={warningDialogOpen}
        enrollmentCount={courseBeingRemoved?.activeEnrollmentCount ?? 0}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
        isPending={removeMutation.isPending}
      />
    </div>
  );
};

export default TeachingSubjectsPage;
