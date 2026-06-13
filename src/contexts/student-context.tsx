import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { HouseholdStudentProfile } from '@/api/services/profile.services';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import { resolveActiveStudent } from '@/lib/student-storage';

const STORAGE_KEY = 'activestudentId';

export interface StudentContextValue {
  /** The currently selected student, or null if none is selected. */
  activeStudent: HouseholdStudentProfile | null;
  /** Update the active student. Pass null to deselect. */
  setActiveStudent: (student: HouseholdStudentProfile | null) => void;
  /** All students from the ['user', 'me'] query result. */
  students: HouseholdStudentProfile[];
  /** True while the ['user', 'me'] query is loading. */
  isLoading: boolean;
}

export const StudentContext = React.createContext<StudentContextValue | null>(
  null,
);

export function useStudent(): StudentContextValue {
  const ctx = React.useContext(StudentContext);
  if (!ctx) throw new Error('useStudent must be used within StudentProvider');

  return ctx;
}

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const { data: userRes, isLoading } = useLoggedInUser();
  const students: HouseholdStudentProfile[] =
    userRes?.data?.householdStudents ?? [];

  const [activeStudent, setActiveStudentState] =
    React.useState<HouseholdStudentProfile | null>(null);

  // Restore from localStorage once students are available
  React.useEffect(() => {
    if (isLoading) return;

    let storedId: string | null = null;
    try {
      storedId = localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable (e.g., private browsing restrictions)
    }

    if (!storedId) return;

    const match = resolveActiveStudent(students, storedId);
    if (match) {
      setActiveStudentState(match);
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // localStorage unavailable
      }
      setActiveStudentState(null);
    }
  }, [isLoading, students]);

  const queryClient = useQueryClient();

  const setActiveStudent = React.useCallback(
    (student: HouseholdStudentProfile | null) => {
      // Invalidate student-scoped queries for the previous student
      const previousstudentId = activeStudent?.studentId;
      if (previousstudentId && student?.studentId !== previousstudentId) {
        void queryClient.invalidateQueries({
          queryKey: ['student', previousstudentId],
        });
      }

      setActiveStudentState(student);

      try {
        if (student) {
          localStorage.setItem(STORAGE_KEY, student.studentId);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // localStorage unavailable (e.g., private browsing restrictions)
      }
    },
    [activeStudent, queryClient],
  );

  const value = React.useMemo(
    () => ({ activeStudent, setActiveStudent, students, isLoading }),
    [activeStudent, setActiveStudent, students, isLoading],
  );

  return (
    <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
  );
}
