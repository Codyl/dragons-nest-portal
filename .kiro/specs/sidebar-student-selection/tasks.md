# Implementation Plan: Sidebar Student Selection

## Overview

Implement student selection in the `PrivateAppSidebar` by introducing a
`StudentContext` (provider + hook), a `StudentSelector` UI component,
conditional navigation logic, and two new route files (Curriculum, Compliance).
Pure helper functions are extracted for testability and covered with unit and
property-based tests using `fast-check`.

## Tasks

- [x] 1. Install fast-check dev dependency
  - Add `fast-check` as a pinned dev dependency in
    `tanstack-router/package.json`
  - Run `pnpm install` inside `tanstack-router/` to update the lockfile
  - Verify the package resolves correctly by importing `fc` in a scratch test
  - _Requirements: (prerequisite for all PBT sub-tasks)_

- [x] 2. Create pure helper functions for student storage logic
  - Create `src/lib/student-storage.ts` exporting:
    - `findStudentById(students: HouseholdStudentProfile[], id: string | null): HouseholdStudentProfile | null`
      — returns the first student whose `studentDraftId` matches `id`, or `null`
    - `resolveActiveStudent(students: HouseholdStudentProfile[], storedId: string | null): HouseholdStudentProfile | null`
      — wraps `findStudentById`; returns `null` when `storedId` is falsy or has
      no match
  - Both functions must be pure (no side effects, no `localStorage` access)
  - Import `HouseholdStudentProfile` from `@/api/services/user.services`
  - _Requirements: 1.6, 1.7, 7.1, 8.1_

  - [x] 2.1 Write unit tests for `findStudentById` and `resolveActiveStudent`
    - Create `src/lib/student-storage.test.ts`
    - Cover: empty list, single student match, multiple students match, id not
      in list, null id, whitespace id
    - Use `describe`/`it`/`expect` pattern matching existing tests in `src/lib/`
    - _Requirements: 1.6, 1.7_

  - [x] 2.2 Write property test — Property 1: localStorage persistence
        round-trip
    - **Property 1: localStorage persistence round-trip**
    - For any student in a non-empty list,
      `findStudentById(students, student.studentDraftId)` SHALL return that
      student
    - Use `fc.array` + `fc.record` arbitraries to generate
      `HouseholdStudentProfile` lists
    - **Validates: Requirements 1.6, 7.1, 7.3**

  - [x] 2.3 Write property test — Property 2: Stale localStorage ID is cleaned
        up
    - **Property 2: Stale localStorage ID is cleaned up**
    - For any string that is not a `studentDraftId` in the list,
      `resolveActiveStudent(students, staleId)` SHALL return `null`
    - **Validates: Requirements 1.7, 8.1**

  - [x] 2.4 Write property test — Property 12: students array mirrors
        householdStudents
    - **Property 12: students array mirrors householdStudents from query**
    - For any array of `HouseholdStudentProfile` objects, `resolveActiveStudent`
      applied to each element's own id SHALL return that element
    - **Validates: Requirements 1.2**

- [x] 3. Create StudentContext, StudentProvider, and useStudent hook
  - Create `src/contexts/student-context.tsx`
  - Define `StudentContextValue` interface with `activeStudent`,
    `setActiveStudent`, `students`, `isLoading`
  - Create `StudentContext` via
    `React.createContext<StudentContextValue | null>(null)`
  - Implement `useStudent()` hook that throws if called outside the provider
  - Implement `StudentProvider` component:
    - Call `useLoggedInUser()` to get query result; derive `students` from
      `data?.data?.householdStudents ?? []`
    - Initialize `activeStudent` state as `null`
    - On mount (after query resolves), read
      `localStorage.getItem('activeStudentDraftId')` and call
      `resolveActiveStudent`; restore or clear accordingly using
      `findStudentById` / `resolveActiveStudent` from
      `src/lib/student-storage.ts`
    - Wrap all `localStorage` calls in `try/catch` to handle restricted
      environments
    - Implement `setActiveStudent` with `useCallback`: updates state,
      writes/removes `localStorage`, and calls
      `queryClient.invalidateQueries({ queryKey: ['student', previousStudentDraftId] })`
      when switching students
    - Memoize context value with `useMemo`
  - Export `StudentContext`, `StudentProvider`, `useStudent`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 6.1, 7.1, 7.2_

- [x] 4. Create StudentSelector component
  - Create `src/components/student-selector.tsx`
  - Define `StudentSelectorProps`:
    `{ students, activeStudent, onSelect: (student: HouseholdStudentProfile | null) => void, isLoading? }`
  - Rendering rules:
    - `isLoading === true` → render `<Skeleton>` from `@/components/ui/skeleton`
      (Requirements 7.2)
    - `students.length === 0` → render a disabled `<Select>` with "No students
      available" (Requirements 2.6, 8.3)
    - `activeStudent === null` → show placeholder "Select a student"
      (Requirements 2.4)
    - `activeStudent !== null` → show `activeStudent.displayName` as selected
      value, and include a "← My view" option at the top of the dropdown that
      calls `onSelect(null)` (Requirements 2.3, 2.9)
  - Use the shadcn/ui `Select` primitive from `@/components/ui/select` (already
    in the project)
  - In collapsed sidebar mode (`state === 'collapsed'` from `useSidebar()`):
    show active student's initials or a `UserRound` icon as a `Tooltip` trigger;
    when a student is active also show a small `×` button that calls
    `onSelect(null)` (Requirements 2.8, 2.9)
  - Wire `onValueChange` to call `onSelect` with the matching
    `HouseholdStudentProfile` (look up by `studentDraftId`)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 7.2_

- [x] 5. Modify PrivateAppSidebar with conditional nav, placeholder state, and
     footer selector
  - Edit `src/components/private-app-sidebar.tsx`
  - Remove the static `navItems` array and its rendering
  - Add `useStudent()` call to read
    `{ activeStudent, students, setActiveStudent, isLoading }`
  - Define `studentNavTabs` array:
    `[{ to: '/curriculum', label: 'Curriculum', icon: BookOpen }, { to: '/compliance', label: 'Compliance', icon: ClipboardCheck }]`
  - Define `parentNavTabs` array:
    `[{ to: '/', label: 'Dashboard', icon: LayoutDashboard }, { to: '/class-requests', label: 'Class Requests', icon: Users }, { to: '/schedule', label: 'Schedule', icon: Calendar }, { to: '/my-subjects', label: 'My Subjects', icon: GraduationCap }]`
  - In `SidebarContent`, replace the static nav group with conditional
    rendering:
    - `activeStudent !== null` → render `<SidebarGroup>` with a "← Back to my
      view" button in the group label (calls `setActiveStudent(null)`) and
      `studentNavTabs` below it
    - `activeStudent === null` → render `<SidebarGroup>` with `parentNavTabs`;
      Dashboard uses exact `/` match, others use prefix match
  - In `SidebarFooter`, add `<StudentSelector>` above the existing user popover
    `<SidebarMenuItem>`
  - Import `BookOpen`, `ClipboardCheck`, `ArrowLeft`, `LayoutDashboard`,
    `Users`, `Calendar`, `GraduationCap` from `lucide-react`
  - _Requirements: 2.1, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3,
    9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 6. Wrap private layout RouteComponent with StudentProvider
  - Edit `src/routes/(private)/_private.tsx`
  - Import `StudentProvider` from `@/contexts/student-context`
  - In the non-account-setup branch of `RouteComponent`, wrap
    `<SidebarProvider>` and its children with `<StudentProvider>` as the
    outermost wrapper (so `PrivateAppSidebar` can call `useStudent()` inside
    `SidebarProvider`)
  - The `isAccountSetupShell` branch does NOT need `StudentProvider`
  - _Requirements: 1.8_

- [x] 7. Checkpoint — Ensure all tests pass
  - Run `pnpm test --run` inside `tanstack-router/` and confirm all tests in
    `src/lib/student-storage.test.ts` pass
  - Fix any TypeScript or import errors surfaced by the build (`tsc -b`)
  - Ask the user if any questions arise before continuing

- [x] 8. Create Curriculum route file
  - Create `src/routes/(private)/_private.curriculum.tsx`
  - Define the route with `createFileRoute('/(private)/_private/curriculum')`
    including a `head` returning
    `{ meta: [{ title: 'Curriculum | Cody Lillywhite' }] }`
  - Implement `CurriculumRoute` component:
    - Call `useStudent()` to get `activeStudent`
    - Render an `<h2>Curriculum</h2>` heading
    - When `activeStudent` is set, render
      `<p>Viewing curriculum for {activeStudent.displayName}</p>` (Requirements
      4.4)
    - Component re-renders automatically when `activeStudent` changes via
      context (Requirements 4.5)
    - Include a comment noting future query key pattern:
      `['student', activeStudent.studentDraftId, 'curriculum']` (Requirements
      6.2)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.2_

- [x] 9. Create Compliance route file
  - Create `src/routes/(private)/_private.compliance.tsx`
  - Define the route with `createFileRoute('/(private)/_private/compliance')`
    including a `head` returning
    `{ meta: [{ title: 'Compliance | Cody Lillywhite' }] }`
  - Implement `ComplianceRoute` component:
    - Call `useStudent()` to get `activeStudent`
    - Render an `<h2>Compliance</h2>` heading
    - When `activeStudent` is set, render
      `<p>Viewing compliance for {activeStudent.displayName}</p>` (Requirements
      5.4)
    - Render three placeholder `<section>` blocks: "Hours Tracking", "Progress
      Reports", "State Requirement Tracking" — each with a "Coming soon"
      sub-text (Requirements 5.5)
    - Component re-renders automatically when `activeStudent` changes via
      context (Requirements 5.6)
    - Include a comment noting future query key pattern:
      `['student', activeStudent.studentDraftId, 'compliance']` (Requirements
      6.2)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.2_

- [x] 10. Final checkpoint — Ensure all tests pass
  - Run `pnpm test --run` inside `tanstack-router/` and confirm all tests pass
  - Run `tsc -b` inside `tanstack-router/` to confirm no TypeScript errors
  - Verify the TanStack Router route tree regenerates correctly (the plugin runs
    on build/dev start)
  - Ask the user if any questions arise before marking complete

- [x] 11. Add parent navigation and student deselect
  - Updated `src/components/private-app-sidebar.tsx`:
    - Replaced single `navTabs` with `parentNavTabs` (Dashboard, Class Requests,
      Schedule, My Subjects) and `studentNavTabs` (Curriculum, Compliance)
    - Parent view renders `parentNavTabs` when `activeStudent === null`
    - Student view renders `studentNavTabs` plus a "← Back to my view" button in
      the group label that calls `setActiveStudent(null)`
  - Updated `src/components/student-selector.tsx`:
    - `onSelect` prop type changed to
      `(student: HouseholdStudentProfile | null) => void`
    - Normal dropdown: "← My view" option at top when a student is active
    - Collapsed mode: `×` button next to initials when a student is active
  - Created `src/routes/(private)/_private.class-requests.tsx`
  - Created `src/routes/(private)/_private.schedule.tsx`
  - Created `src/routes/(private)/_private.my-subjects.tsx`
  - _Requirements: 2.9, 3.1, 3.2, 3.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 12. Add Storybook stories for sidebar states
  - Update `src/components/private-app-sidebar.stories.tsx` to add stories
    covering all sidebar states
  - Add a `StudentProvider`-aware decorator that seeds `queryClient` with
    `householdStudents` data
  - Add the following named story exports:
    - `NoStudents` — `householdStudents: []`, shows empty state in selector and
      parent nav tabs
    - `ParentView` — students present, none selected, shows parent nav tabs
      (Dashboard, Class Requests, Schedule, My Subjects)
    - `StudentSelected` — students present, one selected, shows student nav tabs
      (Curriculum, Compliance) and "Back to my view" button
    - `LoadingState` — `isLoading: true`, shows skeleton in selector
    - `CollapsedWithActiveStudent` — sidebar in collapsed mode with an active
      student (initials + × button)
  - Each story should set `parameters.initialPath` appropriately
  - _Requirements: 2.1, 2.3, 2.4, 2.6, 2.7, 2.8, 2.9, 3.1, 3.2, 3.3, 7.2, 9.1,
    9.2, 9.3, 9.4_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- `fast-check` must be installed (Task 1) before any `*` PBT sub-tasks can run
- The vitest config uses `environment: 'node'` for `.test.ts` files — pure
  helper tests in `src/lib/` run in Node without a DOM
- All `localStorage` access in `StudentProvider` must be wrapped in `try/catch`
  to handle private-browsing restrictions
- The TanStack Router file-based route tree is auto-generated; new route files
  in `src/routes/(private)/` will be picked up automatically on the next
  dev/build start
- Property tests reference design document properties by number for traceability
