# Design Document: Sidebar Student Selection

## Overview

This feature enhances the `PrivateAppSidebar` component to support selecting a
student from the authenticated user's `householdStudents` list. The selected
student drives which navigation tabs appear and is persisted across page reloads
via `localStorage`.

The implementation is entirely within the React/TanStack Router frontend
(`tanstack-router/src/`). It introduces:

1. A `StudentContext` (React Context + provider + hook) that owns the active
   student state and its `localStorage` persistence.
2. A `StudentSelector` UI component rendered in the sidebar footer.
3. Dual navigation mode in `PrivateAppSidebar`:
   - **Parent view** (no student selected): shows Dashboard, Class Requests,
     Schedule, and My Subjects nav tabs.
   - **Student view** (student selected): shows Curriculum and Compliance nav
     tabs plus a "Back to my view" control.
4. Five new route files: `_private.curriculum.tsx`, `_private.compliance.tsx`,
   `_private.class-requests.tsx`, `_private.schedule.tsx`, and
   `_private.my-subjects.tsx`.

No new backend endpoints are required. The feature reuses the existing
`['user', 'me']` TanStack Query result which already returns
`householdStudents`.

---

## Architecture

### Component Tree (after this feature)

```
App
└── RouterProvider
    └── /(private)/_private  (Private Layout — RouteComponent)
        ├── StudentProvider          ← NEW: wraps the entire private layout
        │   ├── SidebarProvider
        │   │   ├── PrivateAppSidebar  ← MODIFIED
        │   │   │   ├── SidebarHeader  (unchanged)
        │   │   │   ├── SidebarContent
        │   │   │   │   └── NavSection  ← NEW: parent nav OR student nav
        │   │   │   └── SidebarFooter
        │   │   │       ├── StudentSelector  ← NEW
        │   │   │       └── UserPopover  (existing account menu)
        │   │   └── SidebarInset
        │   │       └── <Outlet />  (Curriculum / Compliance / parent routes)
        │   └── ...
```

### Data Flow

```
['user', 'me'] query
        │
        ▼
  StudentProvider
  ├── students = data?.householdStudents ?? []
  ├── activeStudent (state, restored from localStorage on mount)
  └── setActiveStudent (writes state + localStorage)
        │
        ├──► PrivateAppSidebar reads { activeStudent, students }
        │         ├── activeStudent === null → <ParentNavTabs />
        │         │     (Dashboard, Class Requests, Schedule, My Subjects)
        │         └── activeStudent !== null → <StudentNavTabs />
        │               (Curriculum, Compliance + "Back to my view")
        │
        └──► CurriculumRoute / ComplianceRoute read { activeStudent }
                  └── use activeStudent.studentDraftId in query keys
```

### localStorage Persistence Flow

```
Mount StudentProvider
        │
        ├── read localStorage.getItem('activeStudentDraftId')
        │
        ├── ['user', 'me'] query loading → activeStudent = null, students = []
        │
        └── ['user', 'me'] query resolved
                  ├── storedId found AND matches a student
                  │       └── setActiveStudent(matchingStudent)
                  └── storedId not found OR no match
                          └── remove 'activeStudentDraftId', activeStudent = null
```

---

## Components and Interfaces

### StudentContext

**File:** `src/contexts/student-context.tsx`

```typescript
import type { HouseholdStudentProfile } from '@/api/services/user.services';

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
```

### StudentProvider

**File:** `src/contexts/student-context.tsx` (same file as context)

The provider:

- Calls `useLoggedInUser()` to get the `['user', 'me']` query result.
- Derives `students` from `data?.data?.householdStudents ?? []`.
- On mount (after query resolves), reads
  `localStorage.getItem('activeStudentDraftId')` and attempts to restore the
  matching student.
- Exposes `setActiveStudent` which writes to both React state and
  `localStorage`.
- Cleans up stale `localStorage` entries when the stored ID no longer matches
  any student.

```typescript
const STORAGE_KEY = 'activeStudentDraftId';

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const { data: userRes, isLoading } = useLoggedInUser();
  const students = userRes?.data?.householdStudents ?? [];

  const [activeStudent, setActiveStudentState] =
    React.useState<HouseholdStudentProfile | null>(null);

  // Restore from localStorage once students are available
  React.useEffect(() => {
    if (isLoading) return;
    const storedId = localStorage.getItem(STORAGE_KEY);
    if (!storedId) return;
    const match = students.find((s) => s.studentDraftId === storedId) ?? null;
    if (match) {
      setActiveStudentState(match);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setActiveStudentState(null);
    }
  }, [isLoading, students]);

  const queryClient = useQueryClient();

  const setActiveStudent = React.useCallback(
    (student: HouseholdStudentProfile | null) => {
      // Invalidate student-scoped queries for the previous student
      if (activeStudent && student?.studentDraftId !== activeStudent.studentDraftId) {
        void queryClient.invalidateQueries({
          queryKey: ['student', activeStudent.studentDraftId],
        });
      }
      setActiveStudentState(student);
      if (student) {
        localStorage.setItem(STORAGE_KEY, student.studentDraftId);
      } else {
        localStorage.removeItem(STORAGE_KEY);
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
```

**Design decision:** The provider is placed inside `RouteComponent` in
`_private.tsx`, wrapping `SidebarProvider` and `SidebarInset`. This ensures
every private route (including Curriculum and Compliance) has access to the
context without prop drilling.

### StudentSelector Component

**File:** `src/components/student-selector.tsx`

Uses the shadcn/ui `Select` primitive (via `@radix-ui/react-select`, already
available through `radix-ui` in the project) to render a dropdown of students.

```typescript
interface StudentSelectorProps {
  students: HouseholdStudentProfile[];
  activeStudent: HouseholdStudentProfile | null;
  onSelect: (student: HouseholdStudentProfile | null) => void;
  isLoading?: boolean;
}
```

Rendering rules:

- `isLoading === true` → render a `<Skeleton>` (already in the UI library).
- `students.length === 0` → render a disabled select with "No students
  available".
- `activeStudent === null` → show placeholder text "Select a student".
- `activeStudent !== null` → show `activeStudent.displayName` as selected value,
  and include a "← My view" option at the top of the dropdown that calls
  `onSelect(null)`.
- In collapsed sidebar mode (`state === 'collapsed'` from `useSidebar()`):
  - Show the active student's initials (or a `UserRound` icon if none selected)
    as a `Tooltip` trigger.
  - When a student is active, also show a small `×` button with a "Back to my
    view" tooltip that calls `onSelect(null)`.

### PrivateAppSidebar Changes

**File:** `src/components/private-app-sidebar.tsx`

The existing `navItems` array and static nav rendering are replaced with
dual-mode conditional logic:

```typescript
// Add inside the component:
const { activeStudent, students, setActiveStudent, isLoading } = useStudent();

// Two nav arrays:
const studentNavTabs = [
  { to: '/curriculum', label: 'Curriculum', icon: BookOpen },
  { to: '/compliance', label: 'Compliance', icon: ClipboardCheck },
];

const parentNavTabs = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/class-requests', label: 'Class Requests', icon: Users },
  { to: '/schedule', label: 'Schedule', icon: Calendar },
  { to: '/my-subjects', label: 'My Subjects', icon: GraduationCap },
];
```

**Student view** (when `activeStudent !== null`):

- Renders a `<SidebarGroup>` with a "← Back to my view" button in the group
  label that calls `setActiveStudent(null)`.
- Renders `studentNavTabs` (Curriculum, Compliance) with the existing `isActive`
  pattern.

**Parent view** (when `activeStudent === null`):

- Renders a `<SidebarGroup>` with `parentNavTabs`.
- Dashboard uses exact pathname match (`pathname === '/'`); all others use
  prefix match (`pathname.startsWith(to + '/')`).

Active state detection:

```typescript
// Dashboard — exact match only
isActive={pathname === '/'}

// All other tabs
isActive={pathname === to || pathname.startsWith(`${to}/`)}
```

In `SidebarFooter`, `<StudentSelector>` is placed above the existing user
popover `<SidebarMenuItem>`.

---

## New Route Files

### Curriculum Route

**File:** `src/routes/(private)/_private.curriculum.tsx`

Student-scoped route. Reads `activeStudent` from `StudentContext` and displays
the student's `displayName`. Future queries use key
`['student', activeStudent.studentDraftId, 'curriculum']`.

### Compliance Route

**File:** `src/routes/(private)/_private.compliance.tsx`

Student-scoped route. Reads `activeStudent` from `StudentContext` and displays
the student's `displayName`. Renders placeholder sections for Hours Tracking,
Progress Reports, and State Requirement Tracking. Future queries use key
`['student', activeStudent.studentDraftId, 'compliance']`.

### Class Requests Route

**File:** `src/routes/(private)/_private.class-requests.tsx`

Parent-scoped route at `/class-requests`. Renders a "Coming soon" placeholder.

### Schedule Route

**File:** `src/routes/(private)/_private.schedule.tsx`

Parent-scoped route at `/schedule`. Renders a "Coming soon" placeholder.

### My Subjects Route

**File:** `src/routes/(private)/_private.my-subjects.tsx`

Parent-scoped route at `/my-subjects`. Renders a "Coming soon" placeholder.

---

### Private Layout Changes

**File:** `src/routes/(private)/_private.tsx`

Wrap the existing `SidebarProvider` + content with `StudentProvider`:

```tsx
return (
  <StudentProvider>
    <SidebarProvider>
      {isSettingsShell ? <SettingsShellSidebar /> : <PrivateAppSidebar />}
      <SidebarInset>...</SidebarInset>
    </SidebarProvider>
  </StudentProvider>
);
```

`StudentProvider` wraps `SidebarProvider` so that `PrivateAppSidebar` can call
`useStudent()` inside a component that is already a child of `SidebarProvider`.

---

## Data Models

### HouseholdStudentProfile (existing)

```typescript
// src/api/services/user.services.ts — already defined
export type HouseholdStudentProfile = {
  studentDraftId: string; // unique identifier, used as localStorage key value
  displayName: string; // shown in selector and route pages
  currentGrade: number; // available for future use in route pages
  lastPromotionYear: number; // available for future use in route pages
};
```

### localStorage Schema

| Key                    | Type     | Description                                                                                             |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `activeStudentDraftId` | `string` | The `studentDraftId` of the last selected student. Absent when no student is selected or after cleanup. |

### Student-Scoped Query Key Convention

Route components that fetch student-specific data use the following query key
pattern:

```typescript
queryKey: ['student', activeStudent.studentDraftId, 'curriculum'];
queryKey: ['student', activeStudent.studentDraftId, 'compliance'];
```

When `setActiveStudent` is called with a different student, the provider
invalidates all queries matching `['student', previousStudentDraftId]`.

---

## New Route Files

### Curriculum Route

**File:** `src/routes/(private)/_private.curriculum.tsx`

```typescript
export const Route = createFileRoute('/(private)/_private/curriculum')({
  head: () => ({
    meta: [{ title: 'Curriculum | Cody Lillywhite' }],
  }),
  component: CurriculumRoute,
});

function CurriculumRoute() {
  const { activeStudent } = useStudent();

  // Re-renders automatically when activeStudent changes (React context)
  return (
    <div className="p-2">
      <h2 className="text-2xl font-bold">Curriculum</h2>
      {activeStudent && (
        <p className="text-muted-foreground">
          Viewing curriculum for {activeStudent.displayName}
        </p>
      )}
      {/* Future: fetch curriculum data using activeStudent.studentDraftId */}
    </div>
  );
}
```

### Compliance Route

**File:** `src/routes/(private)/_private.compliance.tsx`

```typescript
export const Route = createFileRoute('/(private)/_private/compliance')({
  head: () => ({
    meta: [{ title: 'Compliance | Cody Lillywhite' }],
  }),
  component: ComplianceRoute,
});

function ComplianceRoute() {
  const { activeStudent } = useStudent();

  return (
    <div className="p-2">
      <h2 className="text-2xl font-bold">Compliance</h2>
      {activeStudent && (
        <p className="text-muted-foreground">
          Viewing compliance for {activeStudent.displayName}
        </p>
      )}
      <div className="mt-6 grid gap-4">
        <section>
          <h3 className="font-semibold">Hours Tracking</h3>
          <p className="text-muted-foreground text-sm">Coming soon</p>
        </section>
        <section>
          <h3 className="font-semibold">Progress Reports</h3>
          <p className="text-muted-foreground text-sm">Coming soon</p>
        </section>
        <section>
          <h3 className="font-semibold">State Requirement Tracking</h3>
          <p className="text-muted-foreground text-sm">Coming soon</p>
        </section>
      </div>
    </div>
  );
}
```

---

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all
valid executions of a system — essentially, a formal statement about what the
system should do. Properties serve as the bridge between human-readable
specifications and machine-verifiable correctness guarantees._

This feature contains pure logic functions (student lookup, localStorage
persistence, context derivation) that are well-suited to property-based testing.
The PBT library used is **fast-check**, which integrates cleanly with Vitest.

### Property Reflection

Before listing properties, redundancies are resolved:

- **1.6 and 7.1** both describe the same localStorage restoration round-trip.
  Merged into Property 1.
- **1.7 and 8.1** both describe stale-ID cleanup. Merged into Property 2.
- **3.3 and 3.4** are two sides of the same conditional rendering invariant.
  Merged into Property 3.
- **4.3 and 5.3** are the same active-state pattern for two routes. Merged into
  Property 5.
- **4.4 and 5.4** are the same displayName rendering pattern for two routes.
  Merged into Property 6.
- **4.5 and 5.6** are the same student-change re-render pattern. Merged into
  Property 7.
- **6.2** (query key includes studentDraftId) is a sub-property of Property 6
  and Property 7. Kept as Property 8 for explicit traceability.

---

### Property 1: localStorage persistence round-trip

_For any_ `HouseholdStudentProfile` in the students list, if that student's
`studentDraftId` is stored in `localStorage` under `activeStudentDraftId` before
the `StudentProvider` mounts (simulating a page reload), then once the
`['user', 'me']` query resolves with that student in the list, `activeStudent`
in the context SHALL equal that student.

**Validates: Requirements 1.6, 7.1, 7.3**

---

### Property 2: Stale localStorage ID is cleaned up

_For any_ string that is not the `studentDraftId` of any student in the resolved
`householdStudents` list, if that string is stored in `localStorage` under
`activeStudentDraftId` before the provider mounts, then after the query
resolves, `activeStudent` SHALL be `null` and
`localStorage.getItem('activeStudentDraftId')` SHALL return `null`.

**Validates: Requirements 1.7, 8.1**

---

### Property 3: Nav tabs appear if and only if a student is active

_For any_ `HouseholdStudentProfile | null` value of `activeStudent`, the sidebar
SHALL render the Curriculum and Compliance nav tabs if and only if
`activeStudent` is non-null. When `activeStudent` is `null`, the
`PlaceholderState` SHALL be rendered and no nav tab links SHALL be present.

**Validates: Requirements 3.1, 3.3, 3.4, 3.5**

---

### Property 4: setActiveStudent persists to localStorage

_For any_ `HouseholdStudentProfile`, calling `setActiveStudent(profile)` SHALL
result in `activeStudent === profile` in the context AND
`localStorage.getItem('activeStudentDraftId') === profile.studentDraftId`.

**Validates: Requirements 1.4**

---

### Property 5: Nav tab active state matches current pathname

_For any_ active student and any pathname that equals `/curriculum` or
`/compliance` (or starts with those paths), the corresponding nav tab SHALL have
`isActive === true` and the other tab SHALL have `isActive === false`.

**Validates: Requirements 4.3, 5.3**

---

### Property 6: Route pages display the active student's displayName

_For any_ `HouseholdStudentProfile` set as `activeStudent`, both the
`CurriculumRoute` and `ComplianceRoute` components SHALL render a string
containing that student's `displayName`.

**Validates: Requirements 4.4, 5.4**

---

### Property 7: Student switch updates route page content

_For any_ two distinct `HouseholdStudentProfile` objects A and B, switching
`activeStudent` from A to B SHALL cause the route page to display B's
`displayName` and no longer display A's `displayName` (when the names differ).

**Validates: Requirements 4.5, 5.6, 6.3**

---

### Property 8: Student-scoped query keys include studentDraftId

_For any_ `HouseholdStudentProfile` set as `activeStudent`, any TanStack Query
call made by `CurriculumRoute` or `ComplianceRoute` SHALL include
`activeStudent.studentDraftId` in its query key array.

**Validates: Requirements 6.2**

---

### Property 9: StudentSelector always visible

_For any_ value of `activeStudent` (null or a `HouseholdStudentProfile`), the
`StudentSelector` component SHALL be present in the rendered sidebar DOM.

**Validates: Requirements 2.7**

---

### Property 10: StudentSelector renders all student options

_For any_ non-empty array of `HouseholdStudentProfile` objects, the
`StudentSelector` SHALL render a selectable option for each student, identified
by that student's `displayName`.

**Validates: Requirements 2.2**

---

### Property 11: Selecting a student calls setActiveStudent with the correct profile

_For any_ student in the `students` list, simulating a selection of that student
in the `StudentSelector` SHALL call `setActiveStudent` with that exact
`HouseholdStudentProfile` object (matched by `studentDraftId`).

**Validates: Requirements 2.5**

---

### Property 12: students array mirrors householdStudents from query

_For any_ array of `HouseholdStudentProfile` objects returned as
`householdStudents` in the `['user', 'me']` query result, the `students` value
exposed by `StudentContext` SHALL equal that array (same elements, same order).

**Validates: Requirements 1.2**

---

## Error Handling

| Scenario                                                         | Behavior                                                                                                             |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `['user', 'me']` query loading                                   | `students = []`, `activeStudent = null`, `isLoading = true`. `StudentSelector` renders a `<Skeleton>`.               |
| `['user', 'me']` query error                                     | Same as loading — `students = []`, `activeStudent = null`. The existing error handling in `useLoggedInUser` applies. |
| `householdStudents` is `undefined` or absent                     | Treated as empty array via `?? []`.                                                                                  |
| Stored `activeStudentDraftId` does not match any student         | `activeStudent` set to `null`, stale key removed from `localStorage`.                                                |
| `householdStudents` becomes empty after a data refresh           | `activeStudent` set to `null` (via the `useEffect` dependency on `students`), stale key removed.                     |
| `useStudent()` called outside `StudentProvider`                  | Throws `Error('useStudent must be used within StudentProvider')`.                                                    |
| `localStorage` unavailable (e.g., private browsing restrictions) | `try/catch` around all `localStorage` calls; falls back to in-memory state only.                                     |

---

## Testing Strategy

### Unit Tests (Vitest, `src/**/*.test.ts`)

The project uses Vitest with `environment: 'node'` for `.test.ts` files. Pure
logic functions extracted from the context (e.g., the student lookup/restore
logic) can be tested as plain TypeScript functions.

- **`src/lib/student-storage.test.ts`** — tests for the pure helper functions:
  - `findStudentById(students, id)` — returns matching student or null
  - `resolveActiveStudent(students, storedId)` — returns student or null, with
    side-effect-free logic extracted for testability

Unit tests focus on:

- Specific examples (empty list, single student, multiple students)
- Edge cases (null storedId, whitespace storedId, storedId not in list)

### Property-Based Tests (fast-check + Vitest)

**Library:** `fast-check` (to be added as a dev dependency).

Each property test runs a minimum of 100 iterations. Tests are tagged with a
comment referencing the design property.

**File:** `src/lib/student-storage.test.ts` (for pure logic properties)

```typescript
// Feature: sidebar-student-selection, Property 1: localStorage persistence round-trip
fc.assert(
  fc.property(
    arbitraryStudentList(),
    arbitraryStudentFromList(),
    (students, student) => {
      const result = findStudentById(students, student.studentDraftId);
      return result?.studentDraftId === student.studentDraftId;
    },
  ),
  { numRuns: 100 },
);
```

Properties 1, 2, 4, 12 are pure-function properties testable without React
rendering. Properties 3, 5, 6, 7, 8, 9, 10, 11 involve React component rendering
and are tested using `@testing-library/react` with a mocked `useLoggedInUser`
hook.

### Integration Tests

- Verify `StudentProvider` is mounted inside the private layout by rendering the
  full `RouteComponent` with a mocked router context and asserting
  `useStudent()` does not throw.
- Verify the `['user', 'me']` query invalidation is triggered when
  `setActiveStudent` is called with a different student.

### Storybook Stories

- `private-app-sidebar.stories.tsx` — add stories for:
  - No students (empty state in selector, parent nav tabs visible)
  - Students available, none selected (parent nav tabs visible)
  - Students available, one selected (student nav tabs + "Back to my view")
  - Loading state (skeleton in selector)
  - Collapsed sidebar with active student (initials + × button)
