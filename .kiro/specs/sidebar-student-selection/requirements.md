# Requirements Document

## Introduction

The sidebar-student-selection feature enhances the existing `PrivateAppSidebar`
component in the TanStack Router frontend to support selecting a student from
the authenticated user's `householdStudents` list and dynamically updating the
available navigation options based on the selected student context.

The sidebar has two distinct navigation modes:

- **Parent view** (no student selected): shows the parent's own navigation tabs
  — Dashboard, Class Requests, Schedule, and My Subjects. This is the default
  state on first load and whenever the user explicitly returns to their own
  view.
- **Student view** (student selected): shows student-scoped navigation tabs —
  Curriculum and Compliance — along with a "Back to my view" control to return
  to the parent view.

The student selector is anchored to the sidebar footer. When a student is
active, the selector also exposes a way to deselect and return to the parent
view. The selected student is persisted in `localStorage` so the selection
survives page reloads.

The feature is implemented entirely in the React/TanStack Router frontend
(`tanstack-router/`). It uses TanStack Query for server state (the existing
`['user', 'me']` query that already returns `householdStudents`) and React
Context for sharing the active student selection across the component tree.

---

## Glossary

- **Sidebar**: The `PrivateAppSidebar` React component rendered inside the
  `/(private)/_private` layout route.
- **Student_Selector**: The UI control anchored to the bottom section of the
  Sidebar that lists available students and allows the user to pick one or
  return to the parent view.
- **Active_Student**: The currently selected `HouseholdStudentProfile` entry,
  stored in the `StudentContext` and persisted to `localStorage`.
- **StudentContext**: A React Context (with accompanying provider and hook) that
  holds `activeStudent`, `setActiveStudent`, and the full `students` list
  derived from the `['user', 'me']` TanStack Query result.
- **HouseholdStudentProfile**: The existing TypeScript type in
  `user.services.ts` with fields `studentDraftId`, `displayName`,
  `currentGrade`, and `lastPromotionYear`.
- **Parent_Nav_Tabs**: The four navigation items shown when no student is
  selected — Dashboard, Class Requests, Schedule, and My Subjects.
- **Student_Nav_Tabs**: The two navigation items shown when a student is
  selected — Curriculum and Compliance.
- **Curriculum_Route**: The TanStack Router file route at
  `/(private)/_private.curriculum` that renders curriculum content scoped to the
  Active_Student.
- **Compliance_Route**: The TanStack Router file route at
  `/(private)/_private.compliance` that renders compliance content scoped to the
  Active_Student.
- **Parent_View**: The sidebar state when no Active_Student is selected, showing
  the Parent_Nav_Tabs.
- **Student_View**: The sidebar state when an Active_Student is selected,
  showing the Student_Nav_Tabs and a "Back to my view" control.
- **Empty_State**: The UI shown in the Student_Selector when `householdStudents`
  is empty or absent, indicating no students are available.
- **localStorage**: Browser persistent storage used to persist the
  `activeStudentDraftId` key across page reloads.
- **Private_Layout**: The `/(private)/_private` TanStack Router layout route
  that wraps all protected pages and renders the Sidebar.

---

## Requirements

### Requirement 1: Student Context Provider

**User Story:** As a developer, I want a shared React Context that holds the
active student selection, so that the Sidebar and route components can all read
and update the same student state without prop drilling.

#### Acceptance Criteria

1. THE StudentContext SHALL expose `activeStudent` (type
   `HouseholdStudentProfile | null`), `setActiveStudent` (a setter function),
   and `students` (type `HouseholdStudentProfile[]`).
2. THE StudentContext provider SHALL derive `students` from the
   `householdStudents` field of the `['user', 'me']` TanStack Query result.
3. WHEN the `['user', 'me']` query has not yet resolved, THE StudentContext
   SHALL expose an empty `students` array and a `null` `activeStudent`.
4. WHEN `setActiveStudent` is called with a `HouseholdStudentProfile`, THE
   StudentContext SHALL update `activeStudent` and persist the student's
   `studentDraftId` to `localStorage` under the key `activeStudentDraftId`.
5. WHEN `setActiveStudent` is called with `null`, THE StudentContext SHALL clear
   `activeStudent` and remove the `activeStudentDraftId` key from
   `localStorage`.
6. WHEN the StudentContext provider mounts and `localStorage` contains a valid
   `activeStudentDraftId`, THE StudentContext SHALL restore `activeStudent` to
   the matching entry from `students` once the `['user', 'me']` query resolves.
7. IF the `activeStudentDraftId` stored in `localStorage` does not match any
   entry in the resolved `students` list, THEN THE StudentContext SHALL set
   `activeStudent` to `null` and remove the stale `activeStudentDraftId` from
   `localStorage`.
8. THE StudentContext provider SHALL be mounted inside the `Private_Layout`
   component so that all private routes have access to the context.

---

### Requirement 2: Student Selector UI

**User Story:** As a parent or guardian, I want a student selector anchored to
the bottom of the sidebar, so that I can switch between my household's students
without leaving the current page, and return to my own view when needed.

#### Acceptance Criteria

1. THE Student_Selector SHALL be rendered in the `SidebarFooter` section of the
   Sidebar, visually separated from the navigation items above it.
2. WHEN `students` contains one or more entries, THE Student_Selector SHALL
   render each student as a selectable option identified by `displayName`.
3. WHEN an Active_Student is set, THE Student_Selector SHALL display the
   Active_Student's `displayName` as the currently selected value.
4. WHEN no Active_Student is set, THE Student_Selector SHALL display a prompt
   such as "Select a student".
5. WHEN a user selects a student from the Student_Selector, THE Sidebar SHALL
   call `setActiveStudent` with the corresponding `HouseholdStudentProfile`.
6. WHEN `students` is empty, THE Student_Selector SHALL render an Empty_State
   message (e.g., "No students available") and SHALL be non-interactive.
7. THE Student_Selector SHALL remain visible in the Sidebar regardless of
   whether an Active_Student is set.
8. WHERE the Sidebar is in collapsed (icon-only) mode, THE Student_Selector
   SHALL display the Active_Student's initials or a person icon as a tooltip
   trigger, preserving the collapsed layout.
9. WHEN an Active_Student is set, THE Student_Selector SHALL expose a way to
   deselect the current student (e.g., a "← My view" option in the dropdown or
   an `×` button in collapsed mode) that calls `setActiveStudent(null)` and
   returns the Sidebar to the Parent_View.

---

### Requirement 3: Conditional Navigation Display

**User Story:** As a parent or guardian, I want the sidebar to show my own
navigation when no student is selected, and switch to student-scoped navigation
once I pick a student, so the interface always reflects the current context.

#### Acceptance Criteria

1. WHEN no Active_Student is set, THE Sidebar SHALL render the Parent_Nav_Tabs
   (Dashboard, Class Requests, Schedule, My Subjects) in the navigation area.
2. THE Parent_Nav_Tabs SHALL each link to their respective routes and SHALL
   render in an active/highlighted state when the current pathname matches.
3. WHEN an Active_Student is set, THE Sidebar SHALL render exactly two
   Student_Nav_Tabs: Curriculum and Compliance.
4. WHEN an Active_Student is set, THE Sidebar SHALL NOT render the
   Parent_Nav_Tabs.
5. WHEN an Active_Student is set, THE Sidebar SHALL render a "Back to my view"
   control (e.g., in the nav group label) that calls `setActiveStudent(null)`
   and returns the Sidebar to the Parent_View.
6. WHEN `students` is empty, THE Sidebar SHALL render the Parent_Nav_Tabs (the
   parent can still navigate their own sections even with no students).
7. THE transition between Parent_View and Student_View SHALL be visually smooth.

---

### Requirement 4: Curriculum Navigation Tab

**User Story:** As a parent or guardian, I want a Curriculum tab in the sidebar,
so that I can navigate to the curriculum view for the currently selected
student.

#### Acceptance Criteria

1. WHEN an Active_Student is set, THE Sidebar SHALL render a Curriculum nav item
   that links to the Curriculum_Route.
2. WHEN a user clicks the Curriculum nav item, THE Sidebar SHALL navigate to the
   Curriculum_Route.
3. WHILE the current route matches the Curriculum_Route, THE Curriculum nav item
   SHALL be rendered in its active/highlighted state.
4. THE Curriculum_Route component SHALL read `activeStudent` from StudentContext
   and display the Active_Student's `displayName` to confirm the student scope.
5. WHEN the Active_Student changes while the user is on the Curriculum_Route,
   THE Curriculum_Route component SHALL re-render to reflect the new
   Active_Student.

---

### Requirement 5: Compliance Navigation Tab

**User Story:** As a parent or guardian, I want a Compliance tab in the sidebar,
so that I can navigate to the compliance view for the currently selected
student.

#### Acceptance Criteria

1. WHEN an Active_Student is set, THE Sidebar SHALL render a Compliance nav item
   that links to the Compliance_Route.
2. WHEN a user clicks the Compliance nav item, THE Sidebar SHALL navigate to the
   Compliance_Route.
3. WHILE the current route matches the Compliance_Route, THE Compliance nav item
   SHALL be rendered in its active/highlighted state.
4. THE Compliance_Route component SHALL read `activeStudent` from StudentContext
   and display the Active_Student's `displayName` to confirm the student scope.
5. THE Compliance_Route SHALL render placeholder sections for: hours tracking,
   progress reports, and state requirement tracking, each clearly labelled as
   the student-scoped view.
6. WHEN the Active_Student changes while the user is on the Compliance_Route,
   THE Compliance_Route component SHALL re-render to reflect the new
   Active_Student.

---

### Requirement 6: Student Change Resets Dependent Views

**User Story:** As a parent or guardian, I want the curriculum and compliance
views to refresh automatically when I switch students, so that I never see stale
data from a previously selected student.

#### Acceptance Criteria

1. WHEN `setActiveStudent` is called with a different student, THE
   StudentContext SHALL invalidate or reset any TanStack Query cache keys that
   are scoped to the previous student.
2. WHEN the Active_Student changes while the user is on the Curriculum_Route or
   Compliance_Route, THE route component SHALL re-fetch or re-render its content
   using the new Active_Student's `studentDraftId` as part of the query key.
3. WHEN the Active_Student changes, THE Sidebar Nav_Tabs SHALL remain visible
   and the user SHALL remain on the same route type (Curriculum stays on
   Curriculum, Compliance stays on Compliance).

---

### Requirement 7: Selection Persistence Across Reloads

**User Story:** As a parent or guardian, I want my student selection to be
remembered after a page reload, so that I do not have to re-select a student
every time I return to the application.

#### Acceptance Criteria

1. WHEN a user selects a student and then reloads the page, THE StudentContext
   SHALL restore the same Active_Student from `localStorage` once the
   `['user', 'me']` query resolves.
2. WHEN the `['user', 'me']` query is loading after a reload, THE Sidebar SHALL
   render a loading skeleton or disabled state for the Student_Selector rather
   than the Empty_State or Placeholder_State.
3. WHEN the `['user', 'me']` query resolves and the persisted
   `activeStudentDraftId` matches a student, THE Sidebar SHALL transition
   directly to the Nav_Tabs state without showing the Placeholder_State.

---

### Requirement 8: Invalid or Deleted Student Handling

**User Story:** As a parent or guardian, I want the sidebar to gracefully
recover if my previously selected student is no longer available, so that the
application does not get stuck in a broken state.

#### Acceptance Criteria

1. IF the `activeStudentDraftId` in `localStorage` does not match any student in
   the resolved `householdStudents` list, THEN THE StudentContext SHALL set
   `activeStudent` to `null` and remove the stale key from `localStorage`.
2. WHEN `activeStudent` is reset to `null` due to an invalid stored ID, THE
   Sidebar SHALL display the Parent_View and the Student_Selector SHALL show the
   "Select a student" prompt.
3. IF the `householdStudents` list becomes empty after a data refresh (e.g., all
   students removed), THEN THE StudentContext SHALL set `activeStudent` to
   `null` and THE Sidebar SHALL display the Empty_State in the Student_Selector.
4. WHEN `activeStudent` is reset to `null` due to an empty `householdStudents`
   list, THE Sidebar SHALL display the Parent_Nav_Tabs (the parent can still
   navigate their own sections).

---

### Requirement 9: Parent Navigation Routes

**User Story:** As a parent or guardian, I want my own navigation tabs —
Dashboard, Class Requests, Schedule, and My Subjects — always available when no
student is selected, so I can manage my own account and content independently of
any student context.

#### Acceptance Criteria

1. THE Sidebar SHALL render a Dashboard nav item linking to `/` (the index
   route) in the Parent_View.
2. THE Sidebar SHALL render a Class Requests nav item linking to
   `/class-requests` in the Parent_View.
3. THE Sidebar SHALL render a Schedule nav item linking to `/schedule` in the
   Parent_View.
4. THE Sidebar SHALL render a My Subjects nav item linking to `/my-subjects` in
   the Parent_View.
5. EACH Parent_Nav_Tab SHALL render in its active/highlighted state when the
   current pathname matches its route (Dashboard uses exact `/` match; others
   use prefix match).
6. THE routes `/class-requests`, `/schedule`, and `/my-subjects` SHALL each
   exist as TanStack Router file routes under `/(private)/_private`.
