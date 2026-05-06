import { UserRound, X } from 'lucide-react';

import type { HouseholdStudentProfile } from '@/api/services/user.services';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar';

interface StudentSelectorProps {
  students: HouseholdStudentProfile[];
  activeStudent: HouseholdStudentProfile | null;
  onSelect: (student: HouseholdStudentProfile | null) => void;
  isLoading?: boolean;
}

/**
 * Derives up-to-2-character initials from a display name.
 * Falls back to the first two characters of the name, or "?" if empty.
 */
function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  }

  return displayName.slice(0, 2).toUpperCase() || '?';
}

export function StudentSelector({
  students,
  activeStudent,
  onSelect,
  isLoading = false,
}: StudentSelectorProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Requirements 7.2 — show skeleton while loading
  if (isLoading) {
    return <Skeleton className="h-9 w-full" />;
  }

  // Collapsed sidebar mode — show initials or UserRound icon as tooltip trigger
  // Requirements 2.8
  if (isCollapsed) {
    const triggerLabel = activeStudent
      ? getInitials(activeStudent.displayName)
      : null;

    const tooltipText = activeStudent
      ? activeStudent.displayName
      : 'Select a student';

    return (
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={tooltipText}
              className="flex size-8 items-center justify-center rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {triggerLabel ? (
                <span>{triggerLabel}</span>
              ) : (
                <UserRound className="size-4" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            align="center"
          >
            {tooltipText}
          </TooltipContent>
        </Tooltip>
        {activeStudent && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Back to my view"
                onClick={() => onSelect(null)}
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <X className="size-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
            >
              Back to my view
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  }

  // Requirements 2.6, 8.3 — no students available
  if (students.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="No students available" />
        </SelectTrigger>
        <SelectContent>
          {/* empty — disabled select has no options */}
        </SelectContent>
      </Select>
    );
  }

  // Requirements 2.3, 2.4, 2.5 — normal select with students
  return (
    <Select
      value={activeStudent?.studentDraftId ?? ''}
      onValueChange={(value) => {
        if (value === '__my_view__') {
          onSelect(null);
          return;
        }

        const student = students.find((s) => s.studentDraftId === value);
        if (student) {
          onSelect(student);
        }
      }}
    >
      <SelectTrigger className="w-full">
        {/* Requirements 2.4 — placeholder when no student selected */}
        {/* Requirements 2.3 — show displayName when student is selected */}
        <SelectValue placeholder="Select a student">
          {activeStudent ? activeStudent.displayName : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {/* Deselect option — returns to parent view */}
        {activeStudent && (
          <SelectItem value="__my_view__">
            <span className="text-muted-foreground">← My view</span>
          </SelectItem>
        )}
        {/* Requirements 2.2 — render an option for each student */}
        {students.map((student) => (
          <SelectItem
            key={student.studentDraftId}
            value={student.studentDraftId}
          >
            {student.displayName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
